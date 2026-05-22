"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FlightResults } from "@/features/flights/components/flight-results";
import { FlightSearchForm } from "@/features/flights/components/flight-search-form";
import { PassengerForm } from "@/features/bookings/components/passenger-form";
import { SeatMap } from "@/features/seats/components/seat-map";
import { useToast } from "@/providers/toast-provider";
import { searchFlights } from "@/services/flights";
import { useFlightStore } from "@/stores/use-flight-store";
import type { Flight } from "@/types/domain";
import type { SearchInput } from "@/lib/validations";

export function FlightSearchExperience() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const selectedFlight = useFlightStore((state) => state.selectedFlight);
  const selectedSeat = useFlightStore((state) => state.selectedSeat);
  const searchQuery = useFlightStore((state) => state.searchQuery);
  const setSelectedFlight = useFlightStore((state) => state.setSelectedFlight);
  const setSelectedSeat = useFlightStore((state) => state.setSelectedSeat);
  const { pushToast } = useToast();

  const handleSearch = useCallback(async (query: SearchInput) => {
    setIsLoading(true);
    try {
      setFlights(await searchFlights(query));
    } catch (error) {
      setFlights([]);
      pushToast(
        error instanceof Error
          ? error.message
          : "Could not search flights. Check your Supabase environment variables.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    if (!searchQuery) {
      return;
    }
    void handleSearch(searchQuery);
  }, [handleSearch, searchQuery]);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-skyway">Realtime operations desk</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Search flights, pick seats, and manage bookings in one flow.
          </h1>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white/95 p-5 text-sm shadow-panel">
          <dl className="grid grid-cols-3 divide-x divide-slate-200 text-center">
            <div>
              <dt className="text-2xl font-semibold tracking-tight text-ink">8</dt>
              <dd className="text-slate-500">Seed flights</dd>
            </div>
            <div>
              <dt className="text-2xl font-semibold tracking-tight text-ink">4</dt>
              <dd className="text-slate-500">Routes</dd>
            </div>
            <div>
              <dt className="text-2xl font-semibold tracking-tight text-ink">Live</dt>
              <dd className="text-slate-500">Seats</dd>
            </div>
          </dl>
        </div>
      </section>

      <FlightSearchForm onSearch={handleSearch} />

      {selectedFlight ? (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setSelectedFlight(null)}>
            <ArrowLeft className="h-4 w-4" />
            Back to results
          </Button>
          <SeatMap flight={selectedFlight} />
          {selectedSeat ? (
            <PassengerForm
              flight={selectedFlight}
              seat={selectedSeat}
              passengerCount={searchQuery?.passengerCount ?? 1}
            />
          ) : null}
          {selectedSeat ? (
            <Button variant="secondary" onClick={() => setSelectedSeat(null)}>
              Change selected seat
            </Button>
          ) : null}
        </div>
      ) : (
        <FlightResults flights={flights} isLoading={isLoading} />
      )}
    </div>
  );
}
