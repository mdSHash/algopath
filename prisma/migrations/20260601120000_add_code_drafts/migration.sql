-- Adds an auto-saved code-drafts column to Progress so a user's in-progress
-- solution survives page refreshes and re-logins. Stored as a JSON string
-- keyed by language: {"python":"...", "javascript":"...", "java":"..."}.
ALTER TABLE "Progress" ADD COLUMN "codeDrafts" TEXT NOT NULL DEFAULT '{}';
