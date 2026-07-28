import type { Pet, Vaccination, VaccinationKind } from "./types";
import { addDays, addMonths, startOfToday, toISODate } from "./dates";

export const pets: Pet[] = [
  {
    id: "buddy",
    name: "Buddy",
    species: "dog",
    breed: "Golden Retriever",
    birthDate: "2021-03-14",
    color: "#d97706",
    emoji: "🐕",
  },
  {
    id: "milo",
    name: "Milo",
    species: "cat",
    breed: "Domestic Shorthair",
    birthDate: "2023-06-02",
    color: "#7c3aed",
    emoji: "🐈",
  },
];

/**
 * Seed vaccination, expressed relative to today so the demo always shows a
 * realistic spread. `dueInDays` drives the next due date; `administeredDate`
 * is back-computed one recurrence interval earlier.
 */
interface SeedVaccination {
  petId: string;
  name: string;
  description: string;
  recurrenceMonths: number;
  dueInDays: number;
  /** When false, the first dose has not been given yet. */
  hasPriorDose: boolean;
  kind?: VaccinationKind;
}

const SEED: SeedVaccination[] = [
  // Buddy (dog)
  {
    petId: "buddy",
    name: "Rabies",
    description: "Legally required; protects against the rabies virus.",
    recurrenceMonths: 36,
    dueInDays: 220,
    hasPriorDose: true,
  },
  {
    petId: "buddy",
    name: "DHPP",
    description: "Distemper, hepatitis, parvovirus, parainfluenza.",
    recurrenceMonths: 12,
    dueInDays: -6,
    hasPriorDose: true,
  },
  {
    petId: "buddy",
    name: "Bordetella",
    description: "Kennel cough; often required for boarding and grooming.",
    recurrenceMonths: 6,
    dueInDays: 18,
    hasPriorDose: true,
  },
  {
    petId: "buddy",
    name: "Leptospirosis",
    description: "Bacterial infection spread through water and wildlife.",
    recurrenceMonths: 12,
    dueInDays: 61,
    hasPriorDose: true,
  },
  {
    petId: "buddy",
    name: "Annual wellness exam",
    description: "Routine checkup and preventive screening.",
    recurrenceMonths: 12,
    dueInDays: 12,
    hasPriorDose: true,
  },
  {
    petId: "buddy",
    name: "Flea & tick preventative",
    description: "Self-administered monthly preventative.",
    recurrenceMonths: 1,
    dueInDays: 0,
    hasPriorDose: false,
    kind: "monthly",
  },
  // Milo (cat)
  {
    petId: "milo",
    name: "Rabies",
    description: "Legally required; protects against the rabies virus.",
    recurrenceMonths: 12,
    dueInDays: 40,
    hasPriorDose: true,
  },
  {
    petId: "milo",
    name: "FVRCP",
    description: "Feline viral rhinotracheitis, calicivirus, panleukopenia.",
    recurrenceMonths: 12,
    dueInDays: -20,
    hasPriorDose: true,
  },
  {
    petId: "milo",
    name: "FeLV",
    description: "Feline leukemia virus.",
    recurrenceMonths: 12,
    dueInDays: 75,
    hasPriorDose: true,
  },
  {
    petId: "milo",
    name: "Annual wellness exam",
    description: "Routine checkup and preventive screening.",
    recurrenceMonths: 12,
    dueInDays: 205,
    hasPriorDose: true,
  },
];

function buildVaccinations(now: Date = new Date()): Vaccination[] {
  const today = startOfToday(now);
  return SEED.map((seed) => {
    const nextDue = addDays(today, seed.dueInDays);
    const administered = seed.hasPriorDose
      ? addMonths(nextDue, -seed.recurrenceMonths)
      : null;
    return {
      id: `${seed.petId}-${seed.name.toLowerCase().replace(/\s+/g, "-")}`,
      petId: seed.petId,
      kind: seed.kind ?? "vaccine",
      name: seed.name,
      description: seed.description,
      administeredDate: administered ? toISODate(administered) : null,
      nextDueDate: toISODate(nextDue),
      recurrenceMonths: seed.recurrenceMonths,
      source: "seed" as const,
    };
  });
}

export const vaccinations: Vaccination[] = buildVaccinations();

export function getPet(petId: string): Pet | undefined {
  return pets.find((pet) => pet.id === petId);
}

export function getVaccinationsForPet(petId: string): Vaccination[] {
  return vaccinations.filter((vaccination) => vaccination.petId === petId);
}
