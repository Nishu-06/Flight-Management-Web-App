import { PageShell } from "@/components/layout/page-shell";
import { MyBookingsView } from "@/features/bookings/components/my-bookings-view";

export default function MyBookingsPage() {
  return (
    <PageShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-skyway">Protected route</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">My bookings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Bookings are filtered by RLS, so users can only read their own records.
        </p>
      </div>
      <MyBookingsView />
    </PageShell>
  );
}
