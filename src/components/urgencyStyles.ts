import type { Urgency } from "@/lib/reminders";

interface UrgencyStyle {
  label: string;
  /** Badge background + text. */
  badge: string;
  /** Left accent bar on reminder rows. */
  bar: string;
  /** Subtle row background tint. */
  tint: string;
}

export const URGENCY_STYLES: Record<Urgency, UrgencyStyle> = {
  overdue: {
    label: "Overdue",
    badge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    bar: "bg-red-500",
    tint: "bg-red-50 dark:bg-red-950/30",
  },
  "due-soon": {
    label: "Due soon",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    bar: "bg-amber-500",
    tint: "bg-amber-50 dark:bg-amber-950/30",
  },
  upcoming: {
    label: "Upcoming",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    bar: "bg-sky-500",
    tint: "bg-sky-50 dark:bg-sky-950/30",
  },
  scheduled: {
    label: "Scheduled",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    bar: "bg-slate-400",
    tint: "bg-slate-50 dark:bg-slate-900/40",
  },
  monthly: {
    label: "Monthly",
    badge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
    bar: "bg-indigo-500",
    tint: "bg-indigo-50 dark:bg-indigo-950/30",
  },
};
