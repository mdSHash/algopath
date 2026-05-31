"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb, Loader2, Lock } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace";

export function HintDrawer({
  onRequestHint,
}: {
  onRequestHint: () => Promise<void>;
}) {
  const isOpen = useWorkspaceStore((s) => s.isHintOpen);
  const setIsOpen = useWorkspaceStore((s) => s.setIsHintOpen);
  const hintsRevealed = useWorkspaceStore((s) => s.hintsRevealed);
  const hintsContent = useWorkspaceStore((s) => s.hintsContent);
  const isLoading = useWorkspaceStore((s) => s.isLoadingHint);
  const phase = useWorkspaceStore((s) => s.phase);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/60"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-[#0e0e0e] border-l border-[#2a2a2a] z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <Lightbulb size={18} className="text-amber-400" />
                <div>
                  <h3 className="text-sm font-semibold text-neutral-100">
                    {phase === "logic" ? "Logic Hints" : "Code Hints"}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Each hint is logged. Try thinking it through first!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-neutral-100 p-1 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {hintsContent.length === 0 && !isLoading && (
                <div className="text-center text-sm text-neutral-500 py-8">
                  No hints revealed yet. Click below to get your first hint.
                </div>
              )}

              {hintsContent.map((content, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111] border border-[#2a2a2a] rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/15 text-amber-400 text-xs font-semibold">
                      {idx + 1}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">
                      Hint {idx + 1}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">
                    {content}
                  </p>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-neutral-500">
                  <Loader2 size={16} className="animate-spin" />
                  Loading hint…
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-[#2a2a2a] bg-[#0a0a0a]">
              {hintsRevealed >= 3 ? (
                <div className="flex items-center gap-2 text-sm text-neutral-500 justify-center py-2">
                  <Lock size={14} />
                  No more hints available
                </div>
              ) : (
                <button
                  onClick={() => onRequestHint()}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-amber-400 hover:bg-amber-300 disabled:bg-neutral-800 disabled:text-neutral-600 text-black rounded-md transition"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Loading…
                    </>
                  ) : (
                    <>
                      <Lightbulb size={14} />
                      Reveal Hint {hintsRevealed + 1} of 3
                    </>
                  )}
                </button>
              )}
              <div className="text-[11px] text-neutral-500 mt-2 text-center">
                Hints used: <span className="text-amber-400 font-medium">{hintsRevealed}</span> / 3
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
