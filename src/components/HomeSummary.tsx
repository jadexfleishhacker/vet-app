"use client";

import { useMemo } from "react";
import { useVetData } from "@/lib/store";
import { getActiveReminders } from "@/lib/reminders";
import { PetSummaryCard } from "./PetSummaryCard";
import { ReminderList } from "./ReminderList";
import { Calendar } from "./Calendar";

const MAX_SUMMARY_REMINDERS = 5;

export function HomeSummary() {
  const { pets, vaccinations, ready, hasData } = useVetData();

  const petsById = useMemo(
    () => new Map(pets.map((pet) => [pet.id, pet])),
    [pets],
  );
  const vaccinationsByPet = useMemo(() => {
    const map = new Map<string, typeof vaccinations>();
    for (const vaccination of vaccinations) {
      const list = map.get(vaccination.petId) ?? [];
      list.push(vaccination);
      map.set(vaccination.petId, list);
    }
    return map;
  }, [vaccinations]);

  const reminders = useMemo(() => getActiveReminders(vaccinations), [vaccinations]);

  if (!ready) return null;

  if (!hasData || pets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Sync your vet emails or import a screenshot to see your pets&apos;
        vaccinations and procedures with what&apos;s due.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-3 sm:grid-cols-2">
        {pets.map((pet) => (
          <PetSummaryCard
            key={pet.id}
            pet={pet}
            vaccinations={vaccinationsByPet.get(pet.id) ?? []}
          />
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
          Needs attention
        </h2>
        <ReminderList
          reminders={reminders.slice(0, MAX_SUMMARY_REMINDERS)}
          petsById={petsById}
        />
        {reminders.length > MAX_SUMMARY_REMINDERS && (
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
            +{reminders.length - MAX_SUMMARY_REMINDERS} more — open a pet to see everything.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
          Calendar
        </h2>
        <Calendar pets={pets} vaccinations={vaccinations} />
      </section>
    </div>
  );
}
