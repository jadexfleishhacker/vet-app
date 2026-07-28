export type Species = "dog" | "cat";

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  /** ISO date (YYYY-MM-DD), or null when unknown (e.g. parsed from email). */
  birthDate: string | null;
  /** Accent color (hex) used for the pet's avatar and timeline. */
  color: string;
  emoji: string;
}

/** Where a vaccination record originated. Email ingestion (Phase 3) sets "email". */
export type VaccinationSource = "seed" | "manual" | "email";

/** "monthly" = self-administered monthly preventative (flea/tick), reminded not overdue. */
export type VaccinationKind = "vaccine" | "monthly";

export interface Vaccination {
  id: string;
  petId: string;
  kind: VaccinationKind;
  /** Vaccine or visit name, e.g. "Rabies", "DHPP", "Annual wellness exam". */
  name: string;
  /** Short description of what it covers. */
  description: string;
  /** ISO date the dose was administered. Null when the first dose is still upcoming. */
  administeredDate: string | null;
  /** ISO date the next dose/visit is due. */
  nextDueDate: string;
  /** Interval between doses, in months. */
  recurrenceMonths: number;
  source: VaccinationSource;
}
