import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Booking, PassengerInput } from "@/types/domain";

type RpcResult<T> = PromiseLike<{
  data: T | null;
  error: { message: string } | null;
}>;

type BookingRpcClient = {
  rpc(
    fn: "book_seat",
    args: {
      p_flight_id: string;
      p_seat_id: string;
      p_passengers: PassengerInput[];
    }
  ): RpcResult<Array<{ booking_id: string; pnr_code: string; total_price: number }>>;
  rpc(fn: "cancel_booking", args: { p_booking_id: string }): RpcResult<Array<{ booking_id: string; released_seat_id: string }>>;
  rpc(
    fn: "reschedule_booking",
    args: {
      p_booking_id: string;
      p_new_flight_id: string;
      p_new_seat_id: string;
    }
  ): RpcResult<Array<{ booking_id: string; new_pnr_code: string; fee_charged: number }>>;
};

function createBookingRpcClient(): BookingRpcClient {
  return createSupabaseBrowserClient() as unknown as BookingRpcClient;
}

export async function createBooking({
  flightId,
  seatId,
  passengers
}: {
  flightId: string;
  seatId: string;
  passengers: PassengerInput[];
}): Promise<{ bookingId: string; pnrCode: string; totalPrice: number }> {
  const supabase = createBookingRpcClient();
  const { data, error } = await supabase.rpc("book_seat", {
    p_flight_id: flightId,
    p_seat_id: seatId,
    p_passengers: passengers
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.[0]) {
    throw new Error("Booking RPC returned no confirmation");
  }

  const result = data[0];
  return {
    bookingId: result.booking_id,
    pnrCode: result.pnr_code,
    totalPrice: Number(result.total_price)
  };
}

export async function getMyBookings(): Promise<Booking[]> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, flights(*), seats(*), passengers(*)")
    .order("booked_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getBookingById(bookingId: string): Promise<Booking> {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, flights(*), seats(*), passengers(*)")
    .eq("id", bookingId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function cancelBooking(bookingId: string): Promise<void> {
  const supabase = createBookingRpcClient();
  const { error } = await supabase.rpc("cancel_booking", { p_booking_id: bookingId });

  if (error) {
    throw new Error(error.message);
  }
}

export async function rescheduleBooking({
  bookingId,
  newFlightId,
  newSeatId
}: {
  bookingId: string;
  newFlightId: string;
  newSeatId: string;
}): Promise<void> {
  const supabase = createBookingRpcClient();
  const { error } = await supabase.rpc("reschedule_booking", {
    p_booking_id: bookingId,
    p_new_flight_id: newFlightId,
    p_new_seat_id: newSeatId
  });

  if (error) {
    throw new Error(error.message);
  }
}
