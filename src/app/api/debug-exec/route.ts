// Debug endpoint: GET /api/debug-exec
// Reports which execution-backend env vars Vercel actually loaded, without
// revealing their values. Safe to ship publicly — only booleans + the
// already-public EXEC_BACKEND choice are returned.
//
// Remove this route once production is happy.

export async function GET() {
  const exec = (process.env.EXEC_BACKEND ?? "").trim();
  const cid = (process.env.JDOODLE_CLIENT_ID ?? "").trim();
  const sec = (process.env.JDOODLE_CLIENT_SECRET ?? "").trim();
  const runnerUrl = (process.env.RUNNER_URL ?? "").trim();
  const runnerKey = (process.env.RUNNER_API_KEY ?? "").trim();

  return Response.json({
    runtime: {
      isVercel: process.env.VERCEL === "1",
      nodeVersion: process.version,
      nextRuntime: process.env.NEXT_RUNTIME ?? "nodejs",
    },
    execBackend: {
      EXEC_BACKEND: exec || "(unset)",
      // booleans only — never reveal the actual secret values
      JDOODLE_CLIENT_ID_present: cid.length > 0,
      JDOODLE_CLIENT_ID_length: cid.length,
      JDOODLE_CLIENT_SECRET_present: sec.length > 0,
      JDOODLE_CLIENT_SECRET_length: sec.length,
      RUNNER_URL_present: runnerUrl.length > 0,
      RUNNER_API_KEY_present: runnerKey.length > 0,
    },
    diagnosis:
      exec === "jdoodle" && cid && sec
        ? "OK — JDoodle backend should be active."
        : exec === ""
        ? "EXEC_BACKEND is not set at runtime. Add it in Vercel Settings → Environment Variables, then **redeploy** (env changes don't apply to existing deployments)."
        : exec === "jdoodle"
        ? "EXEC_BACKEND=jdoodle is set, but credentials are missing. Add JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET, then redeploy."
        : `EXEC_BACKEND=${exec} is set but unsupported. Use 'jdoodle' for the free path.`,
  });
}
