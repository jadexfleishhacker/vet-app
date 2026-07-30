"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { aggregateRecords, type DatedRecord } from "@/lib/aggregate";
import type { Pet, Vaccination } from "@/lib/types";

const STORAGE_KEY = "vet-app:data";

type Origin = "email" | "import";
type StoredRecord = DatedRecord & { origin: Origin };

interface Persisted {
  records: StoredRecord[];
  emailSyncedAt: number | null;
}

interface VetDataValue {
  pets: Pet[];
  vaccinations: Vaccination[];
  /** False until localStorage has been read (avoids a flash of empty data on load). */
  ready: boolean;
  hasData: boolean;
  /** When email records were last synced (ms), or null. */
  emailSyncedAt: number | null;
  /** Replace all email-sourced records with a fresh sync. */
  syncEmail: (records: DatedRecord[]) => void;
  /** Add screenshot-imported records (kept alongside email records). */
  addImport: (records: DatedRecord[]) => void;
  clear: () => void;
}

const VetDataContext = createContext<VetDataValue | null>(null);

export function VetDataProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<StoredRecord[]>([]);
  const [emailSyncedAt, setEmailSyncedAt] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  // Load persisted data AFTER mount, not during render: a lazy useState
  // initializer would read localStorage on the initial client render and
  // diverge from the server's empty render, causing a hydration mismatch.
  /* eslint-disable react-hooks/set-state-in-effect -- one-time post-hydration load */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Persisted;
        setRecords(parsed.records ?? []);
        setEmailSyncedAt(parsed.emailSyncedAt ?? null);
      }
    } catch {
      // Corrupt or unavailable storage — start empty.
    }
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!ready) return;
    try {
      const payload: Persisted = { records, emailSyncedAt };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Storage full or unavailable — keep working from memory.
    }
  }, [records, emailSyncedAt, ready]);

  const syncEmail = useCallback((incoming: DatedRecord[]) => {
    setRecords((prev) => [
      ...prev.filter((r) => r.origin !== "email"),
      ...incoming.map((r) => ({ ...r, origin: "email" as const })),
    ]);
    setEmailSyncedAt(Date.now());
  }, []);

  const addImport = useCallback((incoming: DatedRecord[]) => {
    setRecords((prev) => [
      ...prev,
      ...incoming.map((r) => ({ ...r, origin: "import" as const })),
    ]);
  }, []);

  const clear = useCallback(() => {
    setRecords([]);
    setEmailSyncedAt(null);
  }, []);

  const { pets, vaccinations } = useMemo(
    () => aggregateRecords(records),
    [records],
  );

  const value = useMemo<VetDataValue>(
    () => ({
      pets,
      vaccinations,
      ready,
      hasData: records.length > 0,
      emailSyncedAt,
      syncEmail,
      addImport,
      clear,
    }),
    [pets, vaccinations, ready, records.length, emailSyncedAt, syncEmail, addImport, clear],
  );

  return <VetDataContext.Provider value={value}>{children}</VetDataContext.Provider>;
}

export function useVetData(): VetDataValue {
  const value = useContext(VetDataContext);
  if (!value) throw new Error("useVetData must be used within VetDataProvider");
  return value;
}
