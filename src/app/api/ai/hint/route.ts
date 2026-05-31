import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getHint } from "@/lib/gemini";
import { safeJsonParse } from "@/lib/utils";

const schema = z.object({
  problemId: z.string(),
  phase: z.enum(["logic", "coding"]),
  hintNumber: z.number().int().min(1).max(3),
  userLogic: z.string().max(20000).optional(),
  userCode: z.string().max(50000).optional(),
  language: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in to request hints." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid hint request" }, { status: 400 });
    }
    const { problemId, phase, hintNumber, userLogic, userCode, language } = parsed.data;

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const cannedHints = safeJsonParse<string[]>(problem.hints, []);
    const cannedHint = cannedHints[hintNumber - 1];

    let response;
    try {
      response = await getHint({
        problemTitle: problem.title,
        problemDescription: problem.description,
        difficulty: problem.difficulty,
        phase,
        hintNumber,
        userLogic,
        userCode,
        language,
        cannedHint,
      });
    } catch (err) {
      console.warn("[hint] Gemini unavailable, using canned hint", err);
      response = {
        hint: cannedHint ?? "Think about the problem step by step. What's the simplest case?",
        followUpQuestion:
          hintNumber < 3
            ? "Does this point you in a direction? What would your next step be?"
            : "What concrete steps can you take with this insight?",
        hasMoreHints: hintNumber < 3,
      };
    }

    await prisma.progress.upsert({
      where: { userId_problemId: { userId, problemId } },
      create: { userId, problemId, hintsUsed: 1 },
      update: { hintsUsed: { increment: 1 } },
    });

    return NextResponse.json(response);
  } catch (err) {
    console.error("hint error", err);
    return NextResponse.json({ error: "Failed to load hint" }, { status: 500 });
  }
}
