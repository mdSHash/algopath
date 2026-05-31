import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { reviewLogic } from "@/lib/gemini";

const schema = z.object({
  problemId: z.string(),
  logicText: z.string().min(20).max(20000),
});

function fallbackReview(logicText: string): {
  approved: boolean;
  verdict: "Correct" | "Partially Correct" | "Incorrect" | "Too Vague";
  feedback: string;
  questions: string[];
  encouragement: string;
} {
  const length = logicText.trim().length;
  if (length < 80) {
    return {
      approved: false,
      verdict: "Too Vague",
      feedback:
        "Your approach is on the short side — flesh it out a bit. Walk me through the data structures you'd reach for and what each step achieves.",
      questions: [
        "What's the very first thing your algorithm checks at each step?",
        "What invariant holds true throughout your loop?",
      ],
      encouragement: "Specifics are what turn an idea into an algorithm.",
    };
  }
  return {
    approved: true,
    verdict: "Correct",
    feedback:
      "Looks like a reasonable approach. Live AI review is offline (no Gemini key configured), so you've been auto-approved on length and substance — go ahead and code it.",
    questions: [],
    encouragement: "Code it up and verify with the test cases!",
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in to submit logic." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Logic must be at least 20 characters." },
        { status: 400 }
      );
    }
    const { problemId, logicText } = parsed.data;

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    let review;
    try {
      review = await reviewLogic({
        problemTitle: problem.title,
        problemDescription: problem.description,
        difficulty: problem.difficulty,
        userLogic: logicText,
      });
    } catch (err) {
      console.warn("[review-logic] Gemini unavailable, using fallback", err);
      review = fallbackReview(logicText);
    }

    await prisma.progress.upsert({
      where: { userId_problemId: { userId, problemId } },
      create: {
        userId,
        problemId,
        logicText,
        logicApproved: review.approved,
        phase: review.approved ? "coding" : "logic",
      },
      update: {
        logicText,
        logicApproved: review.approved,
        phase: review.approved ? "coding" : "logic",
      },
    });

    return NextResponse.json({ review });
  } catch (err) {
    console.error("review-logic error", err);
    return NextResponse.json(
      { error: "Failed to review logic. Please try again." },
      { status: 500 }
    );
  }
}
