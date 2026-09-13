/**
 * Timezone and Date Utilities for Indian Standard Time (IST - UTC+5:30)
 * All database records store UTC timestamps. Use these helpers to format and calculate
 * day boundaries consistently in IST.
 */

/**
 * Format timestamp to full human-readable IST string: "13 Sep 2026, 03:30 PM IST"
 */
export function formatDateTimeIST(
  date: Date | string | number | null | undefined,
  includeTimezone = true
): string {
  if (!date) return "—";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  const formatted = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);

  return includeTimezone ? `${formatted} IST` : formatted;
}

/**
 * Format timestamp to concise date IST string: "13 Sep 2026"
 */
export function formatDateIST(date: Date | string | number | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Returns a UTC Date object representing 00:00:00.000 IST on the current Indian date.
 * Crucial for dashboard statistics ("Today's Bookings") to prevent UTC day boundary drift.
 */
export function getStartOfTodayIST(): Date {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;

  // 00:00:00 IST = 18:30:00 UTC previous calendar day
  return new Date(`${year}-${month}-${day}T00:00:00+05:30`);
}
