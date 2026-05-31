import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProblemTable } from "@/components/problems/ProblemTable";
import { safeJsonParse } from "@/lib/utils";
import type { ProblemListItem, Difficulty } from "@/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProblemsPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;

  const [problems, progress] = await Promise.all([
    prisma.problem.findMany({ orderBy: { number: "asc" } }),
    userId
      ? prisma.progress.findMany({ where: { userId } })
      : Promise.resolve([]),
  ]);

  const progressMap = new Map(progress.map((p) => [p.problemId, p]));

  const items: ProblemListItem[] = problems.map((p) => {
    const prog = progressMap.get(p.id);
    let status: ProblemListItem["status"] = "todo";
    if (prog) {
      if (prog.solvedAt) status = "solved";
      else if (prog.phase !== "understand") status = "in-progress";
    }
    return {
      id: p.id,
      slug: p.slug,
      number: p.number,
      title: p.title,
      difficulty: p.difficulty as Difficulty,
      tags: safeJsonParse<string[]>(p.tags, []),
      acceptanceRate: p.acceptanceRate,
      status,
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Problems</h1>
        <p className="text-sm text-neutral-400 mt-1">
          {problems.length} curated problems with the AlgoPath logic gate.
        </p>
      </div>

      {!userId && (
        <div className="mb-6 px-4 py-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-sm text-emerald-200 flex items-center justify-between gap-3 flex-wrap">
          <span>
            🔒 <span className="text-emerald-300 font-medium">Sign in</span> to track your progress, save your logic, and submit solutions.
          </span>
          <Link
            href="/login"
            className="px-3 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-black rounded-md transition"
          >
            Sign in →
          </Link>
        </div>
      )}

      <ProblemTable problems={items} isAuthed={!!userId} />
    </div>
  );
}
