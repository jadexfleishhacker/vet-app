import type { Vaccination } from "./types";
import { daysBetween, parseISODate, startOfToday, toISODate } from "./dates";

/** How a due date reads today, most-to-least pressing. */
export type Urgency = "overdue" | "due-soon" | "upcoming" | "scheduled" | "monthly";

/** A due date within this many days counts as "due soon". */
export const DUE_SOON_DAYS = 30;
/** A due date within this many days counts as "upcoming". */
export const UPCOMING_DAYS = 90;
/** A monthly preventative's reminder window is the first N days of each month. */
export const MONTHLY_WINDOW_DAYS = 7;

export interface ReminderStatus {
  urgency: Urgency;
  /** Whole days until the due date; negative when overdue, 0 during a monthly window. */
  daysUntilDue: number;
  /** ISO date to display for this reminder. */
  dueDate: string;
}

/**
 * Monthly preventatives are reminders, not deadlines. During the first week of
 * the month the reminder is active (due now); afterward it points at next month.
 */
function getMonthlyStatus(now: Date): ReminderStatus {
  const today = startOfToday(now);
  if (today.getDate() <= MONTHLY_WINDOW_DAYS) {
    const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return { urgency: "monthly", daysUntilDue: 0, dueDate: toISODate(firstOfThisMonth) };
  }
  const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return {
    urgency: "monthly",
    daysUntilDue: daysBetween(today, firstOfNextMonth),
    dueDate: toISODate(firstOfNextMonth),
  };
}

export function getReminderStatus(
  vaccination: Vaccination,
  now: Date = new Date(),
): ReminderStatus {
  if (vaccination.kind === "monthly") {
    return getMonthlyStatus(now);
  }

  const daysUntilDue = daysBetween(
    startOfToday(now),
    parseISODate(vaccination.nextDueDate),
  );

  let urgency: Urgency;
  if (daysUntilDue < 0) {
    urgency = "overdue";
  } else if (daysUntilDue <= DUE_SOON_DAYS) {
    urgency = "due-soon";
  } else if (daysUntilDue <= UPCOMING_DAYS) {
    urgency = "upcoming";
  } else {
    urgency = "scheduled";
  }

  return { urgency, daysUntilDue, dueDate: vaccination.nextDueDate };
}

export interface Reminder {
  vaccination: Vaccination;
  status: ReminderStatus;
}

/** Vaccinations that need attention (overdue, due soon, upcoming, or monthly), most pressing first. */
export function getActiveReminders(
  vaccinations: Vaccination[],
  now: Date = new Date(),
): Reminder[] {
  return vaccinations
    .map((vaccination) => ({
      vaccination,
      status: getReminderStatus(vaccination, now),
    }))
    .filter((reminder) => reminder.status.urgency !== "scheduled")
    .sort((a, b) => a.status.daysUntilDue - b.status.daysUntilDue);
}
