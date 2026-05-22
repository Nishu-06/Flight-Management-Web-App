"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2, Plane, TicketCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { getBookingById } from "@/services/bookings";
import type { Booking } from "@/types/domain";

export function BookingConfirmationView({ bookingId }: { bookingId: string }) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    getBookingById(bookingId)
      .then(setBooking)
      .catch((error: unknown) =>
        pushToast(error instanceof Error ? error.message : "Could not load booking confirmation", "error")
      )
      .finally(() => setIsLoading(false));
  }, [bookingId, pushToast]);

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (!booking) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-900">
        <h1 className="text-lg font-semibold">Booking confirmation not found</h1>
        <p className="mt-2 text-sm">The booking may not exist or you may not have permission to view it.</p>
      </section>
    );
  }

  const flight = booking.flights;
  const seat = booking.seats;
  const passengers = booking.passengers ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-lg border border-emerald-200 bg-white p-6 shadow-panel">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-skyway">Booking confirmed</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">PNR {booking.pnr_code}</h1>
              <p className="mt-2 text-sm text-slate-600">
                Your seat is locked atomically in Supabase and your booking is visible in My Bookings.
              </p>
            </div>
          </div>
          <Badge tone={booking.status}>{booking.status}</Badge>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Plane className="h-4 w-4" aria-hidden />
            Flight details
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <Detail label="Route" value={flight ? `${flight.origin} to ${flight.destination}` : "Unavailable"} />
            <Detail label="Flight" value={flight?.flight_no ?? "Unavailable"} />
            <Detail
              label="Departure"
              value={flight ? format(new Date(flight.departs_at), "dd MMM yyyy, h:mm a") : "Unavailable"}
            />
            <Detail
              label="Arrival"
              value={flight ? format(new Date(flight.arrives_at), "dd MMM yyyy, h:mm a") : "Unavailable"}
            />
          </dl>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <TicketCheck className="h-4 w-4" aria-hidden />
            Seat and fare
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <Detail label="Seat" value={seat ? `${seat.seat_number} (${seat.class})` : "Unavailable"} />
            <Detail label="Passengers" value={String(passengers.length)} />
            <Detail label="Booked at" value={format(new Date(booking.booked_at), "dd MMM yyyy, h:mm a")} />
            <Detail label="Total" value={formatCurrency(booking.total_price)} />
          </dl>
        </article>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/my-bookings"
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-skyway px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-teal-900/20 transition hover:bg-teal-800"
        >
          View my bookings
        </Link>
        <Button variant="secondary" onClick={() => window.print()}>
          Print confirmation
        </Button>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}
