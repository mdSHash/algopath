"use client";
import { Lightbulb, Send, Loader2 } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace";

const MIN_LENGTH = 50;

export function LogicEditor({
  onSubmit,
  onHint,
  collapsed = false,
}: {
  onSubmit: () => void;
  onHint: () => void;
  collapsed?: boolean;
}) {
  const logicText = useWorkspaceStore((s) => s.logicText);
  const setLogicText = useWorkspaceStore((s) => s.setLogicText);
  const isReviewing = useWorkspaceStore((s) => s.isReviewingLogic);
  const phase = useWorkspaceStore((s) => s.phase);
  const logicApproved = useWorkspaceStore((s) => s.logicApproved);

  const charCount = logicText.length;
  const canSubmit = charCount >= MIN_LENGTH && !isReviewing && phase === "logic";

  if (collapsed) {
    return (
      <div className="px-4 py-2 border-b border-[#2a2a2a] bg-[#0e0e0e] text-xs text-neutral-500 flex items-center justify-between">
        <span>
          ✓ Logic approved — <span className="text-emerald-400">{charCount} chars</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
            📝 Your Approach
          </h3>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Be specific about your algorithm, data structures, and key steps.
          </p>
        </div>
        <div className="text-[11px] font-mono text-neutral-500">
          <span
            className={
              charCount >= MIN_LENGTH ? "text-emerald-400" : "text-neutral-500"
            }
          >
            {charCount}
          </span>
          <span className="text-neutral-700"> / {MIN_LENGTH} min</span>
        </div>
      </div>

      <textarea
        value={logicText}
        onChange={(e) => setLogicText(e.target.value)}
        disabled={logicApproved || isReviewing}
        placeholder="Describe how you'd solve this in plain English or pseudocode. No code syntax needed. Just explain your thinking…

Example:
1. I'll iterate through the array once.
2. For each element, I'll check whether (target - element) is in a hash map.
3. If yes, return the indices. If no, store the current element and its index in the hash map."
        className="flex-1 w-full bg-[#0a0a0a] text-neutral-200 px-4 py-3 text-[13px] font-mono leading-relaxed resize-none outline-none placeholder:text-neutral-700 disabled:opacity-60"
      />

      <div className="px-4 py-3 border-t border-[#2a2a2a] flex items-center justify-between gap-3">
        <button
          onClick={onHint}
          disabled={isReviewing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-400/10 border border-amber-400/30 rounded-md transition disabled:opacity-50"
        >
          <Lightbulb size={14} />
          Get a Hint
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-black rounded-md transition"
        >
          {isReviewing ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Reviewing…
            </>
          ) : (
            <>
              <Send size={14} />
              Submit Logic for Review
            </>
          )}
        </button>
      </div>
    </div>
  );
}
