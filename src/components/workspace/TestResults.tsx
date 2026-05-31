"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertTriangle } from "lucide-react";
import type { TestResult } from "@/types";

export function TestResults({
  results,
  status,
}: {
  results: TestResult[] | null;
  status: "idle" | "running" | "passed" | "failed";
}) {
  if (!results || results.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-sm text-neutral-600">
        Run your code to see test results.
      </div>
    );
  }

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const allPassed = passed === total;

  return (
    <div className="bg-[#0e0e0e] border-t border-[#2a2a2a] max-h-72 overflow-y-auto">
      <div className={`px-4 py-2.5 border-b border-[#2a2a2a] flex items-center justify-between ${
        status === "passed" ? "bg-emerald-950/30" :
        status === "failed" ? "bg-red-950/30" :
        ""
      }`}>
        <div className="flex items-center gap-2">
          {allPassed ? (
            <Check size={16} className="text-emerald-400" />
          ) : (
            <X size={16} className="text-red-400" />
          )}
          <span className="text-sm font-medium text-neutral-100">
            {allPassed ? "All Tests Passed" : status === "passed" ? "Submission: Accepted" : `${passed} / ${total} tests passed`}
          </span>
        </div>
        <div className="flex-1 max-w-[140px] h-1.5 bg-neutral-900 rounded-full overflow-hidden ml-3">
          <div
            className={`h-full transition-all ${allPassed ? "bg-emerald-500" : "bg-red-500"}`}
            style={{ width: `${total > 0 ? (passed / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-[#1f1f1f]">
        {results.map((r, idx) => (
          <motion.div
            key={r.testCase}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05, ease: "easeOut" }}
            className="px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {r.passed ? (
                  <Check size={14} className="text-emerald-400" />
                ) : r.error ? (
                  <AlertTriangle size={14} className="text-amber-400" />
                ) : (
                  <X size={14} className="text-red-400" />
                )}
                <span className="text-sm text-neutral-200">Test {r.testCase}</span>
              </div>
              {r.runtime && (
                <span className="text-[11px] font-mono text-neutral-500">{r.runtime}</span>
              )}
            </div>
            {!r.passed && (
              <div className="mt-2 ml-6 text-xs font-mono space-y-1">
                <div>
                  <span className="text-neutral-600">Input:    </span>
                  <span className="text-neutral-300 whitespace-pre-wrap break-all">{truncate(r.input, 200)}</span>
                </div>
                <div>
                  <span className="text-neutral-600">Expected: </span>
                  <span className="text-emerald-400">{truncate(r.expectedOutput, 200)}</span>
                </div>
                <div>
                  <span className="text-neutral-600">Got:      </span>
                  <span className="text-red-400 whitespace-pre-wrap break-all">
                    {r.error ? `(error)` : truncate(r.actualOutput || "(empty)", 200)}
                  </span>
                </div>
                {r.error && (
                  <div className="mt-1 px-2 py-1.5 bg-red-950/30 border border-red-900/50 rounded text-red-300 whitespace-pre-wrap text-[11px]">
                    {truncate(r.error, 600)}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + "…";
}
