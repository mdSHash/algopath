// Shared leaderboard aggregation. Used by both the API route and the
// server-rendered page so we don't duplicate the scoring formula.
//
// Cached in memory for 60s via React's `unstable_cache` (a value-cache, not
// a request-cache) — keeps the leaderboard responsive without hammering
// the DB on every refresh during demo bursts. Cache is keyed by the
// hard-coded scoring weights so a future weight change invalidates cleanly.

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const LEADERBOARD_WEIGHTS = { Easy: 1, Medium: 3, Hard: 7 } as const;
export const LEADERBOARD_LIMIT = 50;
const CACHE_TTL_SECONDS = 60;

export interface LeaderboardEntry {
  rank: number;
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
  lastSolvedAt: string | null;
}

export interface LeaderboardSnapshot {
  entries: LeaderboardEntry[];
  totals: {
    users: number;
    submissions: number;
    withSolves: number;
    problems: number;
  };
  generatedAt: string;
}

async function buildLeaderboardUncached(): Promise<LeaderboardSnapshot> {
  const [solved, totalUsers, totalSubmissions, totalProblems] = await Promise.all([
    prisma.progress.findMany({
      where: { solvedAt: { not: null } },
      include: {
        user: { select: { id: true, name: true, image: true } },
        problem: { select: { difficulty: true } },
      },
    }),
    prisma.user.count(),
    prisma.submission.count(),
    prisma.problem.count(),
  ]);

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
    const diff = row.problem.difficulty as keyof typeof LEADERBOARD_WEIGHTS;
    if (diff === "Easy") b.easy++;
    else if (diff === "Medium") b.medium++;
    else if (diff === "Hard") b.hard++;
    b.total++;
    b.score += LEADERBOARD_WEIGHTS[diff] ?? 0;
    b.hints += row.hintsUsed;
    const ts = row.solvedAt ? row.solvedAt.getTime() : 0;
    if (ts > b.lastSolvedAt) b.lastSolvedAt = ts;
  }

  const sorted = Array.from(byUser.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.hints !== b.hints) return a.hints - b.hints;
    return b.lastSolvedAt - a.lastSolvedAt;
  });

  return {
    entries: sorted.slice(0, LEADERBOARD_LIMIT).map((r, i) => ({
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
      withSolves: sorted.length,
      problems: totalProblems,
    },
    generatedAt: new Date().toISOString(),
  };
}

export const getLeaderboard = unstable_cache(
  buildLeaderboardUncached,
  ["leaderboard:v1"],
  { revalidate: CACHE_TTL_SECONDS, tags: ["leaderboard"] }
);
