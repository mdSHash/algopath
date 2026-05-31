import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  LogicReview,
  HintResponse,
  CodeReview,
  TestResult,
} from "@/types";

function readApiKey(): string | null {
  const raw = process.env.GEMINI_API_KEY;
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "your-gemini-api-key-here") return null;
  return trimmed;
}

const apiKey = readApiKey();
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Configurable so you can swap to `gemini-2.5-flash`, `gemini-1.5-flash`, etc.
// without code changes. Defaults to a model that's broadly available on the
// free tier and supports JSON response mode.
const MODEL_NAME = (process.env.GEMINI_MODEL ?? "gemini-2.0-flash").trim();

function getModel() {
  if (!genAI) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Add it to .env to enable AI features."
    );
  }
  return genAI.getGenerativeModel({ model: MODEL_NAME });
}

function stripJsonFences(s: string): string {
  let t = s.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  }
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    t = t.slice(first, last + 1);
  }
  return t;
}

async function generateJson<T>(
  systemPrompt: string,
  userPrompt: string,
  opts: { maxOutputTokens?: number } = {}
): Promise<T> {
  const model = getModel();
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n---\n\n${userPrompt}` }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: opts.maxOutputTokens ?? 4096,
      responseMimeType: "application/json",
    },
  });

  const text = result.response.text();
  const cleaned = stripJsonFences(text);

  // Detect truncation: a complete JSON response should end with `}`.
  // Gemini's `finishReason` would be `MAX_TOKENS` if it ran out of room.
  const finishReason = result.response.candidates?.[0]?.finishReason;
  const looksTruncated =
    finishReason === "MAX_TOKENS" || !cleaned.trimEnd().endsWith("}");

  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error("Gemini JSON parse failure", {
      finishReason,
      looksTruncated,
      raw: text.slice(0, 500),
      cleaned: cleaned.slice(0, 500),
    });
    throw new Error(
      looksTruncated
        ? "AI response was truncated. Please try again — the model ran out of room."
        : "AI returned an invalid response. Please try again."
    );
  }
}

const LOGIC_REVIEWER_SYSTEM_PROMPT = `You are AlgoPath's Logic Review AI — a brilliant, warm computer science tutor.

Your role: Review a student's problem-solving approach (written in plain English or pseudocode) BEFORE they write code.

STRICT RULES:
- NEVER write actual code (no Python, JS, Java syntax)
- NEVER give away the complete solution
- Be warm, encouraging, and Socratic
- Incorrect logic → guide them with questions, not answers
- Vague logic → ask them to be more specific about the key step
- Correct logic → celebrate and unlock the editor

