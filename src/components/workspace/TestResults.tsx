"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
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
    <div className="bg-[#0e0e0e] border-t border-[#2a2a2a] max-h-80 overflow-y-auto">
      <div
        className={`px-4 py-2.5 border-b border-[#2a2a2a] flex items-center justify-between ${
          status === "passed"
            ? "bg-emerald-950/30"
            : status === "failed"
            ? "bg-red-950/30"
            : ""
        }`}
      >
        <div className="flex items-center gap-2">
          {allPassed ? (
            <Check size={16} className="text-emerald-400" />
          ) : (
            <X size={16} className="text-red-400" />
          )}
          <span className="text-sm font-medium text-neutral-100">
            {allPassed
              ? "All Tests Passed"
              : status === "passed"
              ? "Submission: Accepted"
              : `${passed} / ${total} tests passed`}
          </span>
        </div>
        <div className="flex-1 max-w-[140px] h-1.5 bg-neutral-900 rounded-full overflow-hidden ml-3">
          <div
            className={`h-full transition-all ${
              allPassed ? "bg-emerald-500" : "bg-red-500"
            }`}
            style={{ width: `${total > 0 ? (passed / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-[#1f1f1f]">
        {results.map((r, idx) => (
          <TestRow key={r.testCase} result={r} index={idx} />
        ))}
      </div>
    </div>
  );
}

function TestRow({ result, index }: { result: TestResult; index: number }) {
  // L-3: full output is collapsed by default but can be expanded so the user
  // sees the entire diff for long outputs (previously truncated at 200 chars).
  const [expanded, setExpanded] = useState(!result.passed);
  const PREVIEW_LIMIT = 200;
  const needsExpander =
    result.input.length > PREVIEW_LIMIT ||
    result.expectedOutput.length > PREVIEW_LIMIT ||
    result.actualOutput.length > PREVIEW_LIMIT ||
    (result.error?.length ?? 0) > PREVIEW_LIMIT;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: "easeOut" }}
      className="px-4 py-3"
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center justify-between w-full text-left group"
      >
        <div className="flex items-center gap-2">
          {result.passed ? (
            <Check size={14} className="text-emerald-400" />
          ) : result.error ? (
            <AlertTriangle size={14} className="text-amber-400" />
          ) : (
            <X size={14} className="text-red-400" />
          )}
          <span className="text-sm text-neutral-200">Test {result.testCase}</span>
        </div>
        <div className="flex items-center gap-2">
          {result.runtime && (
            <span className="text-[11px] font-mono text-neutral-500">
              {result.runtime}
            </span>
          )}
          {expanded ? (
            <ChevronDown size={13} className="text-neutral-500 group-hover:text-neutral-300" />
          ) : (
            <ChevronRight size={13} className="text-neutral-500 group-hover:text-neutral-300" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="mt-2 ml-6 text-xs font-mono space-y-1">
          <Field label="Input" value={result.input} preview={!needsExpander ? PREVIEW_LIMIT : Infinity} />
          <Field
            label="Expected"
            value={result.expectedOutput}
            preview={!needsExpander ? PREVIEW_LIMIT : Infinity}
            valueClass="text-emerald-400"
          />
          <Field
            label="Got"
            value={result.error ? "(error)" : result.actualOutput || "(empty)"}
            preview={!needsExpander ? PREVIEW_LIMIT : Infinity}
            valueClass={result.error ? "text-amber-400" : result.passed ? "text-emerald-400" : "text-red-400"}
          />
          {result.error && (
            <div className="mt-1 px-2 py-1.5 bg-red-950/30 border border-red-900/50 rounded text-red-300 whitespace-pre-wrap text-[11px]">
              {result.error}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function Field({
  label,
  value,
  preview,
  valueClass = "text-neutral-300",
}: {
  label: string;
  value: string;
  preview: number;
  valueClass?: string;
}) {
  const display = value.length > preview ? value.slice(0, preview) + "…" : value;
  return (
    <div>
      <span className="text-neutral-600">{label}: </span>
      <span className={`${valueClass} whitespace-pre-wrap break-all`}>{display}</span>
    </div>
  );
}
