"use client";

import { useEffect } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Database } from "@/types/database";
import type { Seat } from "@/types/domain";

type SeatRow = Database["public"]["Tables"]["seats"]["Row"];

export function useSeatRealtime({
  flightId,
  onSeatChange
}: {
  flightId: string | null;
  onSeatChange: (seat: Seat) => void;
}) {
  useEffect(() => {
    if (!flightId) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`seats:${flightId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "seats",
          filter: `flight_id=eq.${flightId}`
        },
        (payload: RealtimePostgresChangesPayload<SeatRow>) => {
          onSeatChange(payload.new as Seat);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [flightId, onSeatChange]);
}
