"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useVetData } from "@/lib/store";
import { getActiveReminders, getReminderStatus } from "@/lib/reminders";
import { lastCheckup } from "@/lib/petInfo";
import { formatAge, formatDate } from "@/lib/format";
import { VaccinationSchedule } from "./VaccinationSchedule";
import { ReminderList } from "./ReminderList";

function InfoStat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold ${tone ?? "text-slate-900 dark:text-slate-100"}`}>
        {value}
      </p>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/"
      className="mb-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
    >
      ‹ All pets
    </Link>
  );
}

export function PetDetail({ petId }: { petId: string }) {
  const { pets, vaccinations, ready } = useVetData();

  const pet = pets.find((p) => p.id === petId);
  const petVaccinations = useMemo(
    () => vaccinations.filter((v) => v.petId === petId),
    [vaccinations, petId],
  );

  if (!ready) return null;

  if (!pet) {
    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-8">
        <BackLink />
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Pet not found. It may not have synced yet — go back and sync your vet emails.
        </div>
      </div>
    );
  }

  const reminders = getActiveReminders(petVaccinations);
  const overdue = reminders.filter((r) => r.status.urgency === "overdue").length;
  const dueSoon = reminders.filter((r) => r.status.urgency === "due-soon").length;
  const checkup = lastCheckup(petVaccinations);
  const nextReminder = reminders[0];
  const petsById = new Map([[pet.id, pet]]);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8">
      <BackLink />

      <header className="mb-6 flex items-center gap-4">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full text-4xl"
          style={{ backgroundColor: `${pet.color}22` }}
        >
          {pet.emoji}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {pet.name}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {pet.birthDate ? `${pet.breed} · ${formatAge(pet.birthDate)}` : pet.breed}
          </p>
        </div>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <InfoStat
          label="Last checkup"
          value={checkup ? formatDate(checkup) : "—"}
        />
        <InfoStat
          label="Next due"
          value={nextReminder ? formatDate(getReminderStatus(nextReminder.vaccination).dueDate) : "—"}
        />
        <InfoStat
          label="Overdue"
          value={String(overdue)}
          tone={overdue > 0 ? "text-red-600 dark:text-red-400" : undefined}
        />
        <InfoStat
          label="Due soon"
          value={String(dueSoon)}
          tone={dueSoon > 0 ? "text-amber-600 dark:text-amber-400" : undefined}
        />
      </section>

      {reminders.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Needs attention
          </h2>
          <ReminderList reminders={reminders} petsById={petsById} />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Full schedule
        </h2>
        <VaccinationSchedule pet={pet} vaccinations={petVaccinations} defaultOpen />
      </section>
    </div>
  );
}
