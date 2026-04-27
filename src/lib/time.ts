/**
 * Parses a time string into total seconds.
 * Accepts: "MM:SS", "M:SS", "M:S", or bare integer seconds.
 * Returns null for unparseable input. Returns 0 for empty string.
 */
export function parseTime(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === '') return 0;

  if (trimmed.includes(':')) {
    const [mStr, sStr] = trimmed.split(':');
    const m = Number(mStr);
    const s = Number(sStr);
    if (!Number.isFinite(m) || !Number.isFinite(s)) return null;
    if (s < 0 || s > 59) return null;
    if (m < 0) return null;
    return m * 60 + s;
  }

  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

/**
 * Formats total seconds as M:SS.
 */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Normalizes mobile time input by auto-inserting a colon. Strips non-digits,
 * caps at 4 digits, and splits the last two as seconds. Lets users on numeric
 * mobile keypads (no `:` key) type `239` and see `2:39`.
 */
export function normalizeTimeInput(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 4);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  return digits.slice(0, -2) + ':' + digits.slice(-2);
}
