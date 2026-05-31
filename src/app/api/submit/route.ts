import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { runTestCases } from "@/lib/piston";
import type { TestCase, Language } from "@/types";
import { safeJsonParse } from "@/lib/utils";

const schema = z.object({
  problemId: z.string(),
  code: z.string().min(1).max(50000),
  language: z.enum(["python", "javascript", "java"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in to submit." }, { status: 401 });
    }

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

    await prisma.submission.create({
      data: {
        userId,
        problemId,
        language,
        logicText: progress.logicText ?? "",
        code,
        status,
        testsPassed: passed,
        testsTotal: total,
      },
    });

    if (allPassed) {
      await prisma.progress.update({
        where: { userId_problemId: { userId, problemId } },
        data: { phase: "solved", solvedAt: new Date() },
      });
    }

    return NextResponse.json({
      status,
      testsPassed: passed,
      testsTotal: total,
      results,
    });
  } catch (err) {
    console.error("submit error", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