APPROVAL CRITERIA (approve if ALL are true):
1. The core algorithm/approach is correct (doesn't need to be optimal)
2. The student shows understanding of why it works
3. The main case is handled (edge cases can be discovered during coding)

RESPONSE: Return ONLY valid JSON, no markdown, no extra text:
{
  "approved": boolean,
  "verdict": "Correct" | "Partially Correct" | "Incorrect" | "Too Vague",
  "feedback": "2-3 sentences of warm, personalized feedback",
  "questions": ["question 1", "question 2"],
  "encouragement": "One short motivational sentence"
}`;

export async function reviewLogic(params: {
  problemTitle: string;
  problemDescription: string;
  difficulty: string;
  userLogic: string;
}): Promise<LogicReview> {
  const summary = params.problemDescription.slice(0, 500);
  const userPrompt = `Problem: ${params.problemTitle} (${params.difficulty})
Description Summary: ${summary}

Student's Logic/Approach:
${params.userLogic}

Review their approach and respond in JSON only.`;

  const review = await generateJson<LogicReview>(
    LOGIC_REVIEWER_SYSTEM_PROMPT,
    userPrompt
  );

  if (typeof review.approved !== "boolean") review.approved = false;
  if (!review.verdict) review.verdict = "Too Vague";
  if (!Array.isArray(review.questions)) review.questions = [];
  if (!review.feedback) review.feedback = "Let's think through this together.";
  if (!review.encouragement) review.encouragement = "You can do this!";
  return review;
}

const HINT_SYSTEM_PROMPT = `You are AlgoPath's Hint AI — a patient tutor who gives targeted, progressive hints.

HINT LEVEL meaning:
- Level 1: Point to the general technique/category/data structure
- Level 2: Describe the key insight or algorithm step
- Level 3: Walk through the specific mechanism with concrete detail (but still no code)

RULES:
- NEVER write code
- Each hint should be more specific than the last
- Keep hints to 3-5 sentences max
- End with a question that nudges their thinking

RESPONSE: Return ONLY valid JSON:
{
  "hint": "The hint text (3-5 sentences)",
  "followUpQuestion": "A question to prompt their next thought",
  "hasMoreHints": boolean
}`;

export async function getHint(params: {
  problemTitle: string;
  problemDescription: string;
  difficulty: string;
  phase: "logic" | "coding";
  hintNumber: number;
  userLogic?: string;
  userCode?: string;
  language?: string;
  cannedHint?: string;
}): Promise<HintResponse> {
  if (!apiKey && params.cannedHint) {
    return {
      hint: params.cannedHint,
      followUpQuestion:
        params.hintNumber < 3
          ? "Does this point you in a useful direction? What would your next step be?"
          : "What concrete steps can you take with this insight?",
      hasMoreHints: params.hintNumber < 3,
    };
  }

  const summary = params.problemDescription.slice(0, 500);
  const userContext =
    params.phase === "logic"
      ? `The student is in the LOGIC phase — figuring out their approach.
Their current draft logic:
${params.userLogic ?? "(empty)"}`
      : `The student is in the CODING phase — implementing in ${params.language ?? "their language"}.
Their current code:
${(params.userCode ?? "").slice(0, 1500)}`;

  const userPrompt = `Problem: ${params.problemTitle} (${params.difficulty})
Description Summary: ${summary}

${userContext}

Provide HINT LEVEL ${params.hintNumber} of 3.
${params.cannedHint ? `\nThe curated hint for this level is: "${params.cannedHint}". You may incorporate or rephrase its insight, but keep it under 5 sentences.\n` : ""}
Set hasMoreHints to ${params.hintNumber < 3}.

Respond in JSON only.`;

  const hint = await generateJson<HintResponse>(HINT_SYSTEM_PROMPT, userPrompt);
  if (!hint.hint) hint.hint = params.cannedHint ?? "Think about the simplest case first.";
  if (!hint.followUpQuestion) hint.followUpQuestion = "What's your next step?";
  if (typeof hint.hasMoreHints !== "boolean") hint.hasMoreHints = params.hintNumber < 3;
  return hint;
}

const CODE_REVIEWER_SYSTEM_PROMPT = `You are AlgoPath's Code Review AI — a debugging mentor.

The student's code failed some test cases. Help them find the bug WITHOUT:
- Writing corrected code
- Giving the complete fix
- Being discouraging

Guide them Socratically toward discovering the issue themselves.

RESPONSE: Return ONLY valid JSON:
{
  "issue": "What conceptual area likely contains the bug (2-3 sentences)",
  "debugQuestion": "A Socratic question to help them find it themselves",
  "suggestion": "A directional hint (no code)"
}`;

export async function reviewCode(params: {
  problemTitle: string;
  problemDescription: string;
  userCode: string;
  language: string;
  failedTests: TestResult[];
}): Promise<CodeReview> {
  const summary = params.problemDescription.slice(0, 500);
  const failedSummary = params.failedTests
    .slice(0, 3)
    .map(
      (t) =>
        `Test ${t.testCase}: input=${t.input.slice(0, 80)} | expected=${t.expectedOutput.slice(0, 80)} | got=${t.actualOutput.slice(0, 80)}`
    )
    .join("\n");

  const userPrompt = `Problem: ${params.problemTitle}
Description Summary: ${summary}

Language: ${params.language}
Code:
${params.userCode.slice(0, 2000)}

Failed test cases:
${failedSummary}

Help the student find their bug Socratically. Respond in JSON only.`;

  const review = await generateJson<CodeReview>(
    CODE_REVIEWER_SYSTEM_PROMPT,
    userPrompt
  );
  if (!review.issue) review.issue = "Take another look at how you handle the failing inputs.";
  if (!review.debugQuestion) review.debugQuestion = "What does your code do for the smallest failing input?";
  if (!review.suggestion) review.suggestion = "Try tracing through the failing case by hand.";
  return review;
}

export const __test__ = { stripJsonFences };
