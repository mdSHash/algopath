"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";
import { formatDuration } from "@/lib/utils";

export function SolvedBanner({
  problemTitle,
  elapsedMs,
  hintsUsed,
  testsTotal,
}: {
  problemTitle: string;
  elapsedMs: number | null;
  hintsUsed: number;
  testsTotal: number;
}) {
  useEffect(() => {
    const fire = (particles: number, opts: confetti.Options) => {
      confetti({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particles),
        colors: ["#10b981", "#34d399", "#059669", "#fbbf24"],
      });
    };
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="m-4 rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/60 to-[#0e0e0e] p-6 glow-accent"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 shrink-0">
          <Trophy size={24} className="text-emerald-300" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-emerald-200">Problem Solved!</h2>
          <p className="text-sm text-neutral-300 mt-1">
            Nice work on <span className="text-emerald-400 font-medium">{problemTitle}</span>. You thought it through, then coded it.
          </p>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <Stat label="Time" value={elapsedMs ? formatDuration(elapsedMs) : "—"} />
            <Stat label="Hints used" value={`${hintsUsed} / 3`} />
            <Stat label="Tests passed" value={`${testsTotal} / ${testsTotal}`} />
          </div>

          <div className="flex gap-2 mt-5">
            <Link
              href="/problems"
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-black rounded-md transition"
            >
              Next Problem
              <ChevronRight size={14} />
            </Link>
            <Link
              href="/profile"
              className="px-3.5 py-2 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-[#2a2a2a] rounded-md transition"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-neutral-500">{label}</div>
      <div className="text-sm font-semibold text-neutral-100 mt-0.5">{value}</div>
    </div>
  );
}
