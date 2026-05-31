import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DifficultyBadge } from "@/components/problems/DifficultyBadge";
import { Trophy, Lightbulb } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    redirect("/login?next=/profile");
  }

  const [user, allProblems, progress, submissions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.problem.findMany({ orderBy: { number: "asc" } }),
    prisma.progress.findMany({ where: { userId } }),
    prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { problem: true },
    }),
  ]);

  if (!user) redirect("/login");

  const progressByProblem = new Map(progress.map((p) => [p.problemId, p]));
  const solved = progress.filter((p) => p.solvedAt);

  const easyTotal = allProblems.filter((p) => p.difficulty === "Easy").length;
  const medTotal = allProblems.filter((p) => p.difficulty === "Medium").length;
  const hardTotal = allProblems.filter((p) => p.difficulty === "Hard").length;
  const easySolved = solved.filter(
    (s) => allProblems.find((p) => p.id === s.problemId)?.difficulty === "Easy"
  ).length;
  const medSolved = solved.filter(
    (s) => allProblems.find((p) => p.id === s.problemId)?.difficulty === "Medium"
  ).length;
  const hardSolved = solved.filter(
    (s) => allProblems.find((p) => p.id === s.problemId)?.difficulty === "Hard"
  ).length;
  const totalHints = progress.reduce((sum, p) => sum + p.hintsUsed, 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#1f1f1f]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-700/30 border border-emerald-500/40 text-2xl font-bold text-emerald-300">
          {(user.name ?? user.email).charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{user.name ?? "Coder"}</h1>
          <div className="text-sm text-neutral-400">{user.email}</div>
          <div className="text-xs text-neutral-600 mt-1">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Stat icon={<Trophy size={16} className="text-emerald-400" />} label="Problems Solved" value={`${solved.length} / ${allProblems.length}`} />
        <Stat icon={<span className="text-[#00b8a3] text-xs font-bold">E</span>} label="Easy" value={`${easySolved} / ${easyTotal}`} valueColor="text-[#00b8a3]" />
        <Stat icon={<span className="text-[#ffa116] text-xs font-bold">M</span>} label="Medium" value={`${medSolved} / ${medTotal}`} valueColor="text-[#ffa116]" />
        <Stat icon={<span className="text-[#ff375f] text-xs font-bold">H</span>} label="Hard" value={`${hardSolved} / ${hardTotal}`} valueColor="text-[#ff375f]" />
      </div>

      <div className="mb-8 p-4 rounded-lg border border-[#2a2a2a] bg-[#111] flex items-center gap-3">
        <Lightbulb size={18} className="text-amber-400" />
        <div className="text-sm">
          <span className="text-neutral-300">Hints used:</span>{" "}
          <span className="text-amber-400 font-semibold">{totalHints}</span>{" "}
          <span className="text-neutral-500">across all problems</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-base font-semibold mb-3">Recent Submissions</h2>
          <div className="rounded-lg border border-[#2a2a2a] bg-[#111] overflow-hidden">
            {submissions.length === 0 ? (
              <div className="text-center py-10 text-sm text-neutral-500">
                No submissions yet. <Link href="/problems" className="text-emerald-400 hover:text-emerald-300">Try a problem →</Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-neutral-500 bg-[#0e0e0e]">
                  <tr>
                    <th className="text-left px-4 py-2">Problem</th>
                    <th className="text-left px-2 py-2">Lang</th>
                    <th className="text-left px-2 py-2">Status</th>
                    <th className="text-right px-4 py-2">When</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id} className="border-t border-[#1f1f1f]">
                      <td className="px-4 py-2.5">
                        <Link href={`/problems/${s.problem.slug}`} className="text-neutral-200 hover:text-emerald-400">
                          {s.problem.title}
                        </Link>
                      </td>
                      <td className="px-2 py-2.5 text-xs text-neutral-400 capitalize">{s.language}</td>
                      <td className="px-2 py-2.5">
                        <span className={`text-xs ${
                          s.status === "Accepted" ? "text-emerald-400"
                          : s.status === "Wrong Answer" ? "text-red-400"
                          : "text-amber-400"
                        }`}>
                          {s.status}
                        </span>
                        <span className="text-[11px] text-neutral-600 ml-2 font-mono">
                          {s.testsPassed}/{s.testsTotal}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs text-neutral-500">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">Progress Overview</h2>
          <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            {allProblems.map((p) => {
              const prog = progressByProblem.get(p.id);
              const phase = prog?.phase ?? "todo";
              const dot =
                prog?.solvedAt
                  ? "bg-emerald-500"
                  : phase === "coding"
                  ? "bg-amber-400"
                  : phase === "logic"
                  ? "bg-blue-400"
                  : "bg-neutral-700";
              return (
                <Link
                  key={p.id}
                  href={`/problems/${p.slug}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#141414] transition"
                >
                  <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
                  <span className="text-xs font-mono text-neutral-500 w-8">{p.number}</span>
                  <span className="text-sm text-neutral-200 flex-1 truncate">{p.title}</span>
                  <DifficultyBadge difficulty={p.difficulty} />
                  <span className="text-[11px] text-neutral-500 capitalize w-20 text-right">
                    {prog?.solvedAt ? "solved" : prog?.phase ?? "todo"}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  valueColor = "text-neutral-100",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-neutral-500">
        {icon}
        {label}
      </div>
      <div className={`text-xl font-semibold mt-1 ${valueColor}`}>{value}</div>
    </div>
  );
}
