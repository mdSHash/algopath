import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
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
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { problemId, phase, logicText } = parsed.data;

  const updated = await prisma.progress.upsert({
    where: { userId_problemId: { userId, problemId } },
    create: {
      userId,
      problemId,
      phase: phase ?? "understand",
      logicText: logicText ?? "",
    },
    update: {
      ...(phase ? { phase } : {}),
      ...(logicText !== undefined ? { logicText } : {}),
    },
  });

  return NextResponse.json({
    problemId: updated.problemId,
    phase: updated.phase,
    logicApproved: updated.logicApproved,
    logicText: updated.logicText,
    hintsUsed: updated.hintsUsed,
    solvedAt: updated.solvedAt?.toISOString() ?? null,
  });
}
