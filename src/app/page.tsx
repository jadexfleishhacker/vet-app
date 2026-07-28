import { auth, signIn } from "@/auth";
import { pets as seedPets, vaccinations as seedVaccinations } from "@/lib/data";
import { Dashboard } from "@/components/Dashboard";
import { SyncView } from "@/components/SyncView";

function ConnectCard() {
  return (
    <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Connect your Gmail
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Sign in with Google to pull vaccination reminders from your vet&apos;s
        emails. The app requests read-only access and never sends email.
      </p>
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
        className="mt-4"
      >
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Connect Gmail
        </button>
      </form>
    </section>
  );
}

export default async function Home() {
  const session = await auth();
  const connected = Boolean(session?.accessToken && !session.error);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8">
      <header className="mb-6">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Vet reminders
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Keep your pets up to date
        </h1>
      </header>

      {connected ? (
        <SyncView
          initialVetEmail={process.env.VET_EMAIL_ADDRESS ?? "hello@drtreat.com"}
          userEmail={session?.user?.email ?? null}
        />
      ) : (
        <>
          <ConnectCard />
          <p className="mb-4 text-sm font-medium text-slate-400 dark:text-slate-500">
            Preview with sample data
          </p>
          <Dashboard pets={seedPets} vaccinations={seedVaccinations} />
        </>
      )}
    </div>
  );
}
