# AlgoPath Code Runner

A small HTTP service that compiles and runs user-submitted **Python**, **JavaScript**, and **Java** code in isolated temp directories with timeouts.

The main AlgoPath app (deployed on Vercel) calls this service whenever a user clicks **Run Tests** or **Submit**. The Vercel runtime can't spawn Python or Java itself, so this lives separately on Render's free tier.

---

## Architecture

```
┌──────────────────┐      POST /execute       ┌──────────────────┐
│ AlgoPath (Vercel)├────────────────────────► │ Runner (Render)  │
│   src/lib/piston │  x-api-key:RUNNER_KEY    │  spawn(node|     │
│       .ts        │ ◄────────────────────────│   python3|javac) │
└──────────────────┘   {stdout, stderr,...}   └──────────────────┘
```

Each request runs in its own `mkdtemp` directory, gets a 10s wall-clock timeout (20s for the Java compile step), and is killed if it exceeds 200KB of output. The container runs as a non-root `runner` user.

---

## Local development

```bash
cd runner
npm install
node server.js
# → AlgoPath runner listening on :3000
```

Test it:

```bash
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{"language":"python","code":"print(2+2)","stdin":""}'
# → {"stdout":"4\n","stderr":"","exitCode":0,"timedOut":false,"durationMs":42}
```

---

## Deploying to Render (free tier)

The repo root contains a [`render.yaml`](../render.yaml) Blueprint. The fastest deploy path:

1. Push your repo to GitHub (already done if you're following the AlgoPath setup).
2. Go to [render.com](https://render.com) → **New → Blueprint**.
3. Connect this GitHub repo.
4. Render reads `render.yaml`, shows you the `algopath-runner` service it'll create — click **Apply**.
5. Render builds the Docker image (~3-4 min on first deploy) and starts the service.
6. Once green, click into the service → **Environment** tab → copy the auto-generated `RUNNER_API_KEY`.
7. Copy the service URL from the top of the page (e.g. `https://algopath-runner-xxxx.onrender.com`).

Then in your **Vercel** project:

| Env var | Value |
|---|---|
| `EXEC_BACKEND` | `runner` |
| `RUNNER_URL` | `https://algopath-runner-xxxx.onrender.com` |
| `RUNNER_API_KEY` | *(the value from Render)* |

Redeploy Vercel. **Run Tests** and **Submit** now work end-to-end.

---

## Free-tier cold starts

Render's free tier spins the service down after ~15 minutes of inactivity. The first request after that wakes it back up and takes ~30 seconds. Subsequent requests are instant. AlgoPath's UI stays usable during the wake — the test results panel just shows a loading state for longer than usual.

If cold starts are a problem (e.g. for a portfolio piece you're showing live), the lightest fix is a tiny external uptime pinger (UptimeRobot has a free tier) hitting `/health` every 10 minutes.

---

## API

### `POST /execute`

Headers: `Content-Type: application/json`, `x-api-key: <RUNNER_API_KEY>`

```json
{
  "language": "python" | "javascript" | "java",
  "code": "<source code>",
  "stdin": "<input piped to the program's stdin>"
}
```

Response (always 200 unless input is invalid):

```json
{
  "stdout": "...",
  "stderr": "...",
  "exitCode": 0,
  "timedOut": false,
  "durationMs": 42
}
```

### `GET /health`

Returns `{"ok": true}`. Used by Render's healthcheck — no auth required.

---

## Security notes

- The runner only ever sees code, never user identity. It cannot connect back to the AlgoPath database.
- Each request runs in a fresh temp dir that's wiped on completion.
- The container runs as a non-root user with no privileged access.
- An attacker who guesses or steals `RUNNER_API_KEY` could use your Render quota — rotate it via Render's dashboard if that happens.
- This is **not** a fully sandboxed environment (no namespacing, no seccomp). Don't expose it to untrusted public traffic. The API-key gate is the real perimeter.

---

## Configuration (env vars)

| Var | Default | Effect |
|---|---|---|
| `RUNNER_API_KEY` | *(unset → open)* | Required header value for `/execute`. Set this in production. |
| `RUN_TIMEOUT_MS` | `10000` | Wall-clock cap per execution. |
| `COMPILE_TIMEOUT_MS` | `20000` | Wall-clock cap for `javac`. |
| `MAX_OUTPUT` | `200000` | Bytes of stdout/stderr captured before kill. |
| `MAX_CODE_BYTES` | `60000` | Reject submissions larger than this. |
| `ALLOWED_ORIGIN` | `*` | CORS origin. Restrict to your Vercel URL for production. |
| `PORT` | `3000` | HTTP port. |
