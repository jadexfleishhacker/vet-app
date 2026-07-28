import type { Pet, Vaccination } from "@/lib/types";
import { getReminderStatus } from "@/lib/reminders";
import { formatAge, formatDate, formatRelativeDays } from "@/lib/format";
import { UrgencyBadge } from "./UrgencyBadge";

interface VaccinationScheduleProps {
  pet: Pet;
  vaccinations: Vaccination[];
}

function recurrenceLabel(months: number): string {
  if (months % 12 === 0) {
    const years = months / 12;
    return years === 1 ? "every year" : `every ${years} years`;
  }
  return months === 1 ? "every month" : `every ${months} months`;
}

export function VaccinationSchedule({
  pet,
  vaccinations,
}: VaccinationScheduleProps) {
  const sorted = [...vaccinations].sort((a, b) =>
    a.nextDueDate.localeCompare(b.nextDueDate),
  );
  const statuses = sorted.map((v) => getReminderStatus(v.nextDueDate).urgency);
  const overdue = statuses.filter((u) => u === "overdue").length;
  const dueSoon = statuses.filter((u) => u === "due-soon").length;

  const summary =
    overdue > 0
      ? `${overdue} overdue`
      : dueSoon > 0
        ? `${dueSoon} due soon`
        : "all up to date";
  const age = pet.birthDate ? ` · ${formatAge(pet.birthDate)}` : "";

  return (
    <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
          style={{ backgroundColor: `${pet.color}22` }}
        >
          {pet.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            {pet.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {sorted.length} vaccine{sorted.length === 1 ? "" : "s"} · {summary}
            {age}
          </p>
        </div>
        <span className="text-slate-400 transition-transform group-open:rotate-180 dark:text-slate-500">
          ▾
        </span>
      </summary>
      <ul className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
        {sorted.map((vaccination) => {
          const status = getReminderStatus(vaccination.nextDueDate);
          return (
            <li
              key={vaccination.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {vaccination.name}
                  </p>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {recurrenceLabel(vaccination.recurrenceMonths)}
                  </span>
                </div>
                {vaccination.description && (
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {vaccination.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {vaccination.administeredDate
                    ? `Last given ${formatDate(vaccination.administeredDate)}`
                    : "No prior dose on record"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <UrgencyBadge urgency={status.urgency} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {formatDate(vaccination.nextDueDate)}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {formatRelativeDays(status.daysUntilDue)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
