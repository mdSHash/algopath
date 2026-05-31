// AlgoPath code execution runner
// HTTP service that compiles + runs user-submitted Python/JavaScript/Java
// in isolated temp directories with timeouts. Called by AlgoPath's Vercel
// deployment when EXEC_BACKEND=runner.

const express = require("express");
const { spawn } = require("node:child_process");
const { mkdtemp, writeFile, rm } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const { join } = require("node:path");

const RUN_TIMEOUT_MS = Number(process.env.RUN_TIMEOUT_MS || 10_000);
const COMPILE_TIMEOUT_MS = Number(process.env.COMPILE_TIMEOUT_MS || 20_000);
const MAX_OUTPUT = Number(process.env.MAX_OUTPUT || 200_000);
const MAX_CODE_BYTES = Number(process.env.MAX_CODE_BYTES || 60_000);

const API_KEY = (process.env.RUNNER_API_KEY || "").trim() || null;
const ALLOWED_ORIGIN = (process.env.ALLOWED_ORIGIN || "*").trim();

const app = express();
app.use(express.json({ limit: "200kb" }));

// Permissive CORS so Vercel can hit us. Restrict via ALLOWED_ORIGIN if you
// want to scope to your specific Vercel domain.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, x-api-key");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// API-key gate. The /health route stays open so Render's healthcheck works.
app.use((req, res, next) => {
  if (req.path === "/health" || req.path === "/") return next();
  if (!API_KEY) return next();
  const provided = req.header("x-api-key");
  if (provided !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

function spawnWithTimeout(cmd, args, cwd, stdin, timeoutMs) {
  return new Promise((resolve) => {
    const start = Date.now();
    let child;
    try {
      child = spawn(cmd, args, { cwd, shell: false });
    } catch (err) {
      return resolve({
        stdout: "",
        stderr: err && err.message ? err.message : String(err),
        exitCode: -1,
        timedOut: false,
        durationMs: Date.now() - start,
      });
    }

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let killedForOutput = false;

    const timer = setTimeout(() => {
      timedOut = true;
      try { child.kill("SIGKILL"); } catch {}
    }, timeoutMs);

    child.stdout.on("data", (d) => {
      if (stdout.length < MAX_OUTPUT) stdout += d.toString();
      else if (!killedForOutput) {
        killedForOutput = true;
        try { child.kill("SIGKILL"); } catch {}
      }
    });
    child.stderr.on("data", (d) => {
      if (stderr.length < MAX_OUTPUT) stderr += d.toString();
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: stderr + (stderr ? "\n" : "") + err.message,
        exitCode: -1,
        timedOut: false,
        durationMs: Date.now() - start,
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        stdout,
        stderr: killedForOutput
          ? stderr + "\n[Output truncated — exceeded output limit]"
          : stderr,
        exitCode: code,
        timedOut,
        durationMs: Date.now() - start,
      });
    });

    if (child.stdin) {
      try {
        if (stdin) child.stdin.write(stdin);
        child.stdin.end();
      } catch {}
    }
  });
}

async function executePython(code, stdin) {
  const dir = await mkdtemp(join(tmpdir(), "algopath-py-"));
  try {
    const file = join(dir, "main.py");
    await writeFile(file, code, "utf8");
    return await spawnWithTimeout("python3", [file], dir, stdin, RUN_TIMEOUT_MS);
  } finally {
    rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function executeJavaScript(code, stdin) {
  const dir = await mkdtemp(join(tmpdir(), "algopath-js-"));
  try {
    const file = join(dir, "main.js");
    await writeFile(file, code, "utf8");
    return await spawnWithTimeout("node", [file], dir, stdin, RUN_TIMEOUT_MS);
  } finally {
    rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function executeJava(code, stdin) {
  const dir = await mkdtemp(join(tmpdir(), "algopath-java-"));
  try {
    const file = join(dir, "Main.java");
    await writeFile(file, code, "utf8");

    const compile = await spawnWithTimeout("javac", [file], dir, "", COMPILE_TIMEOUT_MS);
    if (compile.exitCode !== 0 || compile.timedOut) {
      return {
        stdout: "",
        stderr: compile.timedOut
          ? "Compilation timed out after " + COMPILE_TIMEOUT_MS + "ms"
          : compile.stderr || "Compilation failed",
        exitCode: compile.exitCode == null ? -1 : compile.exitCode,
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

app.get("/", (_req, res) => {
  res.json({
    service: "algopath-runner",
    languages: ["python", "javascript", "java"],
    auth: API_KEY ? "x-api-key required" : "open",
  });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/execute", async (req, res) => {
  const body = req.body || {};
  const { language, code, stdin = "" } = body;

  if (!language || typeof language !== "string") {
    return res.status(400).json({ error: "language is required" });
  }
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "code is required" });
  }
  if (code.length > MAX_CODE_BYTES) {
    return res.status(413).json({
      error: "Code exceeds " + MAX_CODE_BYTES + " bytes",
    });
  }

  try {
    let result;
    switch (language) {
      case "python":
        result = await executePython(code, stdin);
        break;
      case "javascript":
        result = await executeJavaScript(code, stdin);
        break;
      case "java":
        result = await executeJava(code, stdin);
        break;
      default:
        return res.status(400).json({ error: "Unsupported language: " + language });
    }
    res.json(result);
  } catch (err) {
    console.error("execute error", err);
    res.status(500).json({
      error: err && err.message ? err.message : "Execution failed",
    });
  }
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log("AlgoPath runner listening on :" + PORT);
  if (!API_KEY) {
    console.warn("⚠ RUNNER_API_KEY not set — runner is OPEN. Set it for production.");
  }
});
