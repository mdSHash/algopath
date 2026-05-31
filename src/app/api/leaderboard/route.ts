import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Difficulty weights — higher = more credit toward the score.
const WEIGHTS = { Easy: 1, Medium: 3, Hard: 7 } as const;

export async function GET() {
  // Pull every solved-progress row joined with its problem (for difficulty).
  const solved = await prisma.progress.findMany({
    where: { solvedAt: { not: null } },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
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

    const display =
      (u.name && u.name.trim()) ||
      // Fall back to a stable, anonymous-feeling handle from the user id
      // rather than leaking emails.
      `coder-${u.id.slice(-6)}`;
    const initial = display.charAt(0).toUpperCase();

    let b = byUser.get(u.id);
    if (!b) {
      b = {
        userId: u.id,
        name: display,
        initial,
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

  // Rank: score desc → fewer hints → more recent activity.
  const rows = Array.from(byUser.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.hints !== b.hints) return a.hints - b.hints;
    return b.lastSolvedAt - a.lastSolvedAt;
  });

  const totalUsers = await prisma.user.count();
  const totalSubmissions = await prisma.submission.count();

  return NextResponse.json({
    leaderboard: rows.slice(0, 50).map((r, i) => ({
      rank: i + 1,
      userId: r.userId,
      name: r.name,
      initial: r.initial,
      image: r.image,
      easy: r.easy,
      medium: r.medium,
      hard: r.hard,
      total: r.total,
      score: r.score,
      hints: r.hints,
      lastSolvedAt: r.lastSolvedAt
        ? new Date(r.lastSolvedAt).toISOString()
        : null,
    })),
    totals: {
      users: totalUsers,
      submissions: totalSubmissions,
      withSolves: rows.length,
    },
  });
}
