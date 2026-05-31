import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/leaderboard";

export async function GET() {
  const snapshot = await getLeaderboard();
  return NextResponse.json({
    leaderboard: snapshot.entries,
    totals: snapshot.totals,
    generatedAt: snapshot.generatedAt,
  });
}
