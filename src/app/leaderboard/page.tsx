import { prisma } from "@/lib/prisma";
import { Trophy, Medal, Crown, Award, Users, Code } from "lucide-react";

export const dynamic = "force-dynamic";

const WEIGHTS = { Easy: 1, Medium: 3, Hard: 7 } as const;

export default async function LeaderboardPage() {
  // Same aggregation as /api/leaderboard, run server-side so the page is
  // SSR-rendered and feels instant.
  const solved = await prisma.progress.findMany({
    where: { solvedAt: { not: null } },
    include: {
      user: { select: { id: true, name: true, image: true } },
      problem: { select: { difficulty: true } },
    },
  });

  type Bucket = {
    userId: string;
    name: string;
    initial: string;
    image: string | null;
    easy: number;
    medium: number;
    hard: number;
    total: number;
    score: number;
    hints: number;
    lastSolvedAt: number;
  };

  const byUser = new Map<string, Bucket>();
  for (const row of solved) {
    const u = row.user;
    if (!u) continue;
    const display = (u.name && u.name.trim()) || `coder-${u.id.slice(-6)}`;
    let b = byUser.get(u.id);
    if (!b) {
      b = {
        userId: u.id,
        name: display,
        initial: display.charAt(0).toUpperCase(),
        image: u.image ?? null,
        easy: 0,
        medium: 0,
        hard: 0,
        total: 0,
        score: 0,
        hints: 0,
        lastSolvedAt: 0,
      };
      byUser.set(u.id, b);
    }
    const diff = row.problem.difficulty as keyof typeof WEIGHTS;
    if (diff === "Easy") b.easy++;
    else if (diff === "Medium") b.medium++;
    else if (diff === "Hard") b.hard++;
    b.total++;
    b.score += WEIGHTS[diff] ?? 0;
    b.hints += row.hintsUsed;
    const ts = row.solvedAt ? row.solvedAt.getTime() : 0;
    if (ts > b.lastSolvedAt) b.lastSolvedAt = ts;
  }

  const rows = Array.from(byUser.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.hints !== b.hints) return a.hints - b.hints;
    return b.lastSolvedAt - a.lastSolvedAt;
  });

  const [totalUsers, totalSubmissions, totalProblems] = await Promise.all([
    prisma.user.count(),
    prisma.submission.count(),
    prisma.problem.count(),
  ]);

  const top = rows.slice(0, 50);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Trophy className="text-amber-400" size={24} />
            Leaderboard
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Score = (Easy × 1) + (Medium × 3) + (Hard × 7). Ties broken by
            fewer hints used, then by most recent activity.
          </p>
        </div>
        <div className="flex gap-3">
          <StatPill Icon={Users} label="Coders" value={totalUsers} />
          <StatPill Icon={Code} label="Submissions" value={totalSubmissions} />
          <StatPill Icon={Award} label="Problems" value={totalProblems} />
        </div>
      </div>

      {top.length === 0 ? (
        <div className="rounded-xl border border-[#2a2a2a] bg-[#111] py-16 text-center">
          <Trophy size={32} className="text-neutral-700 mx-auto mb-3" />
          <p className="text-neutral-400">
            No one's solved a problem yet. Be the first.
          </p>
        </div>
      ) : (
        <>
          {/* Podium for top 3 */}
          {top.length >= 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {[1, 0, 2].map((i) =>
                top[i] ? (
                  <PodiumCard key={top[i].userId} entry={top[i]} rank={i + 1} />
                ) : (
                  <div key={`empty-${i}`} className="hidden md:block" />
                )
              )}
            </div>
          )}

          {/* Full table */}
          <div className="rounded-xl border border-[#2a2a2a] bg-[#111] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-neutral-500 bg-[#0e0e0e]">
                <tr>
                  <th className="text-left px-4 py-3 w-14">Rank</th>
                  <th className="text-left px-2 py-3">Coder</th>
                  <th className="text-right px-2 py-3 w-16">Score</th>
                  <th className="text-right px-2 py-3 w-14 hidden sm:table-cell">Easy</th>
                  <th className="text-right px-2 py-3 w-14 hidden sm:table-cell">Med</th>
                  <th className="text-right px-2 py-3 w-14 hidden sm:table-cell">Hard</th>
                  <th className="text-right px-2 py-3 w-16">Solved</th>
                  <th className="text-right px-4 py-3 w-16 hidden md:table-cell">Hints</th>
                </tr>
              </thead>
              <tbody>
                {top.map((r, i) => (
                  <tr
                    key={r.userId}
                    className="border-t border-[#1f1f1f] hover:bg-[#161616] transition"
                  >
                    <td className="px-4 py-3">
                      <RankBadge rank={i + 1} />
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shrink-0">
                          {r.initial}
                        </div>
                        <span className="text-neutral-100">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right font-mono text-emerald-400 font-semibold">
                      {r.score}
                    </td>
                    <td className="px-2 py-3 text-right text-[#00b8a3] font-mono text-xs hidden sm:table-cell">
                      {r.easy}
                    </td>
                    <td className="px-2 py-3 text-right text-[#ffa116] font-mono text-xs hidden sm:table-cell">
                      {r.medium}
                    </td>
                    <td className="px-2 py-3 text-right text-[#ff375f] font-mono text-xs hidden sm:table-cell">
                      {r.hard}
                    </td>
                    <td className="px-2 py-3 text-right text-neutral-300 font-mono text-xs">
                      {r.total}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-500 font-mono text-xs hidden md:table-cell">
                      {r.hints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatPill({
  Icon,
  label,
  value,
}: {
  Icon: typeof Trophy;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3.5 py-2 flex items-center gap-2.5">
      <Icon size={14} className="text-neutral-500" />
      <div className="text-right">
        <div className="text-xs text-neutral-500">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300">
        <Crown size={12} />
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-300/15 border border-neutral-300/30 text-neutral-200">
        <Medal size={12} />
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300">
        <Medal size={12} />
      </span>
    );
  }
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 border border-[#2a2a2a] text-neutral-400 text-[11px] font-mono">
      {rank}
    </span>
  );
}

function PodiumCard({
  entry,
  rank,
}: {
  entry: {
    userId: string;
    name: string;
    initial: string;
    score: number;
    total: number;
    easy: number;
    medium: number;
    hard: number;
    hints: number;
  };
  rank: number;
}) {
  const styles =
    rank === 1
      ? {
          ring: "border-amber-400/40",
          glow: "shadow-amber-500/20",
          bg: "bg-gradient-to-br from-amber-500/10 to-[#0e0e0e]",
          chip: "bg-amber-400/15 text-amber-300 border-amber-400/30",
          icon: <Crown size={16} className="text-amber-300" />,
          label: "1st",
        }
      : rank === 2
      ? {
          ring: "border-neutral-400/30",
          glow: "",
          bg: "bg-gradient-to-br from-neutral-700/15 to-[#0e0e0e]",
          chip: "bg-neutral-400/15 text-neutral-200 border-neutral-400/30",
          icon: <Medal size={16} className="text-neutral-200" />,
          label: "2nd",
        }
      : {
          ring: "border-orange-500/30",
          glow: "",
          bg: "bg-gradient-to-br from-orange-500/10 to-[#0e0e0e]",
          chip: "bg-orange-500/15 text-orange-300 border-orange-500/30",
          icon: <Medal size={16} className="text-orange-300" />,
          label: "3rd",
        };

  return (
    <div
      className={`rounded-xl border ${styles.ring} ${styles.bg} shadow-lg ${styles.glow} p-5`}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${styles.chip}`}
        >
          {styles.icon}
          {styles.label}
        </span>
        <span className="font-mono text-2xl font-bold text-emerald-400">
          {entry.score}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-base font-semibold shrink-0">
          {entry.initial}
        </div>
        <div className="min-w-0">
          <div className="text-base font-medium text-neutral-100 truncate">
            {entry.name}
          </div>
          <div className="text-[11px] text-neutral-500 mt-0.5">
            {entry.total} solved · {entry.hints} hints
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4 text-[11px] font-mono">
        <span className="px-2 py-0.5 rounded bg-[#00b8a3]/10 text-[#00b8a3] border border-[#00b8a3]/20">
          E {entry.easy}
        </span>
        <span className="px-2 py-0.5 rounded bg-[#ffa116]/10 text-[#ffa116] border border-[#ffa116]/20">
          M {entry.medium}
        </span>
        <span className="px-2 py-0.5 rounded bg-[#ff375f]/10 text-[#ff375f] border border-[#ff375f]/20">
          H {entry.hard}
        </span>
      </div>
    </div>
  );
}
