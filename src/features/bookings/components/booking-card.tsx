"use client";

import { format, isBefore, addHours } from "date-fns";
import { CalendarClock, Plane, XCircle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { cancelBooking } from "@/services/bookings";
import { useToast } from "@/providers/toast-provider";
import type { Booking } from "@/types/domain";

export function BookingCard({ booking, onChanged }: { booking: Booking; onChanged: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { pushToast } = useToast();
  const flight = booking.flights;
  const seat = booking.seats;
  const cannotCancel =
    !flight || booking.status !== "confirmed" || isBefore(new Date(flight.departs_at), addHours(new Date(), 2));

  async function handleCancel() {
    setIsCancelling(true);
    try {
      await cancelBooking(booking.id);
      pushToast("Booking cancelled and seat released.");
      setConfirmOpen(false);
      onChanged();
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Cancellation failed", "error");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white/95 p-5 shadow-sm transition hover:shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-skyway">PNR {booking.pnr_code}</p>
          <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold text-ink">
            <Plane className="h-4 w-4" aria-hidden />
            {flight ? `${flight.origin} to ${flight.destination}` : "Flight unavailable"}
          </h2>
        </div>
        <Badge tone={booking.status}>{booking.status}</Badge>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
        <span>{flight ? format(new Date(flight.departs_at), "dd MMM yyyy, h:mm a") : "No departure"}</span>
        <span>Seat {seat?.seat_number ?? "N/A"}</span>
        <span>{seat?.class ?? "seat"}</span>
        <span>{formatCurrency(booking.total_price)}</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/reschedule/${booking.id}`}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50"
        >
          <CalendarClock className="h-4 w-4" />
          Reschedule
        </Link>
        <Button variant="danger" disabled={cannotCancel} onClick={() => setConfirmOpen(true)}>
          <XCircle className="h-4 w-4" />
          Cancel
        </Button>
      </div>
      {cannotCancel && booking.status === "confirmed" ? (
        <p className="mt-3 text-xs text-slate-500">Cancellation is blocked within 2 hours of departure by the database RPC.</p>
      ) : null}

      <Dialog open={confirmOpen} title="Cancel booking?" onClose={() => setConfirmOpen(false)}>
        <p className="text-sm text-slate-600">
          This will atomically mark the booking cancelled and release seat {seat?.seat_number ?? ""}.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            Keep booking
          </Button>
          <Button variant="danger" onClick={handleCancel} disabled={isCancelling}>
            {isCancelling ? "Cancelling..." : "Cancel booking"}
          </Button>
        </div>
      </Dialog>
    </article>
  );
}
