insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
)
values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-4111-8111-111111111111',
  'authenticated',
  'authenticated',
  'test.traveller@aerodesk.dev',
  crypt('Flight@12345', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Test Traveller"}'::jsonb,
  false
)
on conflict (id) do update
set encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at,
    updated_at = now();

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values (
  '11111111-1111-4111-8111-111111111111',
  '11111111-1111-4111-8111-111111111111',
  'test.traveller@aerodesk.dev',
  jsonb_build_object(
    'sub', '11111111-1111-4111-8111-111111111111',
    'email', 'test.traveller@aerodesk.dev',
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  now(),
  now(),
  now()
)
on conflict (provider, provider_id) do nothing;

insert into public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
values
  ('SA101', 'Delhi', 'Mumbai', now() + interval '1 day 3 hours', now() + interval '1 day 5 hours 10 minutes', 'Airbus A320', 'scheduled', 5200),
  ('SA102', 'Mumbai', 'Delhi', now() + interval '1 day 7 hours', now() + interval '1 day 9 hours 15 minutes', 'Airbus A320', 'scheduled', 5100),
  ('SA201', 'Bengaluru', 'Hyderabad', now() + interval '2 days 2 hours', now() + interval '2 days 3 hours 20 minutes', 'Boeing 737', 'scheduled', 3900),
  ('SA202', 'Hyderabad', 'Bengaluru', now() + interval '2 days 6 hours', now() + interval '2 days 7 hours 15 minutes', 'Boeing 737', 'scheduled', 3800),
  ('SA301', 'Chennai', 'Kolkata', now() + interval '3 days 4 hours', now() + interval '3 days 6 hours 35 minutes', 'Airbus A321', 'scheduled', 6100),
  ('SA302', 'Kolkata', 'Chennai', now() + interval '3 days 8 hours', now() + interval '3 days 10 hours 30 minutes', 'Airbus A321', 'scheduled', 6000),
  ('SA401', 'Pune', 'Goa', now() + interval '4 days 5 hours', now() + interval '4 days 6 hours 5 minutes', 'ATR 72', 'scheduled', 3400),
  ('SA402', 'Goa', 'Pune', now() + interval '4 days 9 hours', now() + interval '4 days 10 hours 10 minutes', 'ATR 72', 'scheduled', 3500)
on conflict (flight_no) do nothing;

with flight_rows as (
  select id from public.flights
),
first_rows as (
  select f.id as flight_id, r.row_no, l.letter
  from flight_rows f
  cross join generate_series(1, 2) as r(row_no)
  cross join unnest(array['A', 'C', 'D', 'F']) as l(letter)
),
business_rows as (
  select f.id as flight_id, r.row_no, l.letter
  from flight_rows f
  cross join generate_series(3, 6) as r(row_no)
  cross join unnest(array['A', 'B', 'C', 'D', 'E', 'F']) as l(letter)
),
economy_rows as (
  select f.id as flight_id, r.row_no, l.letter
  from flight_rows f
  cross join generate_series(7, 28) as r(row_no)
  cross join unnest(array['A', 'B', 'C', 'D', 'E', 'F']) as l(letter)
),
all_seats as (
  select flight_id, row_no || letter as seat_number, 'first'::public.seat_class as class, 7000::numeric as extra_fee from first_rows
  union all
  select flight_id, row_no || letter as seat_number, 'business'::public.seat_class as class, 3500::numeric as extra_fee from business_rows
  union all
  select flight_id, row_no || letter as seat_number, 'economy'::public.seat_class as class, 0::numeric as extra_fee from economy_rows
)
insert into public.seats (flight_id, seat_number, class, extra_fee)
select flight_id, seat_number, class, extra_fee
from all_seats
on conflict (flight_id, seat_number) do nothing;
