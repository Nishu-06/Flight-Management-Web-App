"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Armchair, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeatRealtime } from "@/hooks/use-seat-realtime";
import { formatCurrency, cn } from "@/lib/utils";
import { getSeatsForFlight } from "@/services/flights";
import { useFlightStore } from "@/stores/use-flight-store";
import type { Flight, Seat, SeatClass } from "@/types/domain";

const cabinLabels: Record<SeatClass, string> = {
  first: "First Class",
  business: "Business",
  economy: "Economy"
};

const classOrder: SeatClass[] = ["first", "business", "economy"];

function seatSortValue(seatNumber: string): number {
  const row = Number.parseInt(seatNumber, 10);
  const letter = seatNumber.replace(String(row), "").charCodeAt(0);
  return row * 10 + letter;
}

export function SeatMap({ flight }: { flight: Flight }) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const selectedSeat = useFlightStore((state) => state.selectedSeat);
  const setSelectedSeat = useFlightStore((state) => state.setSelectedSeat);
  const optimisticSeatIds = useFlightStore((state) => state.optimisticSeatIds);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getSeatsForFlight(flight.id)
      .then((data) => {
        if (active) {
          setSeats(data);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [flight.id]);

  const handleRealtimeSeat = useCallback((seat: Seat) => {
    setSeats((current) => current.map((item) => (item.id === seat.id ? seat : item)));
  }, []);

  useSeatRealtime({ flightId: flight.id, onSeatChange: handleRealtimeSeat });

  const seatsByClass = useMemo(
    () =>
      classOrder.map((seatClass) => ({
        seatClass,
        seats: seats
          .filter((seat) => seat.class === seatClass)
          .sort((left, right) => seatSortValue(left.seat_number) - seatSortValue(right.seat_number))
      })),
    [seats]
  );

  if (isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white/95 p-4 shadow-panel sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Select a seat</h2>
          <p className="text-sm text-slate-600">Live updates arrive from Supabase Realtime.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
          <Legend tone="available" label="Available" />
          <Legend tone="selected" label="Selected" />
          <Legend tone="occupied" label="Occupied" />
        </div>
      </div>

      <div className="mt-5 overflow-x-auto pb-2">
        <div className="min-w-[560px] rounded-[48px] border-2 border-slate-200 bg-gradient-to-b from-slate-50 to-white p-5 shadow-inner">
          {seatsByClass.map(({ seatClass, seats: cabinSeats }) => (
            <div key={seatClass} className="mb-6 last:mb-0">
              <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {cabinLabels[seatClass]}
                </h3>
                <span className="text-xs text-slate-500">
                  +{formatCurrency(cabinSeats[0]?.extra_fee ?? 0)}
                </span>
              </div>
              <div className="grid grid-cols-[repeat(3,44px)_36px_repeat(3,44px)] justify-center gap-2">
                {cabinSeats.map((seat, index) => {
                  const isAisle = index % 6 === 3;
                  const isSelected = selectedSeat?.id === seat.id;
                  const isOptimistic = optimisticSeatIds.includes(seat.id);
                  return (
                    <div key={seat.id} className={cn(isAisle && "col-start-5")}>
                      <button
                        type="button"
                        title={`${seat.seat_number} ${cabinLabels[seat.class]} ${seat.is_available ? "available" : "occupied"}`}
                        disabled={!seat.is_available}
                        onClick={() => setSelectedSeat(seat)}
                        className={cn(
                          "flex h-11 w-11 touch-manipulation items-center justify-center rounded-md border text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                          seat.is_available && "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
                          !seat.is_available && "cursor-not-allowed border-slate-200 bg-slate-200 text-slate-400",
                          isSelected && "border-teal-700 bg-skyway text-white hover:bg-teal-800",
                          isOptimistic && "animate-pulse"
                        )}
                      >
                        {seat.seat_number}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 text-sm text-slate-600">
          <CircleHelp className="mt-0.5 h-4 w-4" aria-hidden />
          <span>Occupied seats are disabled immediately when another user books them.</span>
        </div>
        <Button disabled={!selectedSeat}>
          <Armchair className="h-4 w-4" />
          {selectedSeat ? `Continue with ${selectedSeat.seat_number}` : "Choose a seat"}
        </Button>
      </div>
    </section>
  );
}

function Legend({ tone, label }: { tone: "available" | "selected" | "occupied"; label: string }) {
  const colors = {
    available: "bg-emerald-50 border-emerald-200",
    selected: "bg-skyway border-teal-700",
    occupied: "bg-slate-200 border-slate-300"
  };

  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("h-3 w-3 rounded border", colors[tone])} />
      {label}
    </span>
  );
}
