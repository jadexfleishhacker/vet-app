import { parseISODate, startOfToday } from "./dates";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/** e.g. "Aug 15, 2026". */
export function formatDate(iso: string): string {
  return dateFormatter.format(parseISODate(iso));
}

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long" });

/** e.g. "August". */
export function formatMonthName(iso: string): string {
  return monthFormatter.format(parseISODate(iso));
}

/** e.g. "just now", "12 min ago", "3 hr ago", "2 days ago". */
export function formatAgo(ms: number, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - ms) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** e.g. "in 12 days", "today", "18 days ago". */
export function formatRelativeDays(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  if (days > 0) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
}

/** Human-friendly age from a birth date, e.g. "3 yr 4 mo" or "7 mo". */
export function formatAge(birthISO: string, now: Date = new Date()): string {
  const birth = parseISODate(birthISO);
  const today = startOfToday(now);

  let months =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());
  if (today.getDate() < birth.getDate()) {
    months -= 1;
  }
  months = Math.max(months, 0);

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) return `${remainingMonths} mo`;
  if (remainingMonths === 0) return `${years} yr`;
  return `${years} yr ${remainingMonths} mo`;
}
