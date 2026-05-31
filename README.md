# AlgoPath

> Stop copying solutions. Start thinking.

AlgoPath is a logic-first algorithmic practice platform. Unlike traditional coding sites, **the code editor stays locked until you've written your problem-solving approach in plain English and an AI tutor approves it.** The goal: build genuine algorithmic thinking, not muscle memory.

![Phase: Understand → Logic → Code → Solved](https://img.shields.io/badge/flow-Understand%20%E2%86%92%20Logic%20%E2%86%92%20Code%20%E2%86%92%20Solved-10b981?style=flat-square)
![40 problems](https://img.shields.io/badge/problems-40-10b981?style=flat-square)
![Languages: Python · JavaScript · Java](https://img.shields.io/badge/langs-Python%20%C2%B7%20JS%20%C2%B7%20Java-10b981?style=flat-square)

---

## What makes it different

| Traditional sites | AlgoPath |
|---|---|
| Open editor → write code → maybe pass tests | Read problem → **explain your approach** → AI reviews it → editor unlocks → write code |
| Hints reveal whole solutions | Three progressive hints: vague → specific → near-explicit. **Never code.** |
| Pattern-match against known solutions | Forced to articulate *why* an approach works before touching syntax |

The result: you can't shortcut the thinking. The Logic Gate is enforced both client-side (locked overlay over the Monaco editor) and server-side (`/api/execute` and `/api/submit` reject requests when `Progress.logicApproved !== true`).

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + custom dark theme |
| Animations | Framer Motion + CSS keyframes |
| Editor | Monaco Editor (lazy-loaded) |
| State | Zustand |
| Database | Prisma 6 + SQLite (local) / Postgres (production) |
| Auth | NextAuth v5 (credentials) |
| AI | Google Gemini API (`@google/generative-ai`) |
| Code execution | Local `child_process.spawn` (Python / Node / Java) |
| Validation | Zod |
| Toasts | react-hot-toast |
| Icons | Lucide React |

---

## Quickstart (local)

```bash
# 1. Clone & install
git clone <your-fork-url>
cd algopath
npm install

# 2. Set up environment
cp .env.example .env       # then edit .env with your values

# 3. Initialize the database
npx prisma migrate dev
npx prisma db seed         # loads all 40 problems + a demo user

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo login:** `demo@algopath.dev` / `demo1234`

### Required runtimes

Code execution spawns local processes, so you need:

- **Python 3** (`python` on Windows, `python3` on macOS/Linux) — for Python submissions
- **Node.js 20+** — already required to run the app
- **Java 17+** with `javac` — for Java submissions

If a runtime is missing, only that language fails; the others still work.

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Prisma connection string. Local default: `file:./dev.db` |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | yes | NextAuth JWT signing key |
| `NEXTAUTH_URL` | yes (prod) | Public app URL, e.g. `https://your-app.vercel.app` |
| `GEMINI_API_KEY` | yes for AI | Get one at [aistudio.google.com](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | optional | Default: `gemini-2.0-flash`. Overridable to `gemini-2.5-flash`, `gemini-1.5-flash`, etc. |
| `EXEC_BACKEND` | optional | `local` (default) or `piston` (requires `PISTON_URL` for self-hosted Piston) |
| `PISTON_URL` | optional | Self-hosted Piston endpoint when `EXEC_BACKEND=piston` |

Local dev uses `.env` (loaded by Prisma) plus `.env.local` (loaded by Next.js, takes precedence over `.env`).

---

## Architecture

```
┌──────────────── Workspace page ────────────────┐
│                                                 │
│  ProblemPanel  │  PhaseIndicator                │
│   (left 40%)   │  ┌─ Understand → Logic →        │
│                │  │  Code → Solved (clickable    │
│   - desc       │  │  for backward navigation)    │
│   - examples   │  └────────────────────────────  │
│   - constraints│                                 │
│                │  LogicEditor / CodeEditorPanel  │
│                │   (one shown per phase)         │
│                │                                 │
│                │  TestResults (after run)        │
│                │  SolvedBanner (after submit)    │
│                │                                 │
│                │  HintDrawer (right slide-in)    │
└────────────────┴────────────────────────────────┘
```

### The Logic Gate

1. User reads the problem (`understand` phase).
2. Clicks **I Understand the Problem →** to advance to `logic`.
3. Writes their approach in the LogicEditor (≥50 chars).
4. **`POST /api/ai/review-logic`** sends approach to Gemini.
5. Gemini returns `{ approved, verdict, feedback, questions, encouragement }`.
6. If approved → `Progress.logicApproved = true`, phase advances to `coding`, editor unlocks.
7. If not → feedback panel with Socratic questions; user revises.

Once approved, **the user can navigate freely backward** through previous phases via clickable `PhaseIndicator` steps (max-phase tracked in the Zustand store). They can revisit their logic, the problem statement, or jump back to coding without re-reviewing.

### Code execution

By default, `runTestCases` spawns local processes:

- **Python** → temp file + `python main.py` with stdin piped
- **JavaScript** → temp file + `node main.js`
- **Java** → temp dir + `javac Main.java` + `java -cp <dir> Main`

10s run timeout, 20s compile timeout, 200KB output cap, isolated temp dir per run with cleanup. The local executor lives in [src/lib/local-exec.ts](src/lib/local-exec.ts); routing happens in [src/lib/piston.ts](src/lib/piston.ts) so swapping to a remote sandbox is one env var.

> ⚠️ **Local execution runs untrusted code with your user's permissions.** Fine for a localhost dev tool you use yourself; do not expose this server to the public internet. For multi-user deployment, set `EXEC_BACKEND=piston` and point `PISTON_URL` at a self-hosted [Piston](https://github.com/engineer-man/piston) instance, or use Docker isolation.

---

## Deploying to Vercel

This app is a real Next.js app (server components, API routes, server-side state) — so **GitHub Pages cannot host it**. Vercel is the natural fit.

### Step 1 — Set up a Postgres database

Vercel's serverless functions have a read-only filesystem in production, so the local SQLite file won't work. Use a hosted Postgres:

**Option A: Neon** (recommended, generous free tier)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a project, copy the connection string
3. It will look like: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

**Option B: Vercel Postgres** (one-click from the Vercel dashboard, also Neon-backed)

### Step 2 — Switch the Prisma datasource to PostgreSQL

In [`prisma/schema.prisma`](prisma/schema.prisma), change:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

to:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then locally, with `DATABASE_URL` pointing at your Neon database:

```bash
npx prisma migrate dev --name init_postgres
npx prisma db seed
```

This creates the schema in Postgres and seeds all 40 problems.

### Step 3 — Code execution caveat

Vercel serverless functions **do not have Python or Java available** and don't allow spawning long-running subprocesses. You have three options:

1. **Self-host Piston** on a small VM (Docker, ~$5/mo) and set `EXEC_BACKEND=piston` + `PISTON_URL=https://your-piston.example.com/api/v2/piston/execute`. Recommended for production.
2. **Disable code execution in production** — keep the logic-review experience as the headline feature, show a banner explaining tests run only locally.
3. **Use a serverless code-execution service** (e.g., [Judge0 on RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce)). Requires adapting the executor.

### Step 4 — Push to GitHub, then import to Vercel

```bash
# (Already done if you used the auto-push setup below.)
git push origin main
```

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Add environment variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `AUTH_SECRET`, `NEXTAUTH_URL` (will be `https://<project>.vercel.app`), `GEMINI_API_KEY`, `GEMINI_MODEL`, optionally `EXEC_BACKEND` + `PISTON_URL`
4. Deploy

That's it.

---

## Problem catalog

40 problems across three difficulties:

| Difficulty | Count | Topics |
|---|---|---|
| Easy | 15 | Arrays, Hash Tables, Strings, Stacks, Linked Lists, Binary Search, Bit Manipulation, Math, Two Pointers |
| Medium | 19 | Sliding Window, DP, BFS/DFS, Backtracking, Heap, Sorting, Matrix, Design |
| Hard | 6 | Two Pointers, Heap, Binary Search, Backtracking, DP, String matching |

Every problem ships with:

- A clear problem statement, 3 examples, 4–6 constraints
- 3 progressive hints (vague → specific → algorithmic walkthrough)
- Working starter code in **Python**, **JavaScript**, and **Java** with stdin/stdout drivers
- 5 test cases including edge cases

---

## Project layout

```
algopath/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Original 15 problems + demo user
│   └── seed-extended.ts       # 25 additional problems
├── src/
│   ├── app/
│   │   ├── (auth)/            # /login, /register
│   │   ├── api/               # All API routes (auth, problems, AI, execute, submit)
│   │   ├── problems/          # Problem list + workspace
│   │   ├── profile/           # User stats + history
│   │   ├── layout.tsx
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ai/                # HintDrawer
│   │   ├── layout/            # Navbar
│   │   ├── problems/          # Problem table, badges
│   │   ├── workspace/         # WorkspaceShell, LogicEditor, CodeEditorPanel, PhaseIndicator, TestResults, SolvedBanner
│   │   └── Providers.tsx
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── gemini.ts          # AI prompt builders + JSON validation
│   │   ├── local-exec.ts      # Local code execution (spawn)
│   │   ├── piston.ts          # Execution router (local/Piston)
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── utils.ts
│   ├── store/
│   │   └── workspace.ts       # Zustand store for the workspace page
│   └── types/
│       └── index.ts
└── README.md
```

---

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run start      # Start production server (after build)
npm run lint       # ESLint
npm run db:migrate # Run Prisma migrations
npm run db:seed    # Seed problems + demo user
npm run db:studio  # Open Prisma Studio
```

---

## License

MIT — use this however you like.
