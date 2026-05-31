import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthedUserId } from "@/lib/api-auth";
import { runTestCases } from "@/lib/piston";
import type { TestCase, Language, TestResult } from "@/types";
import { safeJsonParse } from "@/lib/utils";
import {
  checkRateLimit,
  rateLimitResponse,
  callerIdentity,
  EXEC_RATE,
} from "@/lib/rate-limit";

const schema = z.object({
  problemId: z.string(),
  code: z.string().min(1).max(50000),
  language: z.enum(["python", "javascript", "java"]),
});

/** Median runtime across test results (in ms), formatted as "Nms". */
function summarizeRuntime(results: TestResult[]): string | null {
  const ms: number[] = [];
  for (const r of results) {
    if (!r.runtime) continue;
    const m = r.runtime.match(/(\d+(?:\.\d+)?)\s*ms/i);
    if (m) ms.push(parseFloat(m[1]));
  }
  if (ms.length === 0) return null;
  ms.sort((a, b) => a - b);
  const mid = ms[Math.floor(ms.length / 2)];
  return `${Math.round(mid)}ms`;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Sign in to submit." }, { status: 401 });
    }

    const limit = checkRateLimit(
      `submit:${callerIdentity(req, userId)}`,
      EXEC_RATE
    );
    const limitResponse = rateLimitResponse(
      limit,
      "Too many submissions in a short window. Take a moment to think between attempts."
    );
    if (limitResponse) return limitResponse;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }
    const { problemId, code, language } = parsed.data;

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const progress = await prisma.progress.findUnique({
      where: { userId_problemId: { userId, problemId } },
    });
    if (!progress?.logicApproved) {
      return NextResponse.json(
        {
          error: "Submit your logic for review before running code.",
          locked: true,
        },
        { status: 403 }
      );
    }

    const allTests = safeJsonParse<TestCase[]>(problem.testCases, []);
    const results = await runTestCases(code, language as Language, allTests, {
      delayMs: 250,
    });
    const passed = results.filter((r) => r.passed).length;
    const total = results.length;
    const allPassed = passed === total && total > 0;
    const hadError = results.some((r) => r.error);
    const status = allPassed
      ? "Accepted"
      : hadError
      ? "Runtime Error"
      : "Wrong Answer";

    const runtime = summarizeRuntime(results);

    // L-8: persist perf metrics. M-1: bump live counters and refresh
    // acceptanceRate based on the new totals. Wrap in a transaction so
    // the submission row, progress update, and counters are all consistent.
    await prisma.$transaction(async (tx) => {
      await tx.submission.create({
        data: {
          userId,
          problemId,
          language,
          logicText: progress.logicText ?? "",
          code,
          status,
          testsPassed: passed,
          testsTotal: total,
          runtime: runtime ?? undefined,
        },
      });

      const updatedProblem = await tx.problem.update({
        where: { id: problemId },
        data: {
          submissionCount: { increment: 1 },
          ...(allPassed ? { acceptedCount: { increment: 1 } } : {}),
        },
        select: { submissionCount: true, acceptedCount: true },
      });

      const newRate =
        updatedProblem.submissionCount > 0
          ? (updatedProblem.acceptedCount / updatedProblem.submissionCount) * 100
          : 0;
      await tx.problem.update({
        where: { id: problemId },
        data: { acceptanceRate: newRate },
      });

      if (allPassed) {
        await tx.progress.update({
          where: { userId_problemId: { userId, problemId } },
          data: {
            phase: "solved",
            // Only stamp solvedAt the FIRST time the user solves — preserves
            // their original time-to-solve through later resubmissions.
            ...(progress.solvedAt ? {} : { solvedAt: new Date() }),
          },
        });
      }
    });

    return NextResponse.json({
      status,
      testsPassed: passed,
      testsTotal: total,
      results,
      runtime,
    });
  } catch (err) {
    console.error("submit error", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
