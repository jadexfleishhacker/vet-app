import type { Pet, Species, Vaccination } from "./types";
import type { ParsedRecord } from "./parseVetEmail";

const SPECIES_STYLE: Record<Species | "other", { emoji: string; color: string }> = {
  dog: { emoji: "🐕", color: "#d97706" },
  cat: { emoji: "🐈", color: "#7c3aed" },
  other: { emoji: "🐾", color: "#0891b2" },
};

/** Default recurrence when an email doesn't state one. Most core vaccines are annual. */
const DEFAULT_RECURRENCE_MONTHS = 12;

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export interface AggregateResult {
  pets: Pet[];
  vaccinations: Vaccination[];
  /** Records dropped because they had no next-due date (nothing to remind on). */
  skipped: number;
}

/** Turn parsed email records into the pets + vaccinations the dashboard renders. */
export function aggregateRecords(records: ParsedRecord[]): AggregateResult {
  const pets = new Map<string, Pet>();
  const vaccinations: Vaccination[] = [];
  let skipped = 0;

  for (const record of records) {
    if (!record.nextDueDate) {
      skipped += 1;
      continue;
    }

    const name = record.petName?.trim() || "Unknown pet";
    const species: Species = record.species === "other" ? "dog" : record.species;
    const petId = slug(`${name}-${record.species}`) || "unknown-pet";

    if (!pets.has(petId)) {
      const style = SPECIES_STYLE[record.species];
      pets.set(petId, {
        id: petId,
        name,
        species,
        breed: record.species === "other" ? "Pet" : `${species[0].toUpperCase()}${species.slice(1)}`,
        birthDate: null,
        color: style.color,
        emoji: style.emoji,
      });
    }

    vaccinations.push({
      id: `${petId}-${slug(record.vaccineName)}-${record.nextDueDate}`,
      petId,
      name: record.vaccineName,
      description: record.description ?? "",
      administeredDate: record.administeredDate,
      nextDueDate: record.nextDueDate,
      recurrenceMonths: record.recurrenceMonths ?? DEFAULT_RECURRENCE_MONTHS,
      source: "email",
    });
  }

  return { pets: [...pets.values()], vaccinations, skipped };
}
