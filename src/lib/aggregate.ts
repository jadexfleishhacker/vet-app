import type { Pet, Species, Vaccination } from "./types";
import type { ParsedRecord } from "./parseVetEmail";
import { isMonthlyPreventative } from "./preventatives";

const SPECIES_STYLE: Record<"dog" | "cat" | "other", { emoji: string; color: string }> = {
  dog: { emoji: "🐕", color: "#d97706" },
  cat: { emoji: "🐈", color: "#7c3aed" },
  other: { emoji: "🐾", color: "#0891b2" },
};

/** Default recurrence when an email doesn't state one. Most core vaccines are annual. */
const DEFAULT_RECURRENCE_MONTHS = 12;

/** A parsed record paired with when its source email arrived (ms since epoch). */
export interface DatedRecord {
  record: ParsedRecord;
  receivedAt: number;
}

/** Case/accent/spacing-insensitive key so "Leò", "Leo", and "leo " merge. */
function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slug(value: string): string {
  return normalizeKey(value).replace(/\s+/g, "-") || "unknown";
}

export interface AggregateResult {
  pets: Pet[];
  vaccinations: Vaccination[];
  /** Records dropped because they had no next-due date (nothing to remind on). */
  skipped: number;
}

interface PetGroup {
  displayName: string;
  /** Most recent email that mentioned this pet, used to pick the display name. */
  nameSeenAt: number;
  speciesVotes: Record<"dog" | "cat" | "other", number>;
  /** Latest record per vaccine key. */
  byVaccine: Map<string, { record: ParsedRecord; receivedAt: number }>;
}

function resolveSpecies(votes: PetGroup["speciesVotes"]): "dog" | "cat" | "other" {
  if (votes.dog >= votes.cat && votes.dog >= votes.other) return "dog";
  if (votes.cat >= votes.other) return "cat";
  return "other";
}

/**
 * Turn parsed email records into the pets + vaccinations the dashboard renders.
 * Records are merged per pet (by normalized name) and deduped per vaccine,
 * keeping the record from the most recently received email.
 */
export function aggregateRecords(dated: DatedRecord[]): AggregateResult {
  const groups = new Map<string, PetGroup>();
  let skipped = 0;

  for (const { record, receivedAt } of dated) {
    if (!record.nextDueDate) {
      skipped += 1;
      continue;
    }

    const name = record.petName?.trim() || "Unknown pet";
    const petKey = normalizeKey(name) || "unknown pet";

    let group = groups.get(petKey);
    if (!group) {
      group = {
        displayName: name,
        nameSeenAt: receivedAt,
        speciesVotes: { dog: 0, cat: 0, other: 0 },
        byVaccine: new Map(),
      };
      groups.set(petKey, group);
    }

    // Prefer the display name from the most recent email that named this pet.
    if (receivedAt >= group.nameSeenAt) {
      group.displayName = name;
      group.nameSeenAt = receivedAt;
    }
    group.speciesVotes[record.species] += 1;

    const vaccineKey = normalizeKey(record.vaccineName);
    const existing = group.byVaccine.get(vaccineKey);
    if (!existing || receivedAt >= existing.receivedAt) {
      group.byVaccine.set(vaccineKey, { record, receivedAt });
    }
  }

  const pets: Pet[] = [];
  const vaccinations: Vaccination[] = [];

  for (const [petKey, group] of groups) {
    const category = resolveSpecies(group.speciesVotes);
    const style = SPECIES_STYLE[category];
    const species: Species = category === "cat" ? "cat" : "dog";
    const petId = slug(petKey);

    pets.push({
      id: petId,
      name: group.displayName,
      species,
      breed: category === "other" ? "Pet" : category === "cat" ? "Cat" : "Dog",
      birthDate: null,
      color: style.color,
      emoji: style.emoji,
    });

    for (const { record } of group.byVaccine.values()) {
      const monthly = isMonthlyPreventative(record.vaccineName);
      vaccinations.push({
        id: `${petId}-${slug(record.vaccineName)}`,
        petId,
        kind: monthly ? "monthly" : "vaccine",
        name: record.vaccineName,
        description: record.description ?? "",
        administeredDate: record.administeredDate,
        nextDueDate: record.nextDueDate!,
        recurrenceMonths: monthly ? 1 : record.recurrenceMonths ?? DEFAULT_RECURRENCE_MONTHS,
        source: "email",
      });
    }
  }

  return { pets, vaccinations, skipped };
}
