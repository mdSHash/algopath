import type { Language, TestCase, TestResult } from "@/types";
import { runTestCasesLocally } from "./local-exec";

export const PISTON_LANGUAGES: Record<
  Language,
  { language: string; version: string; filename: string }
> = {
  python: { language: "python", version: "3.10.0", filename: "main.py" },
  javascript: { language: "javascript", version: "18.15.0", filename: "main.js" },
  java: { language: "java", version: "15.0.2", filename: "Main.java" },
};

interface PistonResponse {
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    output: string;
  };
}

const DEFAULT_PISTON_URL = "https://emkc.org/api/v2/piston/execute";

async function executePiston(
  url: string,
  code: string,
  language: Language,
  stdin: string
): Promise<PistonResponse> {
  const meta = PISTON_LANGUAGES[language];
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: meta.language,
      version: meta.version,
      files: [{ name: meta.filename, content: code }],
      stdin,
    }),
  });

  if (!response.ok) {
    throw new Error(`Piston API error: ${response.status}`);
  }
  return (await response.json()) as PistonResponse;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function runTestCasesPiston(
  url: string,
  code: string,
  language: Language,
  testCases: TestCase[],
  options: { delayMs?: number; limit?: number } = {}
): Promise<TestResult[]> {
  const cases = options.limit ? testCases.slice(0, options.limit) : testCases;
  const results: TestResult[] = [];

  for (let i = 0; i < cases.length; i++) {
    const tc = cases[i];
    try {
      const res = await executePiston(url, code, language, tc.input);
      const compileErr =
        res.compile && res.compile.code !== 0
          ? res.compile.stderr || res.compile.output
          : null;
      const stderr = res.run.stderr ?? "";
      const stdout = (res.run.stdout ?? "").trim();
      const expected = tc.expectedOutput.trim();
      const error = compileErr || (res.run.code !== 0 ? stderr : null);
      const passed = !error && stdout === expected;

      results.push({
        testCase: i + 1,
        input: tc.input,
        expectedOutput: expected,
        actualOutput: stdout,
        passed,
        error: error ? error.slice(0, 800) : undefined,
      });
    } catch (err) {
      results.push({
        testCase: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: "",
        passed: false,
        error:
          err instanceof Error
            ? `Execution failed: ${err.message}`
            : "Execution failed",
      });
    }

    if (options.delayMs && i < cases.length - 1) {
      await sleep(options.delayMs);
    }
  }

  return results;
}

/**
 * Whether code execution is actually possible in the current runtime.
 * Vercel's Node functions don't have python/java/etc, so spawning them
 * fails with ENOENT. When `EXEC_BACKEND=local` (the default) and we're
 * on Vercel without an alternative backend, fall back to a friendly
 * "not available" message instead of cryptic spawn errors.
 */
function execBackend():
  | { kind: "local" }
  | { kind: "piston"; url: string }
  | { kind: "disabled"; reason: string } {
  const raw = (process.env.EXEC_BACKEND ?? "").toLowerCase().trim();

  if (raw === "piston") {
    return { kind: "piston", url: process.env.PISTON_URL ?? DEFAULT_PISTON_URL };
  }
  if (raw === "disabled") {
    return {
      kind: "disabled",
      reason:
        "Code execution is disabled in this environment. Run AlgoPath locally to test your solutions against the provided test cases.",
    };
  }

  // Default ("local" or unset). On Vercel / hosted serverless runtimes,
  // local spawning will fail because python/java aren't installed.
  if (process.env.VERCEL === "1" || process.env.NEXT_RUNTIME === "edge") {
    return {
      kind: "disabled",
      reason:
        "Code execution isn't available in this hosted environment — Vercel's Node runtime doesn't ship with Python or Java. Run AlgoPath locally for full execution, or configure a self-hosted Piston instance via EXEC_BACKEND=piston + PISTON_URL.",
    };
  }

  return { kind: "local" };
}

function disabledResults(testCases: TestCase[], reason: string, limit?: number): TestResult[] {
  return (limit ? testCases.slice(0, limit) : testCases).map((tc, i) => ({
    testCase: i + 1,
    input: tc.input,
    expectedOutput: tc.expectedOutput.trim(),
    actualOutput: "",
    passed: false,
    error: reason,
  }));
}

/**
 * Run a user's submission against test cases. Defaults to local execution
 * (spawning python / node / java on the host) — appropriate for a localhost
 * dev tool, and required because the public Piston API became whitelist-only
 * in February 2026.
 *
 * Backends (controlled by EXEC_BACKEND env var):
 *   "local"    — default, spawns python/node/java on the server
 *   "piston"   — POSTs to a Piston instance (set PISTON_URL)
 *   "disabled" — returns a friendly "not available" message per test
 *
 * Auto-detection: when running on Vercel, falls back to "disabled" because
 * the Node runtime there has no language interpreters.
 */
export async function runTestCases(
  code: string,
  language: Language,
  testCases: TestCase[],
  options: { delayMs?: number; limit?: number } = {}
): Promise<TestResult[]> {
  const backend = execBackend();

  if (backend.kind === "disabled") {
    return disabledResults(testCases, backend.reason, options.limit);
  }

  if (backend.kind === "piston") {
    return runTestCasesPiston(backend.url, code, language, testCases, options);
  }

  return runTestCasesLocally(code, language, testCases, {
    limit: options.limit,
  });
}

export function isExecutionAvailable(): boolean {
  return execBackend().kind !== "disabled";
}
