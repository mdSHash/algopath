import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { safeJsonParse } from "@/lib/utils";
import type { ProblemDTO, ProgressDTO, Difficulty } from "@/types";

export const dynamic = "force-dynamic";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const problem = await prisma.problem.findUnique({ where: { slug } });
  if (!problem) notFound();

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const progressRow = userId
    ? await prisma.progress.findUnique({
        where: { userId_problemId: { userId, problemId: problem.id } },
      })
    : null;

  const dto: ProblemDTO = {
    id: problem.id,
    slug: problem.slug,
    number: problem.number,
    title: problem.title,
    difficulty: problem.difficulty as Difficulty,
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
  };

  const progress: ProgressDTO | null = progressRow
    ? {
        problemId: progressRow.problemId,
        phase: progressRow.phase as ProgressDTO["phase"],
        logicApproved: progressRow.logicApproved,
        logicText: progressRow.logicText,
        codeDrafts: safeJsonParse<ProgressDTO["codeDrafts"]>(
          progressRow.codeDrafts,
          {}
        ),
        hintsUsed: progressRow.hintsUsed,
        solvedAt: progressRow.solvedAt?.toISOString() ?? null,
      }
    : null;

  return <WorkspaceShell problem={dto} initialProgress={progress} />;
}
