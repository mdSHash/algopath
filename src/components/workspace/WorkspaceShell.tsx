"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProblemPanel } from "./ProblemPanel";
import { PhaseIndicator } from "./PhaseIndicator";
import { LogicEditor } from "./LogicEditor";
import { LogicReviewPanel } from "./LogicReviewPanel";
import { CodeEditorPanel } from "./CodeEditorPanel";
import { TestResults } from "./TestResults";
import { SolvedBanner } from "./SolvedBanner";
import { CodeAnalysisCard } from "./CodeAnalysisCard";
import { HintDrawer } from "@/components/ai/HintDrawer";
import { useWorkspaceStore } from "@/store/workspace";
import type { ProblemDTO, ProgressDTO, Phase } from "@/types";

export function WorkspaceShell({
  problem,
  initialProgress,
}: {
  problem: ProblemDTO;
  initialProgress: ProgressDTO | null;
}) {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const store = useWorkspaceStore();
  const initRef = useRef(false);
  const [solvedTestsTotal, setSolvedTestsTotal] = useState(problem.testCases.length);

  // Hydrate from server progress on mount
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    store.resetWorkspace();
    if (initialProgress) {
      store.setPhase(initialProgress.phase);
      store.setLogicText(initialProgress.logicText);
      store.setLogicApproved(initialProgress.logicApproved);
      store.setHintsRevealed(initialProgress.hintsUsed);

      // Restore the highest phase the user has ever reached, so backward
      // navigation in PhaseIndicator includes anything they've already unlocked.
      const highest: Phase = initialProgress.solvedAt
        ? "solved"
        : initialProgress.logicApproved
        ? "coding"
        : initialProgress.phase;
      store.setMaxPhase(highest);
    }
    store.setCode(problem.starterCode[store.language] ?? "");
    store.setStartedAt(Date.now());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNavigatePhase = async (target: Phase) => {
    if (!store.canNavigateTo(target)) return;
    if (target === store.phase) return;
    store.setPhase(target);
    // Clear any stale review panel when going back to logic so the editor
    // shows clean state. The user can re-submit if they want fresh feedback.
    if (target === "logic") store.setLogicReview(null);
    if (sessionStatus === "authenticated") {
      fetch("/api/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: problem.id, phase: target }),
      }).catch(() => {});
    }
  };

  const requireAuth = () => {
    if (sessionStatus !== "authenticated") {
      toast.error("Please sign in to use the workspace.");
      router.push(`/login?next=/problems/${problem.slug}`);
      return false;
    }
    return true;
  };

  const handleAdvanceToLogic = async () => {
    if (!requireAuth()) return;
    store.setPhase("logic");
    await fetch("/api/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemId: problem.id, phase: "logic" }),
    }).catch(() => {});
  };

  const handleSubmitLogic = async () => {
    if (!requireAuth()) return;
    if (store.logicText.trim().length < 50) {
      toast.error("Please write at least 50 characters describing your approach.");
      return;
    }
    store.setIsReviewingLogic(true);
    store.setLogicReview(null);
    try {
      const res = await fetch("/api/ai/review-logic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          logicText: store.logicText,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Review failed");
        return;
      }
      store.setLogicReview(data.review);
      store.setLogicApproved(!!data.review.approved);
      if (data.review.approved) {
        toast.success("Logic approved!");
      }
    } catch (err) {
      toast.error("Something went wrong reviewing your logic.");
      console.error(err);
    } finally {
      store.setIsReviewingLogic(false);
    }
  };

  const handleUnlockEditor = () => {
    store.setPhase("coding");
    if (!store.code) store.setCode(problem.starterCode[store.language] ?? "");
    fetch("/api/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemId: problem.id, phase: "coding" }),
    }).catch(() => {});
  };

  const handleReviseLogic = () => {
    store.setLogicReview(null);
  };

  const handleResetCode = () => {
    store.setCode(problem.starterCode[store.language] ?? "");
  };

  const handleRunTests = async () => {
    if (!requireAuth()) return;
    store.setIsRunningCode(true);
    store.setSubmissionStatus("running");
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          code: store.code,
          language: store.language,
          sampleOnly: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Run failed");
        store.setSubmissionStatus("idle");
        return;
      }
      store.setTestResults(data.results);
      const allPassed = data.passed === data.total;
      store.setSubmissionStatus(allPassed ? "passed" : "failed");
      if (allPassed) toast.success(`${data.passed}/${data.total} sample tests passed`);
    } catch (err) {
      toast.error("Run failed");
      store.setSubmissionStatus("idle");
      console.error(err);
    } finally {
      store.setIsRunningCode(false);
    }
  };

  const handleSubmit = async () => {
    if (!requireAuth()) return;
    store.setIsSubmitting(true);
    store.setSubmissionStatus("running");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          code: store.code,
          language: store.language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Submit failed");
        store.setSubmissionStatus("idle");
        return;
      }
      store.setTestResults(data.results);
      setSolvedTestsTotal(data.testsTotal);
      if (data.status === "Accepted") {
        store.setPhase("solved");
        store.setSubmissionStatus("passed");
        toast.success("Accepted! Great work.");
      } else {
        store.setSubmissionStatus("failed");
        toast.error(`${data.status}: ${data.testsPassed}/${data.testsTotal} passed`);
      }
    } catch (err) {
      toast.error("Submit failed");
      store.setSubmissionStatus("idle");
      console.error(err);
    } finally {
      store.setIsSubmitting(false);
    }
  };

  const handleRequestHint = async () => {
    if (!requireAuth()) return;
    if (store.hintsRevealed >= 3) return;
    store.setIsLoadingHint(true);
    try {
      const next = store.hintsRevealed + 1;
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          phase: store.phase === "coding" ? "coding" : "logic",
          hintNumber: next,
          userLogic: store.logicText,
          userCode: store.code,
          language: store.language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Hint failed");
        return;
      }
      const hintBlock = `${data.hint}${data.followUpQuestion ? `\n\n💭 ${data.followUpQuestion}` : ""}`;
      store.appendHint(hintBlock);
      store.revealNextHint();
    } catch (err) {
      toast.error("Hint failed");
      console.error(err);
    } finally {
      store.setIsLoadingHint(false);
    }
  };

  const handleOpenHint = () => store.setIsHintOpen(true);

  const elapsedMs = useMemo(
    () => (store.startedAt ? Date.now() - store.startedAt : null),
    // recompute when phase changes to solved
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.phase, store.startedAt]
  );

  return (
    <div className="h-[calc(100vh-56px)] grid grid-cols-1 lg:grid-cols-[40%_60%]">
      <ProblemPanel problem={problem} />

      <div className="flex flex-col h-full overflow-hidden">
        <PhaseIndicator onNavigate={handleNavigatePhase} />

        {store.phase === "understand" && (
          <UnderstandPhase
            onAdvance={handleAdvanceToLogic}
            requireAuth={() => sessionStatus === "authenticated"}
            slug={problem.slug}
          />
        )}

        {store.phase === "logic" && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className={`flex-1 min-h-0 ${store.logicReview ? "max-h-[55%]" : ""}`}>
              <LogicEditor onSubmit={handleSubmitLogic} onHint={handleOpenHint} />
            </div>
            {store.logicReview && (
              <div className="overflow-y-auto border-t border-[#2a2a2a] bg-[#0a0a0a]">
                <LogicReviewPanel
                  review={store.logicReview}
                  onUnlockEditor={handleUnlockEditor}
                  onReviseLogic={handleReviseLogic}
                />
              </div>
            )}
          </div>
        )}

        {(store.phase === "coding" || store.phase === "solved") && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <LogicEditor
              onSubmit={handleSubmitLogic}
              onHint={handleOpenHint}
              collapsed
            />
            {store.phase === "solved" && (
              <div className="overflow-y-auto max-h-[60vh] border-b border-[#2a2a2a]">
                <SolvedBanner
                  problemTitle={problem.title}
                  elapsedMs={elapsedMs}
                  hintsUsed={store.hintsRevealed}
                  testsTotal={solvedTestsTotal}
                />
                <CodeAnalysisCard
                  problemId={problem.id}
                  code={store.code}
                  language={store.language}
                />
              </div>
            )}
            <div className="flex-1 min-h-0">
              <CodeEditorPanel
                problem={problem}
                onRun={handleRunTests}
                onSubmit={handleSubmit}
                onHint={handleOpenHint}
                onResetCode={handleResetCode}
              />
            </div>
            {store.testResults && store.testResults.length > 0 && (
              <TestResults
                results={store.testResults}
                status={store.submissionStatus}
              />
            )}
          </div>
        )}
      </div>

      <HintDrawer onRequestHint={handleRequestHint} />
    </div>
  );
}

function UnderstandPhase({
  onAdvance,
  requireAuth,
  slug,
}: {
  onAdvance: () => void;
  requireAuth: () => boolean;
  slug: string;
}) {
  const router = useRouter();
  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-[#0a0a0a]">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-4">📖</div>
        <h2 className="text-xl font-semibold text-neutral-100 mb-2">
          Read the problem carefully
        </h2>
        <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
          Take your time. Understand the inputs, outputs, edge cases, and constraints. When you have a sense of what the problem is asking, advance to the logic phase to describe your approach.
        </p>
        <button
          onClick={() => {
            if (!requireAuth()) {
              router.push(`/login?next=/problems/${slug}`);
              return;
            }
            onAdvance();
          }}
          className="px-5 py-2.5 text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-black rounded-md transition"
        >
          I Understand the Problem →
        </button>
      </div>
    </div>
  );
}
