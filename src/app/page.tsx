import { pets, vaccinations, getVaccinationsForPet } from "@/lib/data";
import { getActiveReminders } from "@/lib/reminders";
import { PetCard } from "@/components/PetCard";
import { ReminderList } from "@/components/ReminderList";
import { VaccinationSchedule } from "@/components/VaccinationSchedule";

export default function Home() {
  const petsById = new Map(pets.map((pet) => [pet.id, pet]));
  const reminders = getActiveReminders(vaccinations);
  const overdueCount = reminders.filter(
    (r) => r.status.urgency === "overdue",
  ).length;
  const dueSoonCount = reminders.filter(
    (r) => r.status.urgency === "due-soon",
  ).length;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
      <header className="mb-10">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Vet reminders
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Keep your pets up to date
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          {overdueCount > 0 || dueSoonCount > 0
            ? `${overdueCount} overdue and ${dueSoonCount} due soon across ${pets.length} pets.`
            : "Everything is on track."}
        </p>
      </header>

      <section className="mb-10 grid gap-4 sm:grid-cols-2">
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
          Needs attention
        </h2>
        <ReminderList reminders={reminders} petsById={petsById} />
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Full schedule
        </h2>
        {pets.map((pet) => (
          <VaccinationSchedule
            key={pet.id}
            pet={pet}
            vaccinations={getVaccinationsForPet(pet.id)}
          />
        ))}
      </section>
    </div>
  );
}
