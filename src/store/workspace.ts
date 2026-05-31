import { create } from "zustand";
import type {
  Phase,
  Language,
  LogicReview,
  TestResult,
} from "@/types";

const PHASE_ORDER: Record<Phase, number> = {
  understand: 0,
  logic: 1,
  coding: 2,
  solved: 3,
};

interface WorkspaceState {
  phase: Phase;
  /** Highest phase the user has ever reached. Only advances, never regresses. */
  maxPhase: Phase;
  setPhase: (phase: Phase) => void;
  setMaxPhase: (phase: Phase) => void;
  /** Returns true if the target phase is reachable (it's <= maxPhase). */
  canNavigateTo: (target: Phase) => boolean;

  logicText: string;
  setLogicText: (text: string) => void;
  logicReview: LogicReview | null;
  setLogicReview: (review: LogicReview | null) => void;
  logicApproved: boolean;
  setLogicApproved: (approved: boolean) => void;
  isReviewingLogic: boolean;
  setIsReviewingLogic: (v: boolean) => void;

  language: Language;
  setLanguage: (lang: Language) => void;
  code: string;
  setCode: (code: string) => void;
  isRunningCode: boolean;
  setIsRunningCode: (v: boolean) => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
  testResults: TestResult[] | null;
  setTestResults: (results: TestResult[] | null) => void;
  submissionStatus: "idle" | "running" | "passed" | "failed";
  setSubmissionStatus: (s: "idle" | "running" | "passed" | "failed") => void;

  hintsRevealed: number;
  revealNextHint: () => void;
  setHintsRevealed: (n: number) => void;
  isHintOpen: boolean;
  setIsHintOpen: (v: boolean) => void;
  hintsContent: string[];
  appendHint: (h: string) => void;
  setHintsContent: (h: string[]) => void;
  isLoadingHint: boolean;
  setIsLoadingHint: (v: boolean) => void;

  startedAt: number | null;
  setStartedAt: (ts: number | null) => void;

  resetWorkspace: () => void;
}

const initial = {
  phase: "understand" as Phase,
  maxPhase: "understand" as Phase,
  logicText: "",
  logicReview: null as LogicReview | null,
  logicApproved: false,
  isReviewingLogic: false,
  language: "python" as Language,
  code: "",
  isRunningCode: false,
  isSubmitting: false,
  testResults: null as TestResult[] | null,
  submissionStatus: "idle" as "idle" | "running" | "passed" | "failed",
  hintsRevealed: 0,
  isHintOpen: false,
  hintsContent: [] as string[],
  isLoadingHint: false,
  startedAt: null as number | null,
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  ...initial,
  setPhase: (phase) =>
    set((s) => ({
      phase,
      maxPhase:
        PHASE_ORDER[phase] > PHASE_ORDER[s.maxPhase] ? phase : s.maxPhase,
    })),
  setMaxPhase: (phase) =>
    set((s) => ({
      maxPhase:
        PHASE_ORDER[phase] > PHASE_ORDER[s.maxPhase] ? phase : s.maxPhase,
    })),
  canNavigateTo: (target) => PHASE_ORDER[target] <= PHASE_ORDER[get().maxPhase],

  setLogicText: (logicText) => set({ logicText }),
  setLogicReview: (logicReview) => set({ logicReview }),
  setLogicApproved: (logicApproved) =>
    set((s) => ({
      logicApproved,
      // Approving logic permanently unlocks the coding phase.
      maxPhase:
        logicApproved && PHASE_ORDER[s.maxPhase] < PHASE_ORDER.coding
          ? "coding"
          : s.maxPhase,
    })),
  setIsReviewingLogic: (isReviewingLogic) => set({ isReviewingLogic }),
  setLanguage: (language) => set({ language }),
  setCode: (code) => set({ code }),
  setIsRunningCode: (isRunningCode) => set({ isRunningCode }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setTestResults: (testResults) => set({ testResults }),
  setSubmissionStatus: (submissionStatus) => set({ submissionStatus }),
  setHintsRevealed: (hintsRevealed) => set({ hintsRevealed }),
  revealNextHint: () =>
    set((s) => ({ hintsRevealed: Math.min(s.hintsRevealed + 1, 3) })),
  setIsHintOpen: (isHintOpen) => set({ isHintOpen }),
  appendHint: (h) => set((s) => ({ hintsContent: [...s.hintsContent, h] })),
  setHintsContent: (hintsContent) => set({ hintsContent }),
  setIsLoadingHint: (isLoadingHint) => set({ isLoadingHint }),
  setStartedAt: (startedAt) => set({ startedAt }),
  resetWorkspace: () => set({ ...initial }),
}));

export { PHASE_ORDER };
