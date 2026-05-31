import { spawn } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Language, TestCase, TestResult } from "@/types";

interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timedOut: boolean;
  durationMs: number;
}

const RUN_TIMEOUT_MS = 10_000;
const COMPILE_TIMEOUT_MS = 20_000;
const MAX_OUTPUT = 200_000;

function spawnWithTimeout(
  cmd: string,
  args: string[],
  cwd: string,
  stdin: string,
  timeoutMs: number
): Promise<ExecResult> {
  return new Promise((resolve) => {
    const start = Date.now();
    let child;
    try {
      child = spawn(cmd, args, { cwd, shell: false, windowsHide: true });
    } catch (err) {
      resolve({
        stdout: "",
        stderr: err instanceof Error ? err.message : String(err),
        exitCode: -1,
        timedOut: false,
        durationMs: Date.now() - start,
      });
      return;
    }

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let killedForOutput = false;

    const timer = setTimeout(() => {
      timedOut = true;
      try { child.kill("SIGKILL"); } catch {}
    }, timeoutMs);

    child.stdout?.on("data", (d: Buffer) => {
      if (stdout.length < MAX_OUTPUT) stdout += d.toString();
      else if (!killedForOutput) {
        killedForOutput = true;
        try { child.kill("SIGKILL"); } catch {}
      }
    });
    child.stderr?.on("data", (d: Buffer) => {
      if (stderr.length < MAX_OUTPUT) stderr += d.toString();
    });

    child.on("error", (err: Error) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: stderr + (stderr ? "\n" : "") + err.message,
        exitCode: -1,
        timedOut: false,
        durationMs: Date.now() - start,
      });
    });

    child.on("close", (code: number | null) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: killedForOutput ? stderr + "\n[Output truncated — exceeded output limit]" : stderr,
        exitCode: code,
        timedOut,
        durationMs: Date.now() - start,
      });
    });

    if (child.stdin) {
      try {
        if (stdin) child.stdin.write(stdin);
        child.stdin.end();
      } catch {
        // pipe might close early on some errors; ignore
      }
    }
  });
}

function pythonCmd(): string {
  // Windows ships `python`, *nix typically `python3`. We try `python` first
  // because that's what the system check confirmed; PATH will resolve it.
  return process.platform === "win32" ? "python" : "python3";
}

async function executePython(code: string, stdin: string): Promise<ExecResult> {
  const dir = await mkdtemp(join(tmpdir(), "algopath-py-"));
  try {
    const file = join(dir, "main.py");
    await writeFile(file, code, "utf8");
    return await spawnWithTimeout(pythonCmd(), [file], dir, stdin, RUN_TIMEOUT_MS);
  } finally {
    rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function executeJavaScript(code: string, stdin: string): Promise<ExecResult> {
  const dir = await mkdtemp(join(tmpdir(), "algopath-js-"));
  try {
    const file = join(dir, "main.js");
    await writeFile(file, code, "utf8");
    return await spawnWithTimeout("node", [file], dir, stdin, RUN_TIMEOUT_MS);
  } finally {
    rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function executeJava(code: string, stdin: string): Promise<ExecResult> {
  const dir = await mkdtemp(join(tmpdir(), "algopath-java-"));
  try {
    const file = join(dir, "Main.java");
    await writeFile(file, code, "utf8");

    const compile = await spawnWithTimeout("javac", [file], dir, "", COMPILE_TIMEOUT_MS);
    if (compile.exitCode !== 0 || compile.timedOut) {
      return {
        stdout: "",
        stderr: compile.timedOut
          ? `Compilation timed out after ${COMPILE_TIMEOUT_MS}ms`
          : compile.stderr || "Compilation failed",
        exitCode: compile.exitCode ?? -1,
        timedOut: compile.timedOut,
        durationMs: compile.durationMs,
      };
    }

    return await spawnWithTimeout(
      "java",
      ["-cp", dir, "Main"],
      dir,
      stdin,
      RUN_TIMEOUT_MS
    );
  } finally {
    rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

export async function executeLocally(
  code: string,
  language: Language,
  stdin: string
): Promise<ExecResult> {
  switch (language) {
    case "python":
      return executePython(code, stdin);
    case "javascript":
      return executeJavaScript(code, stdin);
    case "java":
      return executeJava(code, stdin);
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

export async function runTestCasesLocally(
  code: string,
  language: Language,
  testCases: TestCase[],
  options: { limit?: number } = {}
): Promise<TestResult[]> {
  const cases = options.limit ? testCases.slice(0, options.limit) : testCases;
  const results: TestResult[] = [];

  for (let i = 0; i < cases.length; i++) {
    const tc = cases[i];
    try {
      const res = await executeLocally(code, language, tc.input);
      const stdout = res.stdout.replace(/\r\n/g, "\n").trim();
      const expected = tc.expectedOutput.replace(/\r\n/g, "\n").trim();

      const error = res.timedOut
        ? `Time Limit Exceeded (${RUN_TIMEOUT_MS}ms)`
        : res.exitCode !== 0
        ? (res.stderr.trim() || `Process exited with code ${res.exitCode}`)
        : null;

      const passed = !error && stdout === expected;

      results.push({
        testCase: i + 1,
        input: tc.input,
        expectedOutput: expected,
        actualOutput: stdout,
        passed,
        runtime: `${res.durationMs}ms`,
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
  }

  return results;
}
