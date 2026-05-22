"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FlightResults } from "@/features/flights/components/flight-results";
import { FlightSearchForm } from "@/features/flights/components/flight-search-form";
import { SeatMap } from "@/features/seats/components/seat-map";
import type { SearchInput } from "@/lib/validations";
import { searchFlights } from "@/services/flights";
import { getBookingById, rescheduleBooking } from "@/services/bookings";
import { useFlightStore } from "@/stores/use-flight-store";
import { useToast } from "@/providers/toast-provider";
import type { Booking, Flight } from "@/types/domain";

export function RescheduleView({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedFlight = useFlightStore((state) => state.selectedFlight);
  const selectedSeat = useFlightStore((state) => state.selectedSeat);
  const setSelectedFlight = useFlightStore((state) => state.setSelectedFlight);
  const setSelectedSeat = useFlightStore((state) => state.setSelectedSeat);

  useEffect(() => {
    getBookingById(bookingId)
      .then(setBooking)
      .catch((error: unknown) => pushToast(error instanceof Error ? error.message : "Booking not found", "error"))
      .finally(() => setIsLoading(false));

    return () => {
      setSelectedFlight(null);
      setSelectedSeat(null);
    };
  }, [bookingId, pushToast, setSelectedFlight, setSelectedSeat]);

  async function handleSearch(query: SearchInput) {
    if (!booking?.flights) {
      return;
    }

    const routeLockedQuery = {
      ...query,
      origin: booking.flights.origin,
      destination: booking.flights.destination
    };

    setFlights(await searchFlights(routeLockedQuery));
  }

  async function submitReschedule() {
    if (!selectedFlight || !selectedSeat) {
      return;
    }

    setIsSubmitting(true);
    try {
      await rescheduleBooking({
        bookingId,
        newFlightId: selectedFlight.id,
        newSeatId: selectedSeat.id
      });
      pushToast("Booking rescheduled. Your previous seat was released.");
      router.push("/my-bookings");
      router.refresh();
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Reschedule failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-white p-5 shadow-panel">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="h-5 w-5 text-skyway" aria-hidden />
          <div>
            <h1 className="text-xl font-semibold text-ink">Reschedule PNR {booking.pnr_code}</h1>
            <p className="text-sm text-slate-600">
              Choose another {booking.flights?.origin} to {booking.flights?.destination} flight. The database releases
              the old seat, locks the new one, and charges only the fare difference when the new flight is more expensive.
            </p>
          </div>
        </div>
      </section>

      <FlightSearchForm onSearch={handleSearch} />

      {selectedFlight ? (
        <div className="space-y-4">
          <SeatMap flight={selectedFlight} />
          <Button disabled={!selectedSeat || isSubmitting} onClick={submitReschedule}>
            {isSubmitting ? "Rescheduling..." : "Confirm reschedule"}
          </Button>
        </div>
      ) : (
        <FlightResults flights={flights.filter((flight) => flight.id !== booking.flight_id)} isLoading={false} />
      )}
    </div>
  );
}
