export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function difficultyClasses(d: string) {
  if (d === "Easy") return "text-[#00b8a3] bg-[#00b8a3]/10 border-[#00b8a3]/30";
  if (d === "Medium") return "text-[#ffa116] bg-[#ffa116]/10 border-[#ffa116]/30";
  if (d === "Hard") return "text-[#ff375f] bg-[#ff375f]/10 border-[#ff375f]/30";
  return "text-neutral-400 bg-neutral-700/30 border-neutral-600/30";
}

export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function safeJsonParse<T>(s: string, fallback: T): T {
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}
