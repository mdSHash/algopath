export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function difficultyClasses(d: string) {
  if (d === "Easy") return "text-[#00b8a3] bg-[#00b8a3]/10 border-[#00b8a3]/30";
  if (d === "Medium") return "text-[#ffa116] bg-[#ffa116]/10 border-[#ffa116]/30";
  if (d === "Hard") return "text-[#ff375f] bg-[#ff375f]/10 border-[#ff375f]/30";
  return "text-neutral-400 bg-neutral-700/30 border-neutral-600/30";
}

export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

import type { ZodType } from "zod";

/**
 * Parse a JSON string with a fallback. Without a schema, any successfully
 * parsed value is returned as-is — including `null`, which is sometimes the
 * wrong shape (e.g., the caller wanted an array). Pass a `schema` to enforce
 * the expected shape; on validation failure the fallback is returned and a
 * one-line warning is logged so the bad row can be tracked down.
 */
export function safeJsonParse<T>(
  s: string,
  fallback: T,
  schema?: ZodType<T>
): T {
  let parsed: unknown;
  try {
    parsed = JSON.parse(s);
  } catch {
    return fallback;
  }
  if (!schema) return (parsed as T) ?? fallback;
  const result = schema.safeParse(parsed);
  if (!result.success) {
    console.warn(
      "[safeJsonParse] schema validation failed; using fallback",
      result.error.issues.slice(0, 3)
    );
    return fallback;
  }
  return result.data;
}
