"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bookingSchema, type BookingInput } from "@/lib/validations";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { createBooking } from "@/services/bookings";
import { useFlightStore } from "@/stores/use-flight-store";
import { useToast } from "@/providers/toast-provider";
import type { Flight, Seat } from "@/types/domain";

export function PassengerForm({
  flight,
  seat,
  passengerCount
}: {
  flight: Flight;
  seat: Seat;
  passengerCount: number;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const markSeatOptimistic = useFlightStore((state) => state.markSeatOptimistic);
  const clearOptimisticSeat = useFlightStore((state) => state.clearOptimisticSeat);
  const resetBookingFlow = useFlightStore((state) => state.resetBookingFlow);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      passengers: Array.from({ length: passengerCount }, () => ({
        fullName: "",
        passportNo: "",
        nationality: "Indian",
        dob: ""
      }))
    }
  });

  const { fields } = useFieldArray({ control, name: "passengers" });

  async function submit(values: BookingInput) {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      pushToast("Please login before confirming a booking.", "error");
      router.push("/login?redirectTo=/");
      return;
    }

    try {
      markSeatOptimistic(seat.id);
      const result = await createBooking({ flightId: flight.id, seatId: seat.id, passengers: values.passengers });
      pushToast(`Booking confirmed. PNR ${result.pnrCode}`);
      resetBookingFlow();
      router.push("/my-bookings");
      router.refresh();
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Booking failed", "error");
    } finally {
      clearOptimisticSeat(seat.id);
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="rounded-lg border border-slate-200 bg-white/95 p-5 shadow-panel">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-skyway" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold text-ink">Passenger details</h2>
          <p className="text-sm text-slate-600">Passport numbers are submitted only to Supabase and are not persisted in Zustand.</p>
        </div>
      </div>

      <div className="mt-5 space-y-6">
        {fields.map((field, index) => (
          <fieldset key={field.id} className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
            <legend className="px-1 text-sm font-semibold text-slate-700">Passenger {index + 1}</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                error={errors.passengers?.[index]?.fullName?.message}
                {...register(`passengers.${index}.fullName`)}
              />
              <Input
                label="Passport number"
                error={errors.passengers?.[index]?.passportNo?.message}
                {...register(`passengers.${index}.passportNo`)}
              />
              <Input
                label="Nationality"
                error={errors.passengers?.[index]?.nationality?.message}
                {...register(`passengers.${index}.nationality`)}
              />
              <Input
                label="Date of birth"
                type="date"
                error={errors.passengers?.[index]?.dob?.message}
                {...register(`passengers.${index}.dob`)}
              />
            </div>
          </fieldset>
        ))}
      </div>

      <Button type="submit" className="mt-5 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Locking seat..." : "Confirm booking"}
      </Button>
    </form>
  );
}
