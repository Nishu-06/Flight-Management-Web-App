import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Flight, FlightSearchQuery, Seat } from "@/types/domain";

export async function searchFlights(query: FlightSearchQuery): Promise<Flight[]> {
  const supabase = createSupabaseBrowserClient();
  const start = new Date(`${query.date}T00:00:00`);
  const end = new Date(`${query.date}T23:59:59`);

  const { data, error } = await supabase
    .from("flights")
    .select("*")
    .eq("origin", query.origin)
    .eq("destination", query.destination)
    .gte("departs_at", start.toISOString())
    .lte("departs_at", end.toISOString())
    .order("departs_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getFlightById(flightId: string): Promise<Flight> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.from("flights").select("*").eq("id", flightId).single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getSeatsForFlight(flightId: string): Promise<Seat[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("seats")
    .select("*")
    .eq("flight_id", flightId)
    .order("seat_number", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
