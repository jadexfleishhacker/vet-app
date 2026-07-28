import type { Pet } from "@/lib/types";
import type { Reminder } from "@/lib/reminders";
import { formatDate, formatMonthName, formatRelativeDays } from "@/lib/format";
import { URGENCY_STYLES } from "./urgencyStyles";
import { UrgencyBadge } from "./UrgencyBadge";

interface ReminderListProps {
  reminders: Reminder[];
  petsById: Map<string, Pet>;
}

export function ReminderList({ reminders, petsById }: ReminderListProps) {
  if (reminders.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-2xl">✅</p>
        <p className="mt-2 font-medium text-slate-700 dark:text-slate-200">
          Nothing due in the next three months
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {reminders.map(({ vaccination, status }) => {
        const pet = petsById.get(vaccination.petId);
        const style = URGENCY_STYLES[status.urgency];
        const isMonthly = status.urgency === "monthly";
        const subtitle = isMonthly
          ? `${pet?.name} · first week of ${formatMonthName(status.dueDate)}`
          : `${pet?.name} · due ${formatDate(status.dueDate)}`;
        const timing = isMonthly
          ? "each month"
          : formatRelativeDays(status.daysUntilDue);
        return (
          <li
            key={vaccination.id}
            className={`flex items-center gap-4 overflow-hidden rounded-2xl border border-slate-200 ${style.tint} dark:border-slate-800`}
          >
            <div className={`h-full w-1.5 self-stretch ${style.bar}`} />
            <div className="flex flex-1 items-center gap-4 py-4 pr-5">
              <span className="text-2xl" aria-hidden>
                {pet?.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {vaccination.name}
                </p>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  {subtitle}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <UrgencyBadge urgency={status.urgency} />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {timing}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
