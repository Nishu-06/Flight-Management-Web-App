import { PageShell } from "@/components/layout/page-shell";
import { RescheduleView } from "@/features/bookings/components/reschedule-view";

export default function ReschedulePage({ params }: { params: { bookingId: string } }) {
  return (
    <PageShell>
      <RescheduleView bookingId={params.bookingId} />
    </PageShell>
  );
}
