import type { Vaccination } from "./types";
import { daysBetween, parseISODate, startOfToday } from "./dates";

/** How a due date reads today, most-to-least pressing. */
export type Urgency = "overdue" | "due-soon" | "upcoming" | "scheduled";

/** A due date within this many days counts as "due soon". */
export const DUE_SOON_DAYS = 30;
/** A due date within this many days counts as "upcoming". */
export const UPCOMING_DAYS = 90;

export interface ReminderStatus {
  urgency: Urgency;
  /** Whole days until the due date; negative when overdue. */
  daysUntilDue: number;
}

export function getReminderStatus(
  nextDueDate: string,
  now: Date = new Date(),
): ReminderStatus {
  const daysUntilDue = daysBetween(startOfToday(now), parseISODate(nextDueDate));

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

  return { urgency, daysUntilDue };
}

export interface Reminder {
  vaccination: Vaccination;
  status: ReminderStatus;
}

/** Vaccinations that need attention (overdue, due soon, or upcoming), most pressing first. */
export function getActiveReminders(
  vaccinations: Vaccination[],
  now: Date = new Date(),
): Reminder[] {
  return vaccinations
    .map((vaccination) => ({
      vaccination,
      status: getReminderStatus(vaccination.nextDueDate, now),
    }))
    .filter((reminder) => reminder.status.urgency !== "scheduled")
    .sort((a, b) => a.status.daysUntilDue - b.status.daysUntilDue);
}
