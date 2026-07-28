import type { Pet, Vaccination } from "@/lib/types";
import { getActiveReminders } from "@/lib/reminders";
import { PetCard } from "./PetCard";
import { ReminderList } from "./ReminderList";
import { VaccinationSchedule } from "./VaccinationSchedule";

interface DashboardProps {
  pets: Pet[];
  vaccinations: Vaccination[];
}

export function Dashboard({ pets, vaccinations }: DashboardProps) {
  const petsById = new Map(pets.map((pet) => [pet.id, pet]));
  const vaccinationsByPet = new Map<string, Vaccination[]>();
  for (const vaccination of vaccinations) {
    const list = vaccinationsByPet.get(vaccination.petId) ?? [];
    list.push(vaccination);
    vaccinationsByPet.set(vaccination.petId, list);
  }

  const reminders = getActiveReminders(vaccinations);

  if (pets.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-2xl">📭</p>
        <p className="mt-2 font-medium text-slate-700 dark:text-slate-200">
          No pets or vaccinations found yet
        </p>
      </div>
    );
  }

  return (
    <>
      <section className="mb-8 grid gap-3 sm:grid-cols-2">
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            vaccinations={vaccinationsByPet.get(pet.id) ?? []}
          />
        ))}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
          Needs attention
        </h2>
        <ReminderList reminders={reminders} petsById={petsById} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Full schedule
        </h2>
        {pets.map((pet) => (
          <VaccinationSchedule
            key={pet.id}
            pet={pet}
            vaccinations={vaccinationsByPet.get(pet.id) ?? []}
          />
        ))}
      </section>
    </>
  );
}
