"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, HelpCircle, Eye, Unlock, RotateCcw } from "lucide-react";
import type { LogicReview } from "@/types";

const STATE_STYLES = {
  Correct: {
    bg: "bg-emerald-950/40",
    border: "border-emerald-500/40",
    text: "text-emerald-200",
    accent: "text-emerald-400",
    Icon: CheckCircle2,
    title: "Logic Approved!",
  },
  "Partially Correct": {
    bg: "bg-amber-950/40",
    border: "border-amber-500/40",
    text: "text-amber-100",
    accent: "text-amber-400",
    Icon: AlertTriangle,
    title: "Almost There!",
  },
  Incorrect: {
    bg: "bg-red-950/40",
    border: "border-red-800/50",
    text: "text-red-100",
    accent: "text-red-400",
    Icon: HelpCircle,
    title: "Let's Think This Through",
  },
  "Too Vague": {
    bg: "bg-neutral-900/80",
    border: "border-neutral-700",
    text: "text-neutral-200",
    accent: "text-neutral-300",
    Icon: Eye,
    title: "Be More Specific",
  },
} as const;

export function LogicReviewPanel({
  review,
  onUnlockEditor,
  onReviseLogic,
}: {
  review: LogicReview | null;
  onUnlockEditor: () => void;
  onReviseLogic: () => void;
}) {
  return (
    <AnimatePresence mode="wait">
      {review && (
        <motion.div
          key={review.verdict + review.feedback}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`mx-4 my-3 rounded-lg border ${STATE_STYLES[review.verdict].bg} ${STATE_STYLES[review.verdict].border} p-4`}
        >
          <ReviewBody
            review={review}
            onUnlockEditor={onUnlockEditor}
            onReviseLogic={onReviseLogic}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ReviewBody({
  review,
  onUnlockEditor,
  onReviseLogic,
}: {
  review: LogicReview;
  onUnlockEditor: () => void;
  onReviseLogic: () => void;
}) {
  const style = STATE_STYLES[review.verdict];
  const { Icon } = style;

  return (
    <div>
      <div className="flex items-start gap-3">
        <Icon size={22} className={`${style.accent} mt-0.5 shrink-0`} />
        <div className="flex-1">
          <h3 className={`text-base font-semibold ${style.text}`}>{style.title}</h3>
          <p className={`text-sm mt-1.5 leading-relaxed ${style.text}/90`}>
            {review.feedback}
          </p>

          {review.questions.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                Think about:
              </div>
              {review.questions.map((q, i) => (
                <div
                  key={i}
                  className="text-sm pl-3 border-l-2 border-neutral-700 text-neutral-300"
                >
                  {q}
                </div>
              ))}
            </div>
          )}

          {review.encouragement && (
            <p className={`text-xs italic mt-3 ${style.accent}`}>
              ✨ {review.encouragement}
            </p>
          )}

          <div className="flex gap-2 mt-4">
            {review.approved ? (
              <button
                onClick={onUnlockEditor}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-black rounded-md transition"
              >
                <Unlock size={14} />
                Unlock Code Editor →
              </button>
            ) : (
              <button
                onClick={onReviseLogic}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-[#2a2a2a] rounded-md transition"
              >
                <RotateCcw size={14} />
                Revise My Logic
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
