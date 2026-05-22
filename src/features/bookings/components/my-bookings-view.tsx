"use client";

import { useCallback, useEffect, useState } from "react";
import { TicketCheck } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingCard } from "@/features/bookings/components/booking-card";
import { getMyBookings } from "@/services/bookings";
import { useToast } from "@/providers/toast-provider";
import type { Booking } from "@/types/domain";

export function MyBookingsView() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { pushToast } = useToast();

  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setBookings(await getMyBookings());
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Could not load bookings", "error");
    } finally {
      setIsLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={TicketCheck}
        title="No bookings yet"
        description="Search a flight and confirm a seat to see your bookings here."
        action={
          <Link
            href="/"
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-skyway px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Search flights
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} onChanged={loadBookings} />
      ))}
    </div>
  );
}
