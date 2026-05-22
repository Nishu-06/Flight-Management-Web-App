import { PageShell } from "@/components/layout/page-shell";
import { BookingConfirmationView } from "@/features/bookings/components/booking-confirmation-view";

export default function BookingConfirmationPage({ params }: { params: { bookingId: string } }) {
  return (
    <PageShell>
      <BookingConfirmationView bookingId={params.bookingId} />
    </PageShell>
  );
}
