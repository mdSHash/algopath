import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { safeJsonParse } from "@/lib/utils";

export async function GET() {
  const problems = await prisma.problem.findMany({
    orderBy: { number: "asc" },
  });

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const progress = userId
    ? await prisma.progress.findMany({ where: { userId } })
    : [];
  const progressByProblem = new Map(progress.map((p) => [p.problemId, p]));

  const result = problems.map((p) => {
    const prog = progressByProblem.get(p.id);
    let status: "todo" | "in-progress" | "solved" = "todo";
    if (prog) {
      if (prog.solvedAt) status = "solved";
      else if (prog.phase !== "understand") status = "in-progress";
    }
    return {
      id: p.id,
      slug: p.slug,
      number: p.number,
      title: p.title,
      difficulty: p.difficulty,
      tags: safeJsonParse<string[]>(p.tags, []),
      acceptanceRate: p.acceptanceRate,
      status,
    };
  });

  return NextResponse.json(result);
}
