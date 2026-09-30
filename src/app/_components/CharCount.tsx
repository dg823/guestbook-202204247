import { LIMITS } from "@/lib/validation";

// Counts code points to match the server-side check in validation.ts.
export function countChars(value: string) {
  return [...value].length;
}

export function CharCount({ count }: { count: number }) {
  const max = LIMITS.message.max;
  const color = count >= max ? "text-red-600" : count >= max * 0.9 ? "text-amber-600" : "text-zinc-400";
  return (
    <p aria-live="polite" className={`mt-1 text-right text-xs tabular-nums ${color}`}>
      {count} / {max}
    </p>
  );
}
