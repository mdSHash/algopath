import { difficultyClasses } from "@/lib/utils";

export function DifficultyBadge({
  difficulty,
  size = "sm",
}: {
  difficulty: string;
  size?: "sm" | "md";
}) {
  const cls = difficultyClasses(difficulty);
  const sizeCls =
    size === "md"
      ? "px-2.5 py-1 text-xs"
      : "px-2 py-0.5 text-[11px]";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${cls} ${sizeCls}`}
    >
      {difficulty}
    </span>
  );
}
