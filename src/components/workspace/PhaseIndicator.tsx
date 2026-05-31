"use client";
import { useEffect, useState } from "react";
import { BookOpen, Brain, Code as CodeIcon, CheckCircle2, Lock } from "lucide-react";
import { useWorkspaceStore, PHASE_ORDER } from "@/store/workspace";
import { formatDuration } from "@/lib/utils";
import type { Phase } from "@/types";

const STEPS: { key: Phase; label: string; Icon: typeof BookOpen }[] = [
  { key: "understand", label: "Understand", Icon: BookOpen },
  { key: "logic", label: "Logic", Icon: Brain },
  { key: "coding", label: "Code", Icon: CodeIcon },
  { key: "solved", label: "Done", Icon: CheckCircle2 },
];

export function PhaseIndicator({
  onNavigate,
}: {
  onNavigate?: (phase: Phase) => void;
}) {
  const phase = useWorkspaceStore((s) => s.phase);
  const maxPhase = useWorkspaceStore((s) => s.maxPhase);
  const startedAt = useWorkspaceStore((s) => s.startedAt);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!startedAt || phase === "solved") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [startedAt, phase]);

  const currentIdx = PHASE_ORDER[phase];
  const maxIdx = PHASE_ORDER[maxPhase];

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#0e0e0e] border-b border-[#2a2a2a]">
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
        {STEPS.map((s, idx) => {
          const isCurrent = idx === currentIdx;
          const isReachable = idx <= maxIdx;
          const isCompleted = idx < currentIdx || phase === "solved";
          const isLocked = idx > maxIdx;
          const Icon = isLocked ? Lock : s.Icon;

          // Clickable iff reachable, not the current step, and a navigate handler exists.
          const clickable = isReachable && !isCurrent && !!onNavigate;

          const baseClasses =
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all";
          const stateClasses = isCurrent
            ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40 animate-pulse-accent cursor-default"
            : isCompleted
            ? clickable
              ? "text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              : "text-emerald-400"
            : isReachable
            ? clickable
              ? "text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 cursor-pointer"
              : "text-neutral-300"
            : "text-neutral-600 cursor-not-allowed";

          const stepNode = (
            <div className={`${baseClasses} ${stateClasses}`}>
              <Icon size={14} />
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          );

          return (
            <div key={s.key} className="flex items-center">
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onNavigate?.(s.key)}
                  title={
                    isCompleted
                      ? `Go back to ${s.label}`
                      : `Go to ${s.label}`
                  }
                  className="focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/60 rounded-md"
                >
                  {stepNode}
                </button>
              ) : (
                <div
                  title={
                    isLocked
                      ? `Complete the previous step to unlock ${s.label}`
                      : isCurrent
                      ? `Current step: ${s.label}`
                      : s.label
                  }
                >
                  {stepNode}
                </div>
              )}
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-px w-4 sm:w-8 mx-0.5 ${
                    idx < maxIdx ? "bg-emerald-500/40" : "bg-[#2a2a2a]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      {startedAt && (
        <div className="text-xs font-mono text-neutral-500 shrink-0 ml-2">
          {formatDuration(now - startedAt)}
        </div>
      )}
    </div>
  );
}
