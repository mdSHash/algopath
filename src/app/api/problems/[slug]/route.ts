import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthedUserId } from "@/lib/api-auth";
import { safeJsonParse } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const problem = await prisma.problem.findUnique({ where: { slug } });
  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  const userId = await getAuthedUserId();

  const progress = userId
    ? await prisma.progress.findUnique({
        where: { userId_problemId: { userId, problemId: problem.id } },
      })
    : null;

  return NextResponse.json({
    problem: {
      id: problem.id,
      slug: problem.slug,
      number: problem.number,
      title: problem.title,
      difficulty: problem.difficulty,
      description: problem.description,
      examples: safeJsonParse(problem.examples, []),
      constraints: safeJsonParse<string[]>(problem.constraints, []),
      tags: safeJsonParse<string[]>(problem.tags, []),
      hints: safeJsonParse<string[]>(problem.hints, []),
      starterCode: safeJsonParse(problem.starterCode, {
        python: "",
        javascript: "",
        java: "",
      }),
      testCases: safeJsonParse(problem.testCases, []),
      acceptanceRate: problem.acceptanceRate,
    },
    progress: progress
      ? {
          phase: progress.phase,
          logicApproved: progress.logicApproved,
          logicText: progress.logicText,
          hintsUsed: progress.hintsUsed,
          solvedAt: progress.solvedAt?.toISOString() ?? null,
        }
      : null,
  });
}
