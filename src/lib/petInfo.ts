import type { Vaccination } from "./types";

/**
 * Most recent administered checkup/exam date (ISO), falling back to the most
 * recent administered date of any kind. Null when nothing has been administered.
 */
export function lastCheckup(vaccinations: Vaccination[]): string | null {
  const exams = vaccinations.filter(
    (v) => v.administeredDate && /exam|check|wellness/i.test(v.name),
  );
  const pool = exams.length
    ? exams
    : vaccinations.filter((v) => v.administeredDate);
  const dates = pool
    .map((v) => v.administeredDate)
    .filter((d): d is string => d !== null)
    .sort();
  return dates.length ? dates[dates.length - 1] : null;
}
