import { WifiOff } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";

export default function OfflinePage() {
  return (
    <PageShell>
      <section className="rounded-lg border bg-white p-8 shadow-panel">
        <WifiOff className="h-9 w-9 text-skyway" aria-hidden />
        <h1 className="mt-4 text-2xl font-semibold">You are offline</h1>
        <p className="mt-2 max-w-xl text-sm text-slate-600">
          Cached booking pages remain available. New searches, bookings, cancellations,
          and live seat updates need a network connection.
        </p>
      </section>
    </PageShell>
  );
}
