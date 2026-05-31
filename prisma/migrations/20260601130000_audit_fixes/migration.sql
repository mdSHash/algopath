-- Audit-driven schema additions.
--
-- 1. Submission.analysisJson — caches the AI complexity analysis so repeated
--    "Analyze My Solution" clicks don't re-bill Gemini.
-- 2. Problem.submissionCount / acceptedCount — live counters for a real
--    acceptance rate computed at read time, replacing the static seed value.

ALTER TABLE "Submission" ADD COLUMN "analysisJson" TEXT;

ALTER TABLE "Problem" ADD COLUMN "submissionCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Problem" ADD COLUMN "acceptedCount" INTEGER NOT NULL DEFAULT 0;

-- Recent-submission lookups (used by the AI analysis endpoint and the
-- profile page) benefit from a composite index.
CREATE INDEX "Submission_userId_problemId_createdAt_idx"
  ON "Submission" ("userId", "problemId", "createdAt");

-- Hint sequencing (H-2): bitmask of revealed hint levels, so hintsUsed
-- only counts the first reveal of each level. Bit 0 = hint 1, bit 1 = 2, etc.
ALTER TABLE "Progress" ADD COLUMN "hintsRevealedMask" INTEGER NOT NULL DEFAULT 0;
