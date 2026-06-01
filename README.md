# AlgoPath

> Stop copying solutions. Start thinking.

A coding-practice platform that **forces you to write your problem-solving logic in plain English before the code editor unlocks**. An AI tutor reads your approach, asks Socratic questions when you're vague or wrong, celebrates when you're right, and only then hands you the editor. The goal: build *thinkers*, not copy-pasters.

![Phase flow](https://img.shields.io/badge/flow-Understand%20%E2%86%92%20Logic%20%E2%86%92%20Code%20%E2%86%92%20Solved-10b981?style=flat-square)
![Problems](https://img.shields.io/badge/problems-40-10b981?style=flat-square)
![Languages](https://img.shields.io/badge/langs-Python%20%C2%B7%20JS%20%C2%B7%20Java-10b981?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-10b981?style=flat-square)

🌐 **Live demo:** [algopath.vercel.app](https://algopath-tan.vercel.app) · ⭐ **Star the repo** if you like the idea

> **Demo account** (no signup needed):
> ```
> demo@algopath.dev / demo1234
> ```

---

## 💭 Why I built this

I kept watching myself, and the people I tutor, fall into the same trap on every coding-interview platform: open a problem, peek at the discussion tab, internalize someone else's pattern, type it in. *Pass.* No actual thinking. No mental model. The next time the same shape of problem shows up under a different name, you're stuck again — because you trained your fingers, not your head.

AlgoPath is built around a single rule: **you cannot touch the code editor until you've explained, in your own words, how you'd solve the problem — and an AI tutor agrees that your approach is sound.** It nudges you when you're vague, asks Socratic questions when you're wrong, celebrates when you're right. The editor unlocks only when your *thinking* is in place.

If you've ever wondered why interview prep feels like memorization instead of skill-building, this is my attempt at fixing the loop.

---

## ✨ The pitch in one screen

```
   ┌────────────────┐    ┌────────────────┐    ┌────────────────┐    ┌──────────┐
   │ 📖 UNDERSTAND  │───▶│ 🧠 LOGIC       │───▶│ 💻 CODE        │───▶│ ✅ DONE  │
   │ Read problem   │    │ "Walk through  │    │ Editor unlocks │    │ Confetti │
   │                │    │  your approach │    │ Run / Submit   │    │ + AI     │
   │                │    │  in English."  │    │ tests          │    │ analysis │
   └────────────────┘    └───────┬────────┘    └────────────────┘    └──────────┘
                                 │
                            🤖 AI reviews:
                            ✓ approve  →  unlock editor
                            ✗ vague    →  Socratic question
                            ✗ wrong    →  guide back
```

The **Logic Gate** is the central design choice. The editor is server-side locked: `/api/execute` and `/api/submit` both refuse to run code unless `Progress.logicApproved === true` for the authenticated user-problem pair. Frontend-only locking is insufficient.

---

## What's in the box

| Feature                | What it does                                                                                  |
|------------------------|----------------------------------------------------------------------------------------------|
| **40 problems**        | Curated across Easy/Medium/Hard, each with descriptions, examples, constraints, and hints   |
| **3 languages**        | Python · JavaScript · Java — full stdin/stdout drivers, real test cases                     |
| **Logic Gate**         | Server-enforced: code editor unlocks only after AI approves your written approach           |
| **AI logic review**    | Gemini reads your plain-English approach and gives a verdict + Socratic questions           |
| **Progressive hints**  | Three hint levels per problem (vague → specific → near-explicit), enforced in order         |
| **Code analysis**      | Post-solve, Gemini analyzes your accepted solution for time/space complexity and improvements|
| **Auto-save**          | Every keystroke debounce-saves your code per language; refresh-proof                        |
| **Phase navigation**   | Travel back to any phase you've already unlocked; future phases stay locked                |
| **Leaderboard**        | Difficulty-weighted scoring, podium for top 3, top-50 table, 60s server cache               |
| **Profile**            | Solved counts by difficulty, hints used, recent submissions                                  |

---

## Stack

| Layer       | Choice                                                                                       |
|-------------|----------------------------------------------------------------------------------------------|
| Framework   | Next.js 16 (App Router, server components, Turbopack)                                       |
| Language    | TypeScript everywhere                                                                        |
| Styling     | Tailwind CSS v4 + custom theme tokens                                                        |
| State       | Zustand                                                                                      |
| Animations  | Framer Motion (page transitions, staggered lists, podium reveal) + canvas-confetti          |
| Editor      | Monaco Editor (lazy-loaded)                                                                  |
| Auth        | NextAuth v5 (credentials provider, JWT sessions, bcryptjs)                                   |
| ORM / DB    | Prisma 6 + PostgreSQL (Neon free tier in production, swap-ready for any Postgres)            |
| AI          | Google Generative AI SDK + Gemini (model name configurable via `GEMINI_MODEL`)               |
| Code exec   | JDoodle Compiler API (200 free executions/day, no card required)                             |
| Validation  | Zod                                                                                          |
| Rate limits | In-memory token-bucket (per-user / per-IP)                                                  |

---

## Architecture

```
                    ┌────────────────┐
                    │  github.com    │
                    │  (source)      │
                    └────────┬───────┘
                             │ push
                             ▼
                    ┌────────────────┐         ┌─────────────────┐
                    │     Vercel     │ ◀──────▶│  Neon Postgres  │
   user ───────────▶│  Next.js 16    │ Prisma  │  (data + auth)  │
                    │  - app routes  │         └─────────────────┘
                    │  - API routes  │
                    │  - server comp │         ┌─────────────────┐
                    │                │ ──────▶ │   Gemini API    │
                    │                │         │ (logic review,  │
                    │                │         │  hints, code    │
                    │                │         │  analysis)      │
                    │                │         └─────────────────┘
                    │                │
                    │                │         ┌─────────────────┐
                    │                │ ──────▶ │   JDoodle API   │
                    │                │         │ (run/submit code│
                    │                │         │  in py/js/java) │
                    └────────────────┘         └─────────────────┘
```

Every box is **free** — no credit card required for the deployment we ship. See [§ Deploy to Vercel](#deploy-to-vercel) for setup.

---

## Quick start (local)

```bash
git clone https://github.com/<your-org>/algopath.git
cd algopath
npm install
cp .env.example .env
# Fill in DATABASE_URL (any Postgres works locally too) and GEMINI_API_KEY

npx prisma migrate dev      # apply migrations
npx prisma db seed          # seed 40 problems + a demo user
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then sign in with the demo account:

```
demo@algopath.dev / demo1234
```

> **Local code execution.** When `EXEC_BACKEND` is unset and you're not on Vercel, the server spawns `python` / `node` / `java` directly on your machine via `child_process.spawn` (10s timeout, 200KB output cap). Best for solo dev — don't expose the dev server to the internet without putting JDoodle (or a sandbox) back in front.

---

## Deploy to Vercel

The whole stack runs on free tiers, no credit card anywhere. About 15 minutes end-to-end.

### 1. Database — Neon

1. Sign up at [neon.tech](https://neon.tech), create a new project
2. Copy the **pooled connection string** (Postgres-compatible)
3. Save it for the next step

### 2. Code execution — JDoodle

Vercel's Node runtime has no Python or Java, so we offload code execution to JDoodle's free Compiler API.

1. Sign up at [jdoodle.com/compiler-api](https://www.jdoodle.com/compiler-api)
2. Subscribe to the **Free** plan — email verification only, **no card required**
3. Copy your **Client ID** and **Client Secret**

### 3. AI — Gemini

1. Get a free API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Default model is `gemini-2.0-flash`. Override with `GEMINI_MODEL` if you want something newer (e.g., `gemini-2.5-flash`)

### 4. Vercel — Import

1. Push this repo to your GitHub account
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Framework: **Next.js** (auto-detected)
4. Add these **Environment Variables** (apply each to Production + Preview + Development):

| Key                      | Value                                                       |
|--------------------------|-------------------------------------------------------------|
| `DATABASE_URL`           | *(Neon connection string from step 1)*                      |
| `NEXTAUTH_SECRET`        | *(generate: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`)* |
| `AUTH_SECRET`            | *(same value as `NEXTAUTH_SECRET`)*                         |
| `AUTH_TRUST_HOST`        | `true`                                                      |
| `NEXTAUTH_URL`           | *(set after first deploy to your live URL)*                 |
| `NEXT_PUBLIC_SITE_URL`   | *(same as `NEXTAUTH_URL`)*                                  |
| `GEMINI_API_KEY`         | *(from step 3)*                                             |
| `GEMINI_MODEL`           | `gemini-2.0-flash` *(or override)*                          |
| `EXEC_BACKEND`           | `jdoodle`                                                   |
| `JDOODLE_CLIENT_ID`      | *(from step 2)*                                             |
| `JDOODLE_CLIENT_SECRET`  | *(from step 2)*                                             |

5. Click **Deploy**

Vercel runs the build script:
```
prisma generate && prisma migrate deploy && next build
```
which auto-applies all migrations to Neon — you don't need to run anything locally for production.

After the first deploy, copy the live URL into `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL`, then **Redeploy** once.

---

## Environment reference

```bash
# Required ──────────────────────────────────────────────────
DATABASE_URL=postgresql://user:pwd@host/db?sslmode=require
NEXTAUTH_SECRET=                  # 64+ random bytes, base64url
AUTH_SECRET=                      # same as NEXTAUTH_SECRET
GEMINI_API_KEY=

# Recommended ───────────────────────────────────────────────
AUTH_TRUST_HOST=true              # required behind Vercel/proxies
NEXTAUTH_URL=https://your.app
NEXT_PUBLIC_SITE_URL=https://your.app
GEMINI_MODEL=gemini-2.0-flash

# Code execution backend ────────────────────────────────────
EXEC_BACKEND=jdoodle              # jdoodle | local | piston | disabled

# When EXEC_BACKEND=jdoodle (recommended on Vercel)
JDOODLE_CLIENT_ID=
JDOODLE_CLIENT_SECRET=
# Optional per-language version overrides:
# JDOODLE_VERSION_PYTHON=4
# JDOODLE_VERSION_JAVASCRIPT=4
# JDOODLE_VERSION_JAVA=4

# When EXEC_BACKEND=piston (self-hosted)
# PISTON_URL=https://your-piston/api/v2/piston/execute
```

---

## Project layout

```
algopath/
├── prisma/
│   ├── schema.prisma                    # User, Problem, Submission, Progress
│   ├── migrations/                      # Auto-applied on Vercel build
│   ├── seed.ts                          # Upserts 40 problems by slug
│   └── seed-extended.ts                 # The +25 expansion problems
├── src/
│   ├── app/
│   │   ├── (auth)/                      # /login, /register
│   │   ├── api/
│   │   │   ├── ai/
│   │   │   │   ├── review-logic/        # Gemini logic verdict
│   │   │   │   ├── hint/                # Progressive hints (sequenced + auth-gated)
│   │   │   │   ├── review-code/         # Socratic debugging
│   │   │   │   └── analyze-code/        # Time/space analysis (cached on Submission)
│   │   │   ├── auth/                    # NextAuth + register
│   │   │   ├── problems/                # GET problems list + GET one
│   │   │   ├── progress/                # GET/PATCH per-user progress + autosave
│   │   │   ├── leaderboard/             # GET cached leaderboard
│   │   │   ├── execute/                 # Run code against sample tests
│   │   │   └── submit/                  # Run code against all tests
│   │   ├── leaderboard/page.tsx
│   │   ├── problems/[slug]/page.tsx     # Workspace
│   │   ├── profile/page.tsx
│   │   ├── robots.ts                    # Auto-generated /robots.txt
│   │   ├── sitemap.ts                   # Auto-generated /sitemap.xml
│   │   ├── layout.tsx                   # OG metadata, fonts, providers
│   │   └── page.tsx                     # Landing
│   ├── components/
│   │   ├── workspace/                   # WorkspaceShell, PhaseIndicator, LogicEditor,
│   │   │                                # CodeEditorPanel, TestResults, SolvedBanner,
│   │   │                                # CodeAnalysisCard, ProblemPanel, LanguageSelector
│   │   ├── problems/                    # ProblemTable, DifficultyBadge
│   │   ├── ai/HintDrawer.tsx
│   │   ├── layout/Navbar.tsx
│   │   └── Providers.tsx
│   ├── lib/
│   │   ├── prisma.ts                    # Singleton client
│   │   ├── auth.ts                      # NextAuth config
│   │   ├── api-auth.ts                  # getAuthedUserId() helper
│   │   ├── rate-limit.ts                # In-memory token bucket + presets
│   │   ├── gemini.ts                    # AI client + prompt templates
│   │   ├── piston.ts                    # Execution backend router
│   │   ├── local-exec.ts                # spawn() implementation (dev only)
│   │   ├── leaderboard.ts               # Cached aggregation (unstable_cache, 60s TTL)
│   │   └── utils.ts                     # cn(), safeJsonParse(), formatters
│   ├── store/workspace.ts               # Zustand: phases, code, hints, save status
│   └── types/
│       ├── index.ts                     # Shared DTOs
│       └── next-auth.d.ts               # session.user.id augmentation
└── package.json
```

---

## How it works

### The phases

`understand → logic → coding → solved`. Each is gated:

- **understand → logic**: a single button click; persists `phase` to the DB.
- **logic → coding**: requires `Progress.logicApproved = true`, set by the AI logic-review endpoint when it returns an approved verdict.
- **coding → solved**: requires all test cases to pass on submit.

The PhaseIndicator allows backward navigation through any phase you've ever reached (tracked as `maxPhase` in the store) but never forward to phases you haven't unlocked.

### Auto-save

Every keystroke debounces a `PATCH /api/progress` 1.2s after you stop typing. Drafts are stored as a JSON map of `{ python, javascript, java }` so switching language preserves each draft independently. Reset clears the draft for the active language only.

### Hint sequencing

A bitmask on `Progress.hintsRevealedMask` tracks which hint levels (1, 2, 3) you've revealed. Requesting hint N when N-1 hasn't been revealed returns 409. Repeat clicks for the same level still show the hint but don't inflate `hintsUsed`.

### Code analysis caching

After the AI analyzes an accepted submission, the JSON is persisted on `Submission.analysisJson`. Re-clicking **Analyze My Solution** for the same code returns the cached result; passing `refresh: true` forces a re-call.

### Acceptance rate

Computed live on every submit: each new submission increments `Problem.submissionCount`, and accepted ones also increment `Problem.acceptedCount`. The displayed rate is `acceptedCount / submissionCount * 100`.

### Rate limits

In-memory fixed-window counters per (userId or IP, endpoint). Defaults:

| Endpoint group              | Limit       |
|-----------------------------|-------------|
| AI (review/hint/analyze)    | 30 / min    |
| Code exec (run/submit)      | 20 / min    |
| Progress (autosave + nav)   | 120 / min   |
| Auth registration           | 5 / hour    |

In-memory state is per-function-instance — fine for hobby traffic. For production scale, swap [src/lib/rate-limit.ts](src/lib/rate-limit.ts) for Upstash Redis (same API surface).

---

## Scripts

```bash
npm run dev        # Next.js dev server (Turbopack)
npm run build      # prisma generate && prisma migrate deploy && next build
npm run start      # Start the production build
npm run lint       # ESLint
npm run db:migrate # prisma migrate dev (creates migration files)
npm run db:seed    # ts-node prisma/seed.ts (idempotent upsert)
npm run db:studio  # Prisma Studio
```

---

## Troubleshooting

| Symptom                                                                 | Likely cause / fix                                                                                       |
|-------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| `Code execution isn't available in this hosted environment`             | `EXEC_BACKEND` env var is unset on Vercel. Set it to `jdoodle` and redeploy.                             |
| `Invalid JDoodle credentials`                                           | Re-copy `JDOODLE_CLIENT_ID` and `JDOODLE_CLIENT_SECRET` from JDoodle's dashboard. Watch for whitespace.  |
| `JDoodle daily free quota exceeded (200 executions/day)`                | The free tier resets at midnight UTC. Wait or upgrade.                                                   |
| `API key not valid` from Gemini                                         | Either the model name doesn't exist for your project, or the key was pasted with a leading space.        |
| `AI response was truncated`                                             | Gemini ran out of output tokens. Raise `maxOutputTokens` in `src/lib/gemini.ts`.                          |
| Build fails on `prisma migrate deploy`                                  | Schema drift between your migration files and the live DB. Inspect Prisma logs and reconcile manually.   |
| `Too many requests. Try again in ~Ns.`                                  | You hit the rate limit (table above). Wait the duration shown.                                           |
| `Run Tests` works locally but fails on Vercel                           | Local backend (spawning `python`/`node`/`java`) only works on your dev machine. Use JDoodle on Vercel.    |

---

## Security notes

- Passwords hashed with **bcryptjs** (10 rounds)
- Sessions are signed JWTs (NextAuth v5 default)
- All `/api/ai/*` and `/api/{execute,submit}` routes verify auth + per-user rate limits
- The Logic Gate is enforced **server-side** on `/api/execute` and `/api/submit` (frontend lock is cosmetic)
- No `dangerouslySetInnerHTML`, no `eval`, no raw SQL — Prisma everywhere
- Code execution runs on JDoodle's sandbox in production; never on your own host
- Markdown rendering is hand-rolled and only handles trusted seed content; if you ever accept user-authored problems, swap to `react-markdown` + `rehype-sanitize`

If you find a security issue, open a private security advisory on GitHub rather than a public issue.

---

## Roadmap

A few directions I'm planning, in rough priority order. Tagged with effort so contributors can pick something appropriate:

| Idea | Effort | Why |
|---|---|---|
| **Daily challenge + streaks** | Low | Habit-forming. One curated problem per day, streak counter on the profile. |
| **Mock Interview Mode** | Medium-High | A 45-minute timed session where Gemini plays a tech interviewer, asks follow-ups, and grades on logic + communication + complexity awareness. |
| **Algorithm visualization on solve** | High | After acceptance, an animated diorama showing your code executing on a small example — array cells lighting up, hash maps filling, recursion stack growing. |
| **Adversarial test-case generator** | Medium | A button that asks Gemini to *try to break* your accepted solution with pathological inputs. |
| **Voice-first logic phase** | Medium | Speak your approach instead of typing — the most authentic "explain like a human would" experience. |
| **Whiteboard mode** | Medium-High | Sketch your logic with a pen tool; Gemini Vision interprets the drawing. |
| **Spaced-repetition queue** | Medium | Problems you struggled with resurface 3d / 1w / 1mo later. |
| **Skill tree** | Medium | Visual graph of topics + dependencies; mastery percentages; locked branches. |
| **VS Code extension** | High | Solve AlgoPath problems without leaving the editor. |

If any of those interest you, open an issue and let's talk.

---

## Contributing

PRs welcome. The repo aims to stay lean — single-purpose, no plugin system, no admin UI. Things that would be obvious wins:

- Additional problems (use `prisma/seed-extended.ts` as the format)
- More animations (the workspace already uses Framer Motion)
- Internationalization
- Additional execution backends (e.g., Judge0, browser-side Pyodide)
- Replace the markdown renderer with a vetted library
- Move rate-limit storage to Upstash for multi-instance deployments

Please run `npm run lint` and `npm run build` before pushing.

---

## License

MIT — see [LICENSE](LICENSE) for the full text.

---

## Acknowledgements

- **Google Gemini** for the AI tutor
- **JDoodle** for the free Compiler API
- **Neon** for serverless Postgres
- **Vercel** for hosting
