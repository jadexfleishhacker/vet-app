import Link from "next/link";
import type { Pet, Vaccination } from "@/lib/types";
import { getActiveReminders } from "@/lib/reminders";
import { formatAge } from "@/lib/format";

interface PetSummaryCardProps {
  pet: Pet;
  vaccinations: Vaccination[];
}

export function PetSummaryCard({ pet, vaccinations }: PetSummaryCardProps) {
  const reminders = getActiveReminders(vaccinations);
  const overdue = reminders.filter((r) => r.status.urgency === "overdue").length;
  const dueSoon = reminders.filter((r) => r.status.urgency === "due-soon").length;
  const subtitle = pet.birthDate
    ? `${pet.breed} · ${formatAge(pet.birthDate)}`
    : pet.breed;

  return (
    <Link
      href={`/pet/${pet.id}`}
      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
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
          {subtitle}
        </p>
        <p className="mt-1 text-sm">
          {overdue > 0 && (
            <span className="font-semibold text-red-600 dark:text-red-400">
              {overdue} overdue
            </span>
          )}
          {overdue > 0 && dueSoon > 0 && (
            <span className="text-slate-400"> · </span>
          )}
          {dueSoon > 0 && (
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {dueSoon} due soon
            </span>
          )}
          {overdue === 0 && dueSoon === 0 && (
            <span className="font-medium text-emerald-600 dark:text-emerald-400">
              All up to date
            </span>
          )}
        </p>
      </div>
      <span className="text-slate-300 dark:text-slate-600" aria-hidden>
        ›
      </span>
    </Link>
  );
}
