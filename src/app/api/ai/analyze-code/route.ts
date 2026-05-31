import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { analyzeCode } from "@/lib/gemini";

const schema = z.object({
  problemId: z.string(),
  code: z.string().min(1).max(50000),
  language: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: parsed.data.problemId },
    });
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Only analyze code for problems the user has actually solved — no point
    // running expensive AI on broken code, and prevents abuse.
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

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("analyze-code error", err);
    return NextResponse.json({ error: "Code analysis failed" }, { status: 500 });
  }
}
