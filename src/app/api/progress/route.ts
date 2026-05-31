import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthedUserId } from "@/lib/api-auth";
import {
  checkRateLimit,
  rateLimitResponse,
  callerIdentity,
  PROGRESS_RATE,
} from "@/lib/rate-limit";

export async function GET() {
  const userId = await getAuthedUserId();
  if (!userId) return NextResponse.json({ items: [] });
  const items = await prisma.progress.findMany({
    where: { userId },
    include: { problem: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({
    items: items.map((p) => ({
      problemId: p.problemId,
      problemSlug: p.problem.slug,
      problemTitle: p.problem.title,
      phase: p.phase,
      logicApproved: p.logicApproved,
      hintsUsed: p.hintsUsed,
      solvedAt: p.solvedAt?.toISOString() ?? null,
      updatedAt: p.updatedAt.toISOString(),
    })),
  });
}

const patchSchema = z.object({
  problemId: z.string(),
  phase: z.enum(["understand", "logic", "coding", "solved"]).optional(),
  logicText: z.string().max(20000).optional(),
  // Auto-save: code is keyed by language so each language keeps its own draft.
  code: z.string().max(60000).optional(),
  language: z.enum(["python", "javascript", "java"]).optional(),
});

function safeParseDrafts(raw: string): Record<string, string> {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

export async function PATCH(req: NextRequest) {
  const userId = await getAuthedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const limit = checkRateLimit(
    `progress:${callerIdentity(req, userId)}`,
    PROGRESS_RATE
  );
  const limitResponse = rateLimitResponse(
    limit,
    "Too many save requests in a short window."
  );
  if (limitResponse) return limitResponse;

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { problemId, phase, logicText, code, language } = parsed.data;

  // Merge a new code draft into the existing JSON map without losing other
  // languages' drafts. Read-modify-write is fine here — saves are infrequent
  // (debounced on the client) and per-user-per-problem, so contention is low.
  let mergedDrafts: Record<string, string> | undefined;
  if (code !== undefined && language) {
    const existing = await prisma.progress.findUnique({
      where: { userId_problemId: { userId, problemId } },
      select: { codeDrafts: true },
    });
    const drafts = existing ? safeParseDrafts(existing.codeDrafts) : {};
    drafts[language] = code;
    mergedDrafts = drafts;
  }

  const updated = await prisma.progress.upsert({
    where: { userId_problemId: { userId, problemId } },
    create: {
      userId,
      problemId,
      phase: phase ?? "understand",
      logicText: logicText ?? "",
      codeDrafts: mergedDrafts ? JSON.stringify(mergedDrafts) : "{}",
    },
    update: {
      ...(phase ? { phase } : {}),
      ...(logicText !== undefined ? { logicText } : {}),
      ...(mergedDrafts ? { codeDrafts: JSON.stringify(mergedDrafts) } : {}),
    },
  });

  return NextResponse.json({
    problemId: updated.problemId,
    phase: updated.phase,
    logicApproved: updated.logicApproved,
    logicText: updated.logicText,
    codeDrafts: safeParseDrafts(updated.codeDrafts),
    hintsUsed: updated.hintsUsed,
    solvedAt: updated.solvedAt?.toISOString() ?? null,
  });
}
