create extension if not exists pgcrypto;

create type public.flight_status as enum ('scheduled', 'boarding', 'delayed', 'cancelled', 'departed');
create type public.seat_class as enum ('economy', 'business', 'first');
create type public.booking_status as enum ('confirmed', 'cancelled', 'rescheduled');

create table public.flights (
  id uuid primary key default gen_random_uuid(),
  flight_no text not null unique,
  origin text not null,
  destination text not null,
  departs_at timestamptz not null,
  arrives_at timestamptz not null,
  aircraft_type text not null,
  status public.flight_status not null default 'scheduled',
  base_price numeric(10, 2) not null check (base_price >= 0),
  created_at timestamptz not null default now(),
  constraint flights_route_check check (origin <> destination),
  constraint flights_time_check check (arrives_at > departs_at)
);

create table public.seats (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid not null references public.flights(id) on delete cascade,
  seat_number text not null,
  class public.seat_class not null,
  is_available boolean not null default true,
  extra_fee numeric(10, 2) not null default 0 check (extra_fee >= 0),
  updated_at timestamptz not null default now(),
  unique (flight_id, seat_number)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flight_id uuid not null references public.flights(id) on delete restrict,
  seat_id uuid not null references public.seats(id) on delete restrict,
  status public.booking_status not null default 'confirmed',
  booked_at timestamptz not null default now(),
  total_price numeric(10, 2) not null check (total_price >= 0),
  pnr_code text not null unique
);

create table public.passengers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  full_name text not null,
  passport_no text not null,
  nationality text not null,
  dob date not null,
  constraint passengers_full_name_check check (length(trim(full_name)) >= 2),
  constraint passengers_passport_check check (length(trim(passport_no)) >= 5)
);

create table public.reschedules (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  old_flight_id uuid not null references public.flights(id) on delete restrict,
  new_flight_id uuid not null references public.flights(id) on delete restrict,
  requested_at timestamptz not null default now(),
  fee_charged numeric(10, 2) not null check (fee_charged >= 0),
  constraint reschedules_flight_change_check check (old_flight_id <> new_flight_id)
);

create unique index bookings_one_confirmed_per_seat_idx
  on public.bookings(seat_id)
  where status = 'confirmed';

create index flights_search_idx on public.flights(origin, destination, departs_at);
create index seats_flight_idx on public.seats(flight_id);
create index bookings_user_idx on public.bookings(user_id, booked_at desc);
create index passengers_booking_idx on public.passengers(booking_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger seats_set_updated_at
before update on public.seats
for each row execute function public.set_updated_at();

create or replace function public.generate_pnr()
returns text
language plpgsql
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text := '';
  i integer;
begin
  for i in 1..6 loop
    code := code || substr(alphabet, floor(random() * length(alphabet) + 1)::integer, 1);
  end loop;
  return code;
end;
$$;

create or replace function public.prevent_late_cancellation()
returns trigger
language plpgsql
as $$
declare
  departure_time timestamptz;
begin
  if old.status = 'confirmed' and new.status = 'cancelled' then
    select departs_at into departure_time from public.flights where id = old.flight_id;

    if departure_time <= now() + interval '2 hours' then
      raise exception 'Bookings cannot be cancelled within 2 hours of departure'
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

create trigger bookings_prevent_late_cancellation
before update of status on public.bookings
for each row execute function public.prevent_late_cancellation();

alter table public.flights enable row level security;
alter table public.seats enable row level security;
alter table public.bookings enable row level security;
alter table public.passengers enable row level security;
alter table public.reschedules enable row level security;

create policy "Public can read searchable flights"
on public.flights for select
to anon, authenticated
using (true);

create policy "Public can read seats"
on public.seats for select
to anon, authenticated
using (true);

create policy "Users can read own bookings"
on public.bookings for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can read own passengers"
on public.passengers for select
to authenticated
using (
  exists (
    select 1 from public.bookings
    where bookings.id = passengers.booking_id
      and bookings.user_id = auth.uid()
  )
);

create policy "Users can read own reschedules"
on public.reschedules for select
to authenticated
using (
  exists (
    select 1 from public.bookings
    where bookings.id = reschedules.booking_id
      and bookings.user_id = auth.uid()
  )
);

alter publication supabase_realtime add table public.seats;
