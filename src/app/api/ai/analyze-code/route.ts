import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthedUserId } from "@/lib/api-auth";
import { analyzeCode } from "@/lib/gemini";
import { safeJsonParse } from "@/lib/utils";
import {
  checkRateLimit,
  rateLimitResponse,
  callerIdentity,
  AI_RATE,
} from "@/lib/rate-limit";
import type { CodeAnalysis } from "@/types";

const schema = z.object({
  problemId: z.string(),
  code: z.string().min(1).max(50000),
  language: z.string(),
  /** When true, bypass the cache and force a fresh Gemini call. */
  refresh: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in required" },
        { status: 401 }
      );
    }

    const limit = checkRateLimit(
      `ai:analyze-code:${callerIdentity(req, userId)}`,
      AI_RATE
    );
    const limitResponse = rateLimitResponse(limit);
    if (limitResponse) return limitResponse;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: parsed.data.problemId },
    });
    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    // Only analyze code for problems the user has actually solved.
    const progress = await prisma.progress.findUnique({
      where: { userId_problemId: { userId, problemId: problem.id } },
    });
    if (!progress?.solvedAt) {
      return NextResponse.json(
        {
          error:
            "Code analysis is only available after a solution is accepted on all test cases.",
        },
        { status: 403 }
      );
    }

    // H-5: cache analyses on the most recent matching submission. If the user
    // submits the same code again later, we can return the cached result
    // without re-billing Gemini.
    const matchingSubmission = await prisma.submission.findFirst({
      where: {
        userId,
        problemId: problem.id,
        language: parsed.data.language,
        code: parsed.data.code,
        status: "Accepted",
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, analysisJson: true },
    });

    if (
      matchingSubmission?.analysisJson &&
      !parsed.data.refresh
    ) {
      const cached = safeJsonParse<CodeAnalysis | null>(
        matchingSubmission.analysisJson,
        null
      );
      if (cached && cached.yourComplexity) {
        return NextResponse.json({ analysis: cached, cached: true });
      }
    }

    let analysis;
    try {
      analysis = await analyzeCode({
        problemTitle: problem.title,
        problemDescription: problem.description,
        difficulty: problem.difficulty,
        language: parsed.data.language,
        code: parsed.data.code,
      });
    } catch (err) {
      console.warn("[analyze-code] Gemini unavailable, using fallback", err);
      analysis = {
        yourComplexity: { time: "O(?)", space: "O(?)" },
        optimalComplexity: { time: "O(?)", space: "O(?)" },
        isOptimal: false,
        verdict: "Acceptable" as const,
        reasoning:
          "AI analysis is offline right now — but your solution passed every test case, which means the logic is correct.",
        strengths: ["Solution is correct (all tests passed)."],
        suggestions: [
          "Check Gemini API key configuration to enable detailed analysis.",
        ],
        memoryNotes: "Analysis unavailable — re-run when AI is reachable.",
      };
    }

    // Persist the analysis to the matching submission row so subsequent calls
    // hit the cache. If we couldn't find a matching submission row (the user
    // may have edited the code after solving), this is a no-op.
    if (matchingSubmission) {
      await prisma.submission.update({
        where: { id: matchingSubmission.id },
        data: { analysisJson: JSON.stringify(analysis) },
      }).catch((err) => {
        console.warn("[analyze-code] Failed to cache analysis", err);
      });
    }

    return NextResponse.json({ analysis, cached: false });
  } catch (err) {
    console.error("analyze-code error", err);
    return NextResponse.json({ error: "Code analysis failed" }, { status: 500 });
  }
}
