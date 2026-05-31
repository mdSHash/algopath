"use client";
import { DifficultyBadge } from "@/components/problems/DifficultyBadge";
import type { ProblemDTO } from "@/types";

export function ProblemPanel({ problem }: { problem: ProblemDTO }) {
  return (
    <div className="h-full overflow-y-auto bg-[#0e0e0e] border-r border-[#2a2a2a]">
      <div className="sticky top-0 z-10 bg-[#0e0e0e]/95 backdrop-blur-sm border-b border-[#2a2a2a] px-6 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-neutral-500 font-mono text-sm">#{problem.number}</span>
          <h1 className="text-xl font-semibold text-neutral-100">{problem.title}</h1>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {problem.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-[#2a2a2a]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 py-5 space-y-6">
        <section>
          <div className="prose-invert text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {renderMarkdown(problem.description)}
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-wider text-neutral-500 mb-3 font-semibold">
            Examples
          </h2>
          <div className="space-y-3">
            {problem.examples.map((ex, i) => (
              <div
                key={i}
                className="bg-[#111] border border-[#2a2a2a] rounded-md p-3.5 text-sm font-mono"
              >
                <div className="text-neutral-500 text-[11px] uppercase tracking-wider mb-2">
                  Example {i + 1}
                </div>
                <div className="space-y-1.5">
                  <div>
                    <span className="text-neutral-500">Input: </span>
                    <span className="text-neutral-200">{ex.input}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Output: </span>
                    <span className="text-emerald-400">{ex.output}</span>
                  </div>
                  {ex.explanation && (
                    <div className="text-neutral-400 mt-2 pt-2 border-t border-[#1f1f1f] font-sans">
                      {ex.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-wider text-neutral-500 mb-3 font-semibold">
            Constraints
          </h2>
          <ul className="space-y-1 text-sm font-mono">
            {problem.constraints.map((c, i) => (
              <li key={i} className="text-neutral-400">
                <span className="text-neutral-600 mr-2">•</span>
                {c}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

// Light markdown rendering: bold + inline code
function renderMarkdown(md: string): React.ReactNode {
  const parts = md.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("```")) {
      const code = part.replace(/^```\w*\n?/, "").replace(/```$/, "");
      return (
        <pre
          key={i}
          className="bg-[#111] border border-[#2a2a2a] rounded p-3 my-2 text-xs font-mono text-neutral-200 overflow-x-auto"
        >
          {code}
        </pre>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-neutral-900 text-emerald-300 text-[13px] font-mono"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-neutral-100">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} className="text-neutral-200">{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}
