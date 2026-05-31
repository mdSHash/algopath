"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Circle, Clock, Search } from "lucide-react";
import { DifficultyBadge } from "./DifficultyBadge";
import type { ProblemListItem } from "@/types";

type StatusFilter = "all" | "todo" | "in-progress" | "solved";
type DiffFilter = "all" | "Easy" | "Medium" | "Hard";

export function ProblemTable({
  problems,
  isAuthed,
}: {
  problems: ProblemListItem[];
  isAuthed: boolean;
}) {
  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState<DiffFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [problems]);

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (diff !== "all" && p.difficulty !== diff) return false;
      if (status !== "all") {
        const s = p.status ?? "todo";
        if (s !== status) return false;
      }
      if (activeTag && !p.tags.includes(activeTag)) return false;
      return true;
    });
  }, [problems, search, diff, status, activeTag]);

  const stats = useMemo(() => {
    const solved = problems.filter((p) => p.status === "solved");
    const easy = solved.filter((p) => p.difficulty === "Easy").length;
    const medium = solved.filter((p) => p.difficulty === "Medium").length;
    const hard = solved.filter((p) => p.difficulty === "Hard").length;
    const totalEasy = problems.filter((p) => p.difficulty === "Easy").length;
    const totalMed = problems.filter((p) => p.difficulty === "Medium").length;
    const totalHard = problems.filter((p) => p.difficulty === "Hard").length;
    return { solved: solved.length, easy, medium, hard, totalEasy, totalMed, totalHard };
  }, [problems]);

  return (
    <div>
      {isAuthed && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Solved" value={`${stats.solved} / ${problems.length}`} accent="text-emerald-400" />
          <StatCard label="Easy" value={`${stats.easy} / ${stats.totalEasy}`} accent="text-[#00b8a3]" />
          <StatCard label="Medium" value={`${stats.medium} / ${stats.totalMed}`} accent="text-[#ffa116]" />
          <StatCard label="Hard" value={`${stats.hard} / ${stats.totalHard}`} accent="text-[#ff375f]" />
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems by title…"
            className="w-full bg-[#111] border border-[#2a2a2a] rounded-md pl-9 pr-3 py-2 text-sm placeholder:text-neutral-500 focus:border-emerald-500 outline-none transition"
          />
        </div>

        <div className="flex gap-1 bg-[#111] border border-[#2a2a2a] rounded-md p-1">
          {(["all", "Easy", "Medium", "Hard"] as DiffFilter[]).map((d) => (
            <button
              key={d}
              onClick={() => setDiff(d)}
              className={`px-3 py-1.5 text-xs rounded transition ${
                diff === d
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-neutral-400 hover:text-neutral-100"
              }`}
            >
              {d === "all" ? "All" : d}
            </button>
          ))}
        </div>

        {isAuthed && (
          <div className="flex gap-1 bg-[#111] border border-[#2a2a2a] rounded-md p-1">
            {(["all", "todo", "in-progress", "solved"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 text-xs rounded transition capitalize ${
                  status === s
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "text-neutral-400 hover:text-neutral-100"
                }`}
              >
                {s.replace("-", " ")}
              </button>
            ))}
          </div>
        )}
      </div>

      {allTags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-5">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-2.5 py-1 text-xs rounded-full border transition ${
              activeTag === null
                ? "border-emerald-400/40 text-emerald-300 bg-emerald-500/10"
                : "border-[#2a2a2a] text-neutral-400 hover:text-neutral-100"
            }`}
          >
            All tags
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className={`px-2.5 py-1 text-xs rounded-full border transition ${
                activeTag === tag
                  ? "border-emerald-400/40 text-emerald-300 bg-emerald-500/10"
                  : "border-[#2a2a2a] text-neutral-400 hover:text-neutral-100"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-[#2a2a2a] bg-[#111] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-neutral-500 bg-[#0e0e0e]">
            <tr>
              <th className="text-left px-4 py-3 w-10">Status</th>
              <th className="text-left px-2 py-3 w-12">#</th>
              <th className="text-left px-2 py-3">Title</th>
              <th className="text-left px-2 py-3 hidden md:table-cell">Tags</th>
              <th className="text-left px-2 py-3 w-24">Difficulty</th>
              <th className="text-right px-4 py-3 w-28 hidden sm:table-cell">Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-neutral-500">
                  No problems match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((p, idx) => (
                <motion.tr
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.25,
                    delay: Math.min(idx * 0.018, 0.4),
                    ease: "easeOut",
                  }}
                  whileHover={{ backgroundColor: "rgba(22, 22, 22, 1)" }}
                  className="border-t border-[#1f1f1f] group"
                >
                  <td className="px-4 py-3">
                    {p.status === "solved" ? (
                      <Check size={16} className="text-emerald-400" />
                    ) : p.status === "in-progress" ? (
                      <Clock size={16} className="text-amber-400" />
                    ) : (
                      <Circle size={14} className="text-neutral-700" />
                    )}
                  </td>
                  <td className="px-2 py-3 text-neutral-500 font-mono">{p.number}</td>
                  <td className="px-2 py-3">
                    <Link
                      href={`/problems/${p.slug}`}
                      className="text-neutral-100 group-hover:text-emerald-400 transition"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-2 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-[#2a2a2a]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <DifficultyBadge difficulty={p.difficulty} />
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-400 hidden sm:table-cell font-mono text-xs">
                    {p.acceptanceRate.toFixed(1)}%
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-3">
      <div className="text-[11px] uppercase tracking-wider text-neutral-500">{label}</div>
      <div className={`text-xl font-semibold mt-0.5 ${accent}`}>{value}</div>
    </div>
  );
}
