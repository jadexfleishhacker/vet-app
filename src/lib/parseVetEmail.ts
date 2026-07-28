import type { VetEmail } from "./gmail";
import { extractRecords, type ParsedRecord } from "./extraction";

export type { ParsedRecord } from "./extraction";

/** Parse a single vet email into structured vaccination/procedure records. */
export async function parseVetEmail(email: VetEmail): Promise<ParsedRecord[]> {
  return extractRecords(
    `Subject: ${email.subject}\nDate: ${email.date}\n\n${email.body}`,
  );
}
