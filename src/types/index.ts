export type Difficulty = "Easy" | "Medium" | "Hard";
export type Phase = "understand" | "logic" | "coding" | "solved";
export type Language = "python" | "javascript" | "java";

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface StarterCode {
  python: string;
  javascript: string;
  java: string;
}

export interface ProblemDTO {
  id: string;
  slug: string;
  number: number;
  title: string;
  difficulty: Difficulty;
  description: string;
  examples: Example[];
  constraints: string[];
  tags: string[];
  hints: string[];
  starterCode: StarterCode;
  testCases: TestCase[];
  acceptanceRate: number;
}

export interface ProblemListItem {
  id: string;
  slug: string;
  number: number;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  acceptanceRate: number;
  status?: "todo" | "in-progress" | "solved";
}

export type LogicVerdict =
  | "Correct"
  | "Partially Correct"
  | "Incorrect"
  | "Too Vague";

export interface LogicReview {
  approved: boolean;
  verdict: LogicVerdict;
  feedback: string;
  questions: string[];
  encouragement: string;
}

export interface HintResponse {
  hint: string;
  followUpQuestion: string;
  hasMoreHints: boolean;
}

export interface CodeReview {
  issue: string;
  debugQuestion: string;
  suggestion: string;
}

export type ComplexityVerdict =
  | "Optimal"
  | "Good"
  | "Acceptable"
  | "Suboptimal";

export interface CodeAnalysis {
  yourComplexity: {
    time: string;
    space: string;
  };
  optimalComplexity: {
    time: string;
    space: string;
  };
  isOptimal: boolean;
  verdict: ComplexityVerdict;
  /** Why your complexity is what it is (1-2 short sentences). */
  reasoning: string;
  /** Things the solution does well (1-3 items). */
  strengths: string[];
  /** Concrete improvements the user could make (0-3 items, empty if optimal). */
  suggestions: string[];
  /** Memory-specific notes — auxiliary structures, in-place hints, etc. */
  memoryNotes: string;
}

export interface TestResult {
  testCase: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  runtime?: string;
  error?: string;
}

export interface SubmissionResult {
  status:
    | "Accepted"
    | "Wrong Answer"
    | "Time Limit Exceeded"
    | "Runtime Error";
  testsPassed: number;
  testsTotal: number;
  results: TestResult[];
  runtime?: string;
  memory?: string;
}

export interface ProgressDTO {
  problemId: string;
  phase: Phase;
  logicApproved: boolean;
  logicText: string;
  /** Auto-saved code drafts keyed by language. Survives refresh + signin. */
  codeDrafts: Partial<Record<Language, string>>;
  hintsUsed: number;
  solvedAt: string | null;
}
