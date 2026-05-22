drop index if exists public.bookings_one_confirmed_per_seat_idx;

create unique index if not exists bookings_one_active_per_seat_idx
  on public.bookings(seat_id)
  where status in ('confirmed', 'rescheduled');

create or replace function public.book_seat(
  p_flight_id uuid,
  p_seat_id uuid,
  p_passengers jsonb
)
returns table (
  booking_id uuid,
  pnr_code text,
  total_price numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  selected_seat public.seats%rowtype;
  selected_flight public.flights%rowtype;
  new_booking_id uuid;
  new_pnr text;
  passenger jsonb;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = 'P0001';
  end if;

  if jsonb_typeof(p_passengers) <> 'array' or jsonb_array_length(p_passengers) < 1 then
    raise exception 'At least one passenger is required' using errcode = 'P0001';
  end if;

  select * into selected_flight
  from public.flights
  where id = p_flight_id
    and status in ('scheduled', 'boarding')
    and departs_at > now()
  for update;

  if not found then
    raise exception 'Flight is not available for booking' using errcode = 'P0001';
  end if;

  select * into selected_seat
  from public.seats
  where id = p_seat_id
    and flight_id = p_flight_id
  for update;

  if not found then
    raise exception 'Seat does not belong to this flight' using errcode = 'P0001';
  end if;

  if selected_seat.is_available is false then
    raise exception 'Seat is already booked' using errcode = 'P0001';
  end if;

  update public.seats
  set is_available = false
  where id = p_seat_id;

  loop
    new_pnr := public.generate_pnr();
    exit when not exists (
      select 1
      from public.bookings
      where public.bookings.pnr_code = new_pnr
    );
  end loop;

  insert into public.bookings(user_id, flight_id, seat_id, total_price, pnr_code)
  values (current_user_id, p_flight_id, p_seat_id, selected_flight.base_price + selected_seat.extra_fee, new_pnr)
  returning id into new_booking_id;

  for passenger in select * from jsonb_array_elements(p_passengers) loop
    insert into public.passengers(booking_id, full_name, passport_no, nationality, dob)
    values (
      new_booking_id,
      passenger ->> 'fullName',
      passenger ->> 'passportNo',
      passenger ->> 'nationality',
      (passenger ->> 'dob')::date
    );
  end loop;

  return query
  select new_booking_id, new_pnr, selected_flight.base_price + selected_seat.extra_fee;
end;
$$;

create or replace function public.cancel_booking(p_booking_id uuid)
returns table (
  booking_id uuid,
  released_seat_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  selected_booking public.bookings%rowtype;
  departure_time timestamptz;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = 'P0001';
  end if;

  select * into selected_booking
  from public.bookings
  where id = p_booking_id
    and user_id = current_user_id
  for update;

  if not found then
    raise exception 'Booking not found' using errcode = 'P0001';
  end if;

  if selected_booking.status not in ('confirmed', 'rescheduled') then
    raise exception 'Only active bookings can be cancelled' using errcode = 'P0001';
  end if;

  select departs_at into departure_time
  from public.flights
  where id = selected_booking.flight_id
  for update;

  if departure_time <= now() + interval '2 hours' then
    raise exception 'Bookings cannot be cancelled within 2 hours of departure'
      using errcode = 'P0001';
  end if;

  update public.bookings
  set status = 'cancelled'
  where id = selected_booking.id;

  update public.seats
  set is_available = true
  where id = selected_booking.seat_id;

  return query select selected_booking.id, selected_booking.seat_id;
end;
$$;

create or replace function public.reschedule_booking(
  p_booking_id uuid,
  p_new_flight_id uuid,
  p_new_seat_id uuid
)
returns table (
  booking_id uuid,
  new_pnr_code text,
  fee_charged numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  selected_booking public.bookings%rowtype;
  old_flight public.flights%rowtype;
  new_flight public.flights%rowtype;
  new_seat public.seats%rowtype;
  fee numeric := 0;
  new_pnr text;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = 'P0001';
  end if;

  select * into selected_booking
  from public.bookings
  where id = p_booking_id
    and user_id = current_user_id
  for update;

  if not found or selected_booking.status not in ('confirmed', 'rescheduled') then
    raise exception 'Active booking not found' using errcode = 'P0001';
  end if;

  select * into old_flight
  from public.flights
  where id = selected_booking.flight_id
  for update;

  if not found then
    raise exception 'Original flight not found' using errcode = 'P0001';
  end if;

  select * into new_flight
  from public.flights
  where id = p_new_flight_id
    and status in ('scheduled', 'boarding')
    and departs_at > now() + interval '2 hours'
  for update;

  if not found then
    raise exception 'New flight is not available' using errcode = 'P0001';
  end if;

  if old_flight.origin <> new_flight.origin or old_flight.destination <> new_flight.destination then
    raise exception 'Reschedule must keep the same route' using errcode = 'P0001';
  end if;

  select * into new_seat
  from public.seats
  where id = p_new_seat_id
    and flight_id = p_new_flight_id
  for update;

  if not found or new_seat.is_available is false then
    raise exception 'New seat is not available' using errcode = 'P0001';
  end if;

  fee := greatest(0, new_flight.base_price - old_flight.base_price);

  update public.seats set is_available = true where id = selected_booking.seat_id;
  update public.seats set is_available = false where id = p_new_seat_id;

  loop
    new_pnr := public.generate_pnr();
    exit when not exists (
      select 1
      from public.bookings
      where public.bookings.pnr_code = new_pnr
    );
  end loop;

  insert into public.reschedules(booking_id, old_flight_id, new_flight_id, fee_charged)
  values (selected_booking.id, selected_booking.flight_id, p_new_flight_id, fee);

  update public.bookings
  set flight_id = p_new_flight_id,
      seat_id = p_new_seat_id,
      total_price = new_flight.base_price + new_seat.extra_fee + fee,
      pnr_code = new_pnr,
      status = 'rescheduled'
  where id = selected_booking.id;

  return query select selected_booking.id, new_pnr, fee;
end;
$$;

grant execute on function public.book_seat(uuid, uuid, jsonb) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
grant execute on function public.reschedule_booking(uuid, uuid, uuid) to authenticated;
