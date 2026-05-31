"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Clock,
  HardDrive,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  Loader2,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";
import type { CodeAnalysis } from "@/types";

const VERDICT_STYLES = {
  Optimal: {
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    label: "Optimal",
    icon: Award,
  },
  Good: {
    border: "border-emerald-400/30",
    bg: "bg-emerald-400/5",
    text: "text-emerald-300",
    label: "Good",
    icon: CheckCircle2,
  },
  Acceptable: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    text: "text-amber-300",
    label: "Acceptable",
    icon: TrendingUp,
  },
  Suboptimal: {
    border: "border-red-500/40",
    bg: "bg-red-500/10",
    text: "text-red-300",
    label: "Suboptimal",
    icon: TrendingUp,
  },
} as const;

export function CodeAnalysisCard({
  problemId,
  code,
  language,
}: {
  problemId: string;
  code: string;
  language: string;
}) {
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  async function runAnalysis() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/analyze-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, code, language }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Analysis failed");
        return;
      }
      setAnalysis(data.analysis as CodeAnalysis);
    } catch {
      toast.error("Couldn't reach the analyzer.");
    } finally {
      setLoading(false);
    }
  }

  if (!analysis && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mx-4 mt-2 mb-4 rounded-xl border border-[#2a2a2a] bg-[#0e0e0e] p-5"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/20 shrink-0">
            <Sparkles size={18} className="text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-neutral-100">
              Want a code analysis?
            </h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              The AI tutor can analyze your accepted solution for time
              complexity, space usage, and concrete improvements you could
              make. Free, takes ~5 seconds.
            </p>
            <button
              onClick={runAnalysis}
              className="mt-3 flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-black rounded-md transition"
            >
              <Sparkles size={13} />
              Analyze My Solution
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="mx-4 mt-2 mb-4 rounded-xl border border-[#2a2a2a] bg-[#0e0e0e] p-6 flex items-center justify-center gap-3 text-neutral-400 text-sm">
        <Loader2 size={16} className="animate-spin text-emerald-400" />
        Analyzing your code…
      </div>
    );
  }

  const style = VERDICT_STYLES[analysis!.verdict] ?? VERDICT_STYLES.Acceptable;
  const VerdictIcon = style.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={`mx-4 mt-2 mb-4 rounded-xl border ${style.border} ${style.bg} p-5`}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-md bg-[#0a0a0a] border ${style.border} shrink-0`}>
            <VerdictIcon size={18} className={style.text} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-neutral-100">Code Analysis</h3>
              <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${style.border} ${style.text}`}>
                {style.label}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              {analysis!.reasoning}
            </p>
          </div>
        </div>

        {/* Complexity grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <ComplexityBox
            Icon={Clock}
            label="Time Complexity"
            yours={analysis!.yourComplexity.time}
            optimal={analysis!.optimalComplexity.time}
            isOptimal={analysis!.yourComplexity.time === analysis!.optimalComplexity.time}
          />
          <ComplexityBox
            Icon={HardDrive}
            label="Space Complexity"
            yours={analysis!.yourComplexity.space}
            optimal={analysis!.optimalComplexity.space}
            isOptimal={analysis!.yourComplexity.space === analysis!.optimalComplexity.space}
          />
        </div>

        {/* Memory notes */}
        {analysis!.memoryNotes && (
          <div className="mb-4 px-3 py-2 rounded-md bg-[#0a0a0a] border border-[#2a2a2a] text-xs text-neutral-400 leading-relaxed">
            <span className="text-neutral-500 font-medium">Memory:</span>{" "}
            {analysis!.memoryNotes}
          </div>
        )}

        {/* Strengths */}
        {analysis!.strengths.length > 0 && (
          <div className="mb-3">
            <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 size={12} />
              What you did well
            </div>
            <ul className="space-y-1">
              {analysis!.strengths.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="text-xs text-neutral-300 leading-relaxed pl-4 relative"
                >
                  <span className="absolute left-0 text-emerald-500">▸</span>
                  {s}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {analysis!.suggestions.length > 0 && (
          <div>
            <div className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold mb-1.5 flex items-center gap-1.5">
              <Lightbulb size={12} />
              How to improve
            </div>
            <ul className="space-y-1">
              {analysis!.suggestions.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="text-xs text-neutral-300 leading-relaxed pl-4 relative"
                >
                  <span className="absolute left-0 text-amber-500">▸</span>
                  {s}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={runAnalysis}
          className="mt-4 text-[11px] text-neutral-500 hover:text-neutral-300 transition"
        >
          ↻ Re-analyze
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

function ComplexityBox({
  Icon,
  label,
  yours,
  optimal,
  isOptimal,
}: {
  Icon: typeof Clock;
  label: string;
  yours: string;
  optimal: string;
  isOptimal: boolean;
}) {
  return (
    <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-md p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-neutral-500 mb-1.5">
        <Icon size={11} />
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={`font-mono text-lg font-semibold ${
            isOptimal ? "text-emerald-300" : "text-amber-300"
          }`}
        >
          {yours}
        </span>
        {!isOptimal && (
          <span className="text-[10px] text-neutral-500">
            (optimal: <span className="text-emerald-400 font-mono">{optimal}</span>)
          </span>
        )}
      </div>
    </div>
  );
}
