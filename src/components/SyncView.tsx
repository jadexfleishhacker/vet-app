"use client";

import { useState } from "react";
import { syncVetEmails, disconnect, type SyncResult } from "@/app/actions";
import { Dashboard } from "./Dashboard";

interface SyncViewProps {
  initialVetEmail: string;
  userEmail: string | null;
}

export function SyncView({ initialVetEmail, userEmail }: SyncViewProps) {
  const [address, setAddress] = useState(initialVetEmail);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);
    try {
      setResult(await syncVetEmails(address));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Connected{userEmail ? ` as ${userEmail}` : ""}
          </p>
          <form action={disconnect}>
            <button
              type="submit"
              className="text-sm font-medium text-slate-500 underline-offset-2 hover:underline dark:text-slate-400"
            >
              Disconnect
            </button>
          </form>
        </div>
        <label
          htmlFor="vet-email"
          className="block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Vet email address
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="vet-email"
            type="email"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="reminders@yourvet.com"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={handleSync}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Syncing…" : "Sync vet emails"}
          </button>
        </div>
        {result?.ok && (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Scanned {result.emailsScanned} email{result.emailsScanned === 1 ? "" : "s"}
            {result.skipped > 0 ? ` · ${result.skipped} record(s) had no due date` : ""}.
          </p>
        )}
        {result && !result.ok && (
          <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">
            {result.error}
          </p>
        )}
      </section>

      {result?.ok ? (
        <Dashboard pets={result.pets} vaccinations={result.vaccinations} />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Enter your vet&apos;s email address and sync to pull in your pets&apos;
          vaccination reminders.
        </div>
      )}
    </>
  );
}
