"use client";
import { Suspense, lazy, useEffect } from "react";
import { Lock, Lightbulb, Play, RotateCcw, Send, Loader2 } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace";
import { LanguageSelector } from "./LanguageSelector";
import type { ProblemDTO } from "@/types";

const MonacoEditor = lazy(() =>
  import("@monaco-editor/react").then((m) => ({ default: m.default }))
);

export function CodeEditorPanel({
  problem,
  onRun,
  onSubmit,
  onHint,
  onResetCode,
}: {
  problem: ProblemDTO;
  onRun: () => void;
  onSubmit: () => void;
  onHint: () => void;
  onResetCode: () => void;
}) {
  const phase = useWorkspaceStore((s) => s.phase);
  const language = useWorkspaceStore((s) => s.language);
  const setLanguage = useWorkspaceStore((s) => s.setLanguage);
  const code = useWorkspaceStore((s) => s.code);
  const setCode = useWorkspaceStore((s) => s.setCode);
  const isRunning = useWorkspaceStore((s) => s.isRunningCode);
  const isSubmitting = useWorkspaceStore((s) => s.isSubmitting);
  const logicApproved = useWorkspaceStore((s) => s.logicApproved);

  const locked = !logicApproved && phase !== "solved";

  // Initialize starter code when language changes (only if code is empty)
  useEffect(() => {
    if (!code && problem.starterCode) {
      setCode(problem.starterCode[language] ?? "");
    }
  }, [language, problem, code, setCode]);

  const monacoLang =
    language === "python" ? "python" : language === "java" ? "java" : "javascript";

  return (
    <div className="relative flex flex-col h-full bg-[#0a0a0a]">
      <div className="px-3 py-2.5 border-b border-[#2a2a2a] flex items-center justify-between gap-2 flex-wrap">
        <LanguageSelector
          value={language}
          onChange={(l) => {
            setLanguage(l);
            setCode(problem.starterCode[l] ?? "");
          }}
          disabled={locked}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={onResetCode}
            disabled={locked}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 rounded-md transition disabled:opacity-40"
            title="Reset to starter code"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full text-neutral-600 text-sm">
              <Loader2 className="animate-spin mr-2" size={16} />
              Loading editor…
            </div>
          }
        >
          <div className={locked ? "opacity-30 pointer-events-none h-full" : "h-full"}>
            <MonacoEditor
              height="100%"
              language={monacoLang}
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v ?? "")}
              options={{
                fontSize: 14,
                fontFamily: "JetBrains Mono, Fira Code, ui-monospace, monospace",
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "off",
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                padding: { top: 12, bottom: 12 },
                renderLineHighlight: "all",
              }}
            />
          </div>
        </Suspense>

        {locked && <LockedOverlay />}
      </div>

      <div className="px-3 py-2.5 border-t border-[#2a2a2a] flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={onHint}
          disabled={locked}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-amber-400 hover:bg-amber-400/10 border border-amber-400/30 rounded-md transition disabled:opacity-40"
        >
          <Lightbulb size={13} />
          Hint
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onRun}
            disabled={locked || isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-[#2a2a2a] rounded-md transition disabled:opacity-50"
          >
            {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={13} />}
            Run Tests
          </button>
          <button
            onClick={onSubmit}
            disabled={locked || isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-600 text-black rounded-md transition"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

function LockedOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div className="text-center max-w-md px-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
          <Lock size={28} className="text-emerald-400" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-100 mb-2">
          Write Your Logic First
        </h3>
        <p className="text-sm text-neutral-400 leading-relaxed">
          The code editor unlocks once your problem-solving approach has been reviewed and approved by the AI tutor. Describe your algorithm in plain English first.
        </p>
      </div>
    </div>
  );
}
