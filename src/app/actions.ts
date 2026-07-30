"use server";

import { auth, signOut } from "@/auth";
import { fetchVetEmails } from "@/lib/gmail";
import { parseVetEmail } from "@/lib/parseVetEmail";
import { parseVetImage, type ImageMediaType } from "@/lib/parseVetImage";
import type { DatedRecord } from "@/lib/aggregate";

export interface RecordsResult {
  ok: boolean;
  error: string | null;
  records: DatedRecord[];
  /** Emails scanned, or 1 for a screenshot import. */
  scanned: number;
}

function failure(error: string): RecordsResult {
  return { ok: false, error, records: [], scanned: 0 };
}

export async function syncVetEmails(fromAddress: string): Promise<RecordsResult> {
  const session = await auth();
  if (!session?.accessToken || session.error) {
    return failure("Gmail is not connected. Sign in again.");
  }
  if (!fromAddress.trim()) {
    return failure("Enter your vet's email address.");
  }

  try {
    const emails = await fetchVetEmails(session.accessToken, fromAddress.trim());
    const records: DatedRecord[] = (
      await Promise.all(
        emails.map(async (email) =>
          (await parseVetEmail(email)).map((record) => ({
            record,
            receivedAt: email.internalDate,
          })),
        ),
      )
    ).flat();
    return { ok: true, error: null, records, scanned: emails.length };
  } catch (error) {
    console.error("[syncVetEmails] failed:", error);
    return failure(error instanceof Error ? error.message : "Sync failed.");
  }
}

export async function importScreenshot(
  base64: string,
  mediaType: ImageMediaType,
): Promise<RecordsResult> {
  const session = await auth();
  if (!session) {
    return failure("Sign in first.");
  }

  try {
    const parsed = await parseVetImage(base64, mediaType);
    // A screenshot reflects the current state, so treat it as most recent.
    const receivedAt = Date.now();
    const records = parsed.map((record) => ({ record, receivedAt }));
    return { ok: true, error: null, records, scanned: 1 };
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Import failed.");
  }
}

export async function disconnect(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
