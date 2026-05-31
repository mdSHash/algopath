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
 * Run a user's submission against test cases. Defaults to local execution
 * (spawning python / node / java on the host) — appropriate for a localhost
 * dev tool, and required because the public Piston API became whitelist-only
 * in February 2026.
 *
 * To use a self-hosted Piston instance instead, set:
 *   EXEC_BACKEND=piston
 *   PISTON_URL=https://your-piston-instance/api/v2/piston/execute
 */
export async function runTestCases(
  code: string,
  language: Language,
  testCases: TestCase[],
  options: { delayMs?: number; limit?: number } = {}
): Promise<TestResult[]> {
  const backend = (process.env.EXEC_BACKEND ?? "local").toLowerCase();

  if (backend === "piston") {
    const url = process.env.PISTON_URL ?? DEFAULT_PISTON_URL;
    return runTestCasesPiston(url, code, language, testCases, options);
  }

  return runTestCasesLocally(code, language, testCases, {
    limit: options.limit,
  });
}
