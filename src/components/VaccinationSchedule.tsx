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

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="flex items-center gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full text-2xl"
          style={{ backgroundColor: `${pet.color}22` }}
        >
          {pet.emoji}
        </span>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {pet.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {pet.birthDate ? `${pet.breed} · ${formatAge(pet.birthDate)}` : pet.breed}
          </p>
        </div>
      </header>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {sorted.map((vaccination) => {
          const status = getReminderStatus(vaccination.nextDueDate);
          return (
            <li
              key={vaccination.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 p-5"
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
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {vaccination.description}
                </p>
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
    </section>
  );
}
