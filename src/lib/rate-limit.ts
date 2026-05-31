// Lightweight in-memory rate limiter.
//
// Per-instance state — fine for low-traffic Vercel free-tier deployments
// where there's typically one warm function instance. For higher traffic
// or stricter guarantees, swap the storage for Upstash Redis (the API
// surface stays the same).
//
// Algorithm: fixed-window counter. Each key gets a count + resetAt; when
// the window expires the count resets to 1. Simple, fast, no external deps.

import type { NextRequest } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

const STORE = new Map<string, Bucket>();

// Periodic cleanup so the Map doesn't grow forever. Runs at most every
// 60s and only sweeps expired entries.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, v] of STORE) {
    if (v.resetAt <= now) STORE.delete(k);
  }
}

export interface RateLimitConfig {
  /** Max requests allowed per window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Milliseconds until the window resets. */
  retryAfterMs: number;
  limit: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = STORE.get(key);
  if (!existing || existing.resetAt <= now) {
    STORE.set(key, { count: 1, resetAt: now + config.windowMs });
    return {
      ok: true,
      remaining: config.limit - 1,
      retryAfterMs: config.windowMs,
      limit: config.limit,
    };
  }

  if (existing.count >= config.limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterMs: existing.resetAt - now,
      limit: config.limit,
    };
  }

  existing.count++;
  return {
    ok: true,
    remaining: config.limit - existing.count,
    retryAfterMs: existing.resetAt - now,
    limit: config.limit,
  };
}

/**
 * Identify the caller for rate-limit purposes. Prefer authenticated user id
 * (already verified upstream); fall back to client IP.
 */
export function callerIdentity(req: NextRequest, userId?: string | null): string {
  if (userId) return `u:${userId}`;
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anon";
  return `ip:${ip}`;
}

/**
 * Convenience wrapper: returns a 429 Response if the rate limit is exceeded.
 * Returns null when the request should proceed.
 */
export function rateLimitResponse(
  result: RateLimitResult,
  message?: string
): Response | null {
  if (result.ok) return null;
  const retrySec = Math.max(1, Math.ceil(result.retryAfterMs / 1000));
  return new Response(
    JSON.stringify({
      error:
        message ??
        `Too many requests. Try again in ~${retrySec}s.`,
      retryAfterSec: retrySec,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retrySec),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
      },
    }
  );
}

// ─── Presets ─────────────────────────────────────────────────────────────
// Tuned for a hobby deployment: generous enough for real users, tight
// enough that an attacker can't drain Gemini/JDoodle quotas.

/** AI endpoints (review-logic, hint, review-code, analyze-code). */
export const AI_RATE: RateLimitConfig = { limit: 30, windowMs: 60_000 };

/** Code execution (run/submit). Tighter — JDoodle has a 200/day cap. */
export const EXEC_RATE: RateLimitConfig = { limit: 20, windowMs: 60_000 };

/** Auth registration. Per-IP only. */
export const REGISTER_RATE: RateLimitConfig = { limit: 5, windowMs: 60 * 60_000 };

/** Cheap progress saves (autosave + phase nav). High limit since debounced. */
export const PROGRESS_RATE: RateLimitConfig = { limit: 120, windowMs: 60_000 };
