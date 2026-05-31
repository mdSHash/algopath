import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { runTestCases, PISTON_LANGUAGES } from "@/lib/piston";
import type { TestCase, Language } from "@/types";
import { safeJsonParse } from "@/lib/utils";

const schema = z.object({
  problemId: z.string(),
  code: z.string().min(1).max(50000),
  language: z.enum(["python", "javascript", "java"]),
  sampleOnly: z.boolean().optional().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in to run code." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const { problemId, code, language, sampleOnly } = parsed.data;

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Logic gate enforcement
    const progress = await prisma.progress.findUnique({
      where: { userId_problemId: { userId, problemId } },
    });
    if (!progress?.logicApproved) {
      return NextResponse.json(
        {
          error:
            "Code execution is locked until your logic is approved. Submit your approach for review first.",
          locked: true,
        },
        { status: 403 }
      );
    }

    if (!(language in PISTON_LANGUAGES)) {
      return NextResponse.json(
        { error: "Unsupported language" },
        { status: 400 }
      );
    }

    const allTests = safeJsonParse<TestCase[]>(problem.testCases, []);
    const testCases = sampleOnly ? allTests.slice(0, 3) : allTests;

    const results = await runTestCases(code, language as Language, testCases, {
      delayMs: 250,
    });

    return NextResponse.json({
      results,
      passed: results.filter((r) => r.passed).length,
      total: results.length,
    });
  } catch (err) {
    console.error("execute error", err);
    return NextResponse.json(
      { error: "Code execution failed. Please try again." },
      { status: 500 }
    );
  }
}
