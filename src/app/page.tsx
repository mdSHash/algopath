import Link from "next/link";
import { ArrowRight, Brain, Code2, BookOpen, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DifficultyBadge } from "@/components/problems/DifficultyBadge";
import { safeJsonParse } from "@/lib/utils";

export default async function LandingPage() {
  const samples = await prisma.problem.findMany({
    where: { slug: { in: ["two-sum", "climbing-stairs", "3sum"] } },
    take: 3,
  });

  return (
    <div className="bg-[#0a0a0a]">
      <section className="relative bg-grid overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/60 to-[#0a0a0a]" />
        {/* Floating accent orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl animate-float"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-32 -right-20 h-80 w-80 rounded-full bg-emerald-700/10 blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-xs text-emerald-300 mb-6 animate-fade-up"
            style={{ animationDelay: "0.05s" }}
          >
            <Sparkles size={12} />
            Logic-first coding practice with AI tutoring
          </div>
          <h1
            className="text-5xl sm:text-6xl font-bold tracking-tight text-balance animate-fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            Stop Copying Solutions.{" "}
            <span className="bg-gradient-to-br from-emerald-300 via-emerald-400 to-emerald-600 bg-clip-text text-transparent animate-gradient">
              Start Thinking.
            </span>
          </h1>
          <p
            className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed text-balance animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            AlgoPath forces you to write your problem-solving logic before the code editor unlocks. Build real algorithmic thinking, not muscle memory.
          </p>
          <div
            className="flex items-center justify-center gap-3 mt-10 animate-fade-up"
            style={{ animationDelay: "0.45s" }}
          >
            <Link
              href="/problems"
              className="flex items-center gap-2 px-5 py-3 text-sm font-medium bg-emerald-500 hover:bg-emerald-400 hover:scale-[1.03] active:scale-[0.98] text-black rounded-md transition shadow-lg shadow-emerald-500/20 animate-glow"
            >
              Start Solving — Free
              <ArrowRight size={15} />
            </Link>
            <a
              href="#how"
              className="px-5 py-3 text-sm font-medium border border-[#2a2a2a] text-neutral-300 hover:text-neutral-100 hover:bg-neutral-900 hover:border-neutral-700 rounded-md transition"
            >
              See How It Works ↓
            </a>
          </div>
          <p
            className="mt-5 text-xs text-neutral-500 animate-fade-up"
            style={{ animationDelay: "0.6s" }}
          >
            Just looking? Sign in with the shared demo —{" "}
            <span className="font-mono text-neutral-400">demo@algopath.dev / demo1234</span>
            . Or{" "}
            <Link href="/register" className="text-emerald-400 hover:text-emerald-300 transition">
              create an account
            </Link>{" "}
            to track your own progress and climb the leaderboard.
          </p>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight">Three steps. One discipline.</h2>
          <p className="text-neutral-400 mt-2">The same loop every problem, every time.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <Step n={1} Icon={BookOpen} title="Read the Problem" desc="Examples, constraints, edge cases — internalize them before reaching for the keyboard." />
          <Step n={2} Icon={Brain} title="Write Your Logic — AI Reviews It" desc="Plain English or pseudocode. The AI tutor checks your approach and asks Socratic questions if you're off." accent />
          <Step n={3} Icon={Code2} title="Code Editor Unlocks" desc="Once your logic is sound, write code in Python, JavaScript, or Java. Run sample tests. Submit when ready." />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 border-t border-[#1a1a1a]">
        <h2 className="text-2xl font-semibold tracking-tight mb-2">Try a problem</h2>
        <p className="text-neutral-400 mb-8">Pick something at your level. We've got 15+ to start.</p>
        <div className="grid md:grid-cols-3 gap-4">
          {samples.map((p) => {
            const tags = safeJsonParse<string[]>(p.tags, []);
            return (
              <Link
                key={p.id}
                href={`/problems/${p.slug}`}
                className="block bg-[#111] border border-[#2a2a2a] rounded-lg p-5 hover:border-emerald-500/40 hover:bg-[#141414] transition group"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-mono text-neutral-500">#{p.number}</span>
                  <DifficultyBadge difficulty={p.difficulty} />
                </div>
                <h3 className="text-lg font-medium text-neutral-100 group-hover:text-emerald-400 transition">
                  {p.title}
                </h3>
                <p className="text-sm text-neutral-400 mt-2 line-clamp-3">
                  {p.description.replace(/[`*]/g, "").slice(0, 130)}…
                </p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {tags.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-[#2a2a2a]">
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link href="/problems" className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition">
            See all problems <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 border-t border-[#1a1a1a]">
        <div className="grid md:grid-cols-2 gap-8">
          <Feature Icon={Lock} title="The Logic Gate" desc="The code editor is locked until your written approach passes review. Forces you to think first, code second — the opposite of how most platforms train you." />
          <Feature Icon={Brain} title="AI Logic Review" desc="Gemini reads your approach. Approves what's correct, asks Socratic questions when you're vague or wrong. Never writes code for you." />
          <Feature Icon={Sparkles} title="Progressive Hints" desc="Three hint levels: vague → specific → near-explicit. Each one logged. Use them when stuck — but try without first." />
          <Feature Icon={CheckCircle2} title="Real Code Execution" desc="Your code runs against real test cases. Python, JavaScript, Java. No multiple choice — just real programs." />
        </div>
      </section>

      <footer className="border-t border-[#1a1a1a] py-8 text-center text-xs text-neutral-600">
        AlgoPath · Built for thinkers · Powered by Gemini + Piston
      </footer>
    </div>
  );
}

function Step({ n, Icon, title, desc, accent }: { n: number; Icon: typeof BookOpen; title: string; desc: string; accent?: boolean }) {
  return (
    <div className={`relative bg-[#111] border rounded-lg p-6 ${accent ? "border-emerald-500/40 glow-accent" : "border-[#2a2a2a]"}`}>
      <div className="absolute -top-3 left-6 px-2 py-0.5 text-[11px] font-mono rounded bg-[#0a0a0a] border border-[#2a2a2a] text-neutral-500">
        Step {n}
      </div>
      <Icon size={22} className={accent ? "text-emerald-400" : "text-neutral-400"} />
      <h3 className="text-lg font-medium mt-3 text-neutral-100">{title}</h3>
      <p className="text-sm text-neutral-400 mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}

function Feature({ Icon, title, desc }: { Icon: typeof BookOpen; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/20 shrink-0">
        <Icon size={18} className="text-emerald-400" />
      </div>
      <div>
        <h3 className="text-base font-medium text-neutral-100">{title}</h3>
        <p className="text-sm text-neutral-400 mt-1.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
