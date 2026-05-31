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
  hintsUsed: number;
  solvedAt: string | null;
}
