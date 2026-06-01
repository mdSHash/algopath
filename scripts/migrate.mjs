// Wrapper around `prisma migrate deploy` with retry/backoff.
//
// Why this exists: Neon's free-tier compute auto-suspends after 5 minutes of
// inactivity. The first connection from a Vercel build wakes the DB up, but
// the wake-up usually takes ~5-10 seconds, longer than the default Postgres
// connection timeout. Result: the very first migrate-deploy call after an
// idle period returns P1001 (can't reach DB), even though the DB is fine.
//
// We retry with linear backoff. By the third attempt the DB is always warm.
// On final failure we exit with the underlying code so the Vercel build
// surfaces the real error instead of silently shipping stale schema.

import { spawn } from "node:child_process";

const MAX_ATTEMPTS = 6;
const BASE_DELAY_MS = 4000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function runMigrate() {
  return new Promise((resolve) => {
    const child = spawn(
      process.platform === "win32" ? "npx.cmd" : "npx",
      ["prisma", "migrate", "deploy"],
      { stdio: "inherit", shell: false }
    );
    child.on("error", (err) => {
      console.error("Failed to spawn prisma:", err.message);
      resolve(127);
    });
    child.on("close", (code) => resolve(code ?? 1));
  });
}

let lastCode = 1;
for (let i = 1; i <= MAX_ATTEMPTS; i++) {
  console.log(`\n→ prisma migrate deploy — attempt ${i}/${MAX_ATTEMPTS}`);
  lastCode = await runMigrate();
  if (lastCode === 0) {
    console.log(`✓ Migrations applied (or already up to date) on attempt ${i}.`);
    process.exit(0);
  }
  if (i < MAX_ATTEMPTS) {
    const wait = BASE_DELAY_MS * i;
    console.log(
      `  exit ${lastCode}; database may be cold-starting. Retrying in ${wait}ms…`
    );
    await sleep(wait);
  }
}

console.error(
  `\n✗ All ${MAX_ATTEMPTS} migration attempts failed (last exit code ${lastCode}). ` +
    `If this is a Neon free-tier cold start, re-run the build to retry.`
);
process.exit(lastCode);
