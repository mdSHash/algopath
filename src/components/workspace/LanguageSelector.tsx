"use client";
import type { Language } from "@/types";

const LANGS: { value: Language; label: string; icon: string }[] = [
  { value: "python", label: "Python", icon: "🐍" },
  { value: "javascript", label: "JavaScript", icon: "⚡" },
  { value: "java", label: "Java", icon: "☕" },
];

export function LanguageSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: Language;
  onChange: (lang: Language) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 bg-[#0e0e0e] border border-[#2a2a2a] rounded-md p-1">
      {LANGS.map((lang) => (
        <button
          key={lang.value}
          onClick={() => onChange(lang.value)}
          disabled={disabled}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded transition ${
            value === lang.value
              ? "bg-emerald-500/15 text-emerald-300"
              : "text-neutral-400 hover:text-neutral-100"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span>{lang.icon}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
}
