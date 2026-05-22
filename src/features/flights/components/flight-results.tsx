"use client";

import { format } from "date-fns";
import { ArrowRight, Armchair, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { useFlightStore } from "@/stores/use-flight-store";
import type { Flight } from "@/types/domain";

export function FlightResults({
  flights,
  isLoading
}: {
  flights: Flight[];
  isLoading: boolean;
}) {
  const setSelectedFlight = useFlightStore((state) => state.setSelectedFlight);

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <EmptyState
        icon={Armchair}
        title="No flights yet"
        description="Search a seeded route and date from your Supabase seed data to see available flights."
      />
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {flights.map((flight) => (
        <article
          key={flight.id}
          className="rounded-lg border border-slate-200 bg-white/95 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-panel"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-skyway">{flight.flight_no}</p>
              <h2 className="mt-1 flex items-center gap-2 text-xl font-semibold text-ink">
                {flight.origin}
                <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden />
                {flight.destination}
              </h2>
            </div>
            <p className="text-right text-lg font-semibold text-ink">{formatCurrency(flight.base_price)}</p>
          </div>
          <div className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 sm:grid-cols-2">
            <span className="flex items-center gap-2 font-medium text-slate-700">
              <Clock className="h-4 w-4" aria-hidden />
              {format(new Date(flight.departs_at), "dd MMM, h:mm a")}
            </span>
            <span className="font-medium text-slate-700">{flight.aircraft_type}</span>
          </div>
          <Button className="mt-5 w-full" onClick={() => setSelectedFlight(flight)}>
            Select seats
          </Button>
        </article>
      ))}
    </section>
  );
}
