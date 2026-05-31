import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthedUserId } from "@/lib/api-auth";
import { reviewCode } from "@/lib/gemini";
import {
  checkRateLimit,
  rateLimitResponse,
  callerIdentity,
  AI_RATE,
} from "@/lib/rate-limit";

const schema = z.object({
  problemId: z.string(),
  code: z.string().min(1).max(50000),
  language: z.string(),
  failedTests: z
    .array(
      z.object({
        testCase: z.number(),
        input: z.string(),
        expectedOutput: z.string(),
        actualOutput: z.string(),
        passed: z.boolean(),
        error: z.string().optional(),
      })
    )
    .max(10),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const limit = checkRateLimit(
      `ai:review-code:${callerIdentity(req, userId)}`,
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
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    let review;
    try {
      review = await reviewCode({
        problemTitle: problem.title,
        problemDescription: problem.description,
        userCode: parsed.data.code,
        language: parsed.data.language,
        failedTests: parsed.data.failedTests,
      });
    } catch (err) {
      console.warn("[review-code] Gemini unavailable", err);
      review = {
        issue:
          "AI debugging is offline. Try tracing your code by hand against the failing input — note where your output diverges from expected.",
        debugQuestion:
          "What does your code produce step by step for the smallest failing input?",
        suggestion:
          "Add print/log statements at key decision points and re-run.",
      };
    }

    return NextResponse.json({ review });
  } catch (err) {
    console.error("review-code error", err);
    return NextResponse.json({ error: "Code review failed" }, { status: 500 });
  }
}
