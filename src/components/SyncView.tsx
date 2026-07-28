"use client";

import { type ChangeEvent, useMemo, useRef, useState } from "react";
import {
  syncVetEmails,
  importScreenshot,
  disconnect,
  type RecordsResult,
} from "@/app/actions";
import { aggregateRecords, type DatedRecord } from "@/lib/aggregate";
import { Dashboard } from "./Dashboard";

interface SyncViewProps {
  initialVetEmail: string;
  userEmail: string | null;
}

const MAX_IMAGE_EDGE = 1600;

/** Downscale to a bounded JPEG and return bare base64 (no data: prefix). */
async function fileToJpegBase64(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode failed"));
    img.src = dataUrl;
  });

  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
}

export function SyncView({ initialVetEmail, userEmail }: SyncViewProps) {
  const [address, setAddress] = useState(initialVetEmail);
  const [records, setRecords] = useState<DatedRecord[]>([]);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [busy, setBusy] = useState<"sync" | "import" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { pets, vaccinations } = useMemo(() => aggregateRecords(records), [records]);
  const hasData = records.length > 0;

  function merge(result: RecordsResult, success: string) {
    if (!result.ok) {
      setStatus({ ok: false, message: result.error ?? "Something went wrong." });
      return;
    }
    setRecords((prev) => [...prev, ...result.records]);
    setStatus({ ok: true, message: success });
  }

  async function handleSync() {
    setBusy("sync");
    setStatus(null);
    try {
      const result = await syncVetEmails(address);
      merge(result, `Scanned ${result.scanned} email${result.scanned === 1 ? "" : "s"}.`);
    } finally {
      setBusy(null);
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy("import");
    setStatus(null);
    try {
      const base64 = await fileToJpegBase64(file);
      const result = await importScreenshot(base64, "image/jpeg");
      merge(
        result,
        `Imported ${result.records.length} record${result.records.length === 1 ? "" : "s"} from screenshot.`,
      );
    } catch {
      setStatus({ ok: false, message: "Could not read that image." });
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
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
            placeholder="hello@drtreat.com"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={handleSync}
            disabled={busy !== null}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy === "sync" ? "Syncing…" : "Sync vet emails"}
          </button>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Or import a screenshot of your vet records app (e.g. Dr Treat) to add
            procedures and vaccinations it shows.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy !== null}
            className="mt-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {busy === "import" ? "Reading screenshot…" : "Import screenshot"}
          </button>
        </div>

        {status && (
          <p
            className={`mt-3 text-sm ${
              status.ok
                ? "text-slate-500 dark:text-slate-400"
                : "font-medium text-red-600 dark:text-red-400"
            }`}
          >
            {status.message}
          </p>
        )}
      </section>

      {hasData ? (
        <Dashboard pets={pets} vaccinations={vaccinations} />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Sync your vet emails or import a screenshot to see your pets&apos;
          vaccinations and procedures with what&apos;s due.
        </div>
      )}
    </>
  );
}
