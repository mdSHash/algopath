import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthedUserId } from "@/lib/api-auth";
import { getHint } from "@/lib/gemini";
import { safeJsonParse } from "@/lib/utils";
import {
  checkRateLimit,
  rateLimitResponse,
  callerIdentity,
  AI_RATE,
} from "@/lib/rate-limit";

const schema = z.object({
  problemId: z.string(),
  phase: z.enum(["logic", "coding"]),
  hintNumber: z.number().int().min(1).max(3),
  userLogic: z.string().max(20000).optional(),
  userCode: z.string().max(50000).optional(),
  language: z.string().optional(),
});

const HINT_BIT = (n: number) => 1 << (n - 1);

function popcount(n: number): number {
  let count = 0;
  let x = n;
  while (x) {
    count += x & 1;
    x >>>= 1;
  }
  return count;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to request hints." },
        { status: 401 }
      );
    }

    const limit = checkRateLimit(
      `ai:hint:${callerIdentity(req, userId)}`,
      AI_RATE
    );
    const limitResponse = rateLimitResponse(
      limit,
      "Slow down a sec — too many hint requests in a short window."
    );
    if (limitResponse) return limitResponse;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid hint request" },
        { status: 400 }
      );
    }
    const { problemId, phase, hintNumber, userLogic, userCode, language } =
      parsed.data;

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
    });
    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    // H-3: phase authorization. Coding-phase hints require the user to have
    // had their logic approved already; otherwise they can't be looking at
    // code in the first place.
    const progress = await prisma.progress.findUnique({
      where: { userId_problemId: { userId, problemId } },
    });

    if (phase === "coding" && !progress?.logicApproved) {
      return NextResponse.json(
        {
          error:
            "Code-phase hints unlock after your logic is approved. Submit your approach for review first.",
        },
        { status: 403 }
      );
    }

    // H-2: enforce hint sequencing. Reject requests for a hint level whose
    // predecessors haven't been revealed yet — prevents skipping straight to
    // the most-explicit hint and prevents counter spam.
    const currentMask = progress?.hintsRevealedMask ?? 0;
    const requiredPrereqMask = HINT_BIT(hintNumber) - 1; // bits below hintNumber
    if ((currentMask & requiredPrereqMask) !== requiredPrereqMask) {
      return NextResponse.json(
        {
          error: `Reveal earlier hints in order before requesting hint ${hintNumber}.`,
        },
        { status: 409 }
      );
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
        hint:
          cannedHint ??
          "Think about the problem step by step. What's the simplest case?",
        followUpQuestion:
          hintNumber < 3
            ? "Does this point you in a direction? What would your next step be?"
            : "What concrete steps can you take with this insight?",
        hasMoreHints: hintNumber < 3,
      };
    }

    // Only flip the bit + bump the counter if this hint level wasn't already
    // revealed. Repeat clicks for the same level still serve a hint (good UX
    // — they may want to re-read it) but don't inflate hintsUsed.
    const bitForLevel = HINT_BIT(hintNumber);
    const isNewReveal = (currentMask & bitForLevel) === 0;

    if (isNewReveal) {
      const newMask = currentMask | bitForLevel;
      await prisma.progress.upsert({
        where: { userId_problemId: { userId, problemId } },
        create: {
          userId,
          problemId,
          hintsRevealedMask: newMask,
          hintsUsed: popcount(newMask),
        },
        update: {
          hintsRevealedMask: newMask,
          hintsUsed: popcount(newMask),
        },
      });
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error("hint error", err);
    return NextResponse.json(
      { error: "Failed to load hint" },
      { status: 500 }
    );
  }
}
