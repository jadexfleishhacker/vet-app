import type { Pet } from "@/lib/types";
import { getActiveReminders } from "@/lib/reminders";
import { getVaccinationsForPet } from "@/lib/data";
import { formatAge } from "@/lib/format";

export function PetCard({ pet }: { pet: Pet }) {
  const reminders = getActiveReminders(getVaccinationsForPet(pet.id));
  const overdue = reminders.filter((r) => r.status.urgency === "overdue").length;
  const dueSoon = reminders.filter((r) => r.status.urgency === "due-soon").length;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-3xl"
        style={{ backgroundColor: `${pet.color}22` }}
      >
        {pet.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
          {pet.name}
        </p>
        <p className="truncate text-sm text-slate-500 dark:text-slate-400">
          {pet.breed} · {formatAge(pet.birthDate)}
        </p>
      </div>
      <div className="text-right text-sm">
        {overdue > 0 && (
          <p className="font-semibold text-red-600 dark:text-red-400">
            {overdue} overdue
          </p>
        )}
        {dueSoon > 0 && (
          <p className="font-semibold text-amber-600 dark:text-amber-400">
            {dueSoon} due soon
          </p>
        )}
        {overdue === 0 && dueSoon === 0 && (
          <p className="font-medium text-emerald-600 dark:text-emerald-400">
            All up to date
          </p>
        )}
      </div>
    </div>
  );
}
