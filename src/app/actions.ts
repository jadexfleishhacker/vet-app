"use server";

import { auth, signOut } from "@/auth";
import { fetchVetEmails } from "@/lib/gmail";
import { parseVetEmail } from "@/lib/parseVetEmail";
import { aggregateRecords } from "@/lib/aggregate";
import type { Pet, Vaccination } from "@/lib/types";

export interface SyncResult {
  ok: boolean;
  error: string | null;
  pets: Pet[];
  vaccinations: Vaccination[];
  emailsScanned: number;
  skipped: number;
}

function failure(error: string): SyncResult {
  return { ok: false, error, pets: [], vaccinations: [], emailsScanned: 0, skipped: 0 };
}

export async function syncVetEmails(fromAddress: string): Promise<SyncResult> {
  const session = await auth();
  if (!session?.accessToken || session.error) {
    return failure("Gmail is not connected. Sign in again.");
  }
  if (!fromAddress.trim()) {
    return failure("Enter your vet's email address.");
  }

  try {
    const emails = await fetchVetEmails(session.accessToken, fromAddress.trim());
    if (emails.length === 0) {
      return { ok: true, error: null, pets: [], vaccinations: [], emailsScanned: 0, skipped: 0 };
    }
    const records = (await Promise.all(emails.map(parseVetEmail))).flat();
    const { pets, vaccinations, skipped } = aggregateRecords(records);
    return { ok: true, error: null, pets, vaccinations, emailsScanned: emails.length, skipped };
  } catch (error) {
    return failure(error instanceof Error ? error.message : "Sync failed.");
  }
}

export async function disconnect(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
