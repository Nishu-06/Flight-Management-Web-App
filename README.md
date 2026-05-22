# AeroDesk Flight Management Web App

A production-oriented Flight Management Web App built for the Source Asia frontend internship assignment. It uses Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/Postgres/RLS/RPC, Supabase Realtime, Zustand persistence, React Hook Form, Zod, and PWA support.

## Features

- Supabase email/password authentication with protected routes and session persistence.
- Flight search by origin, destination, date, and passenger count.
- Responsive flight results and aircraft seat map with first, business, and economy zones.
- Realtime seat updates through Supabase Realtime subscriptions.
- Optimistic seat state while the booking RPC locks the selected seat.
- Passenger details form with Zod validation. Passport data is not stored in Zustand.
- Atomic booking, cancellation, and rescheduling RPCs.
- RLS policies so users only read their own bookings, passengers, and reschedules.
- DB-level cancellation guard blocking cancellations within 2 hours of departure.
- PWA manifest and service worker configuration with API/image cache strategies.

## Tech Decisions

Next.js App Router is used because it supports server components, route-level loading/error boundaries, middleware, and clean protected route composition. Client components are only used where browser state, forms, realtime subscriptions, or interactive seat selection are required.

Supabase RPC functions own the critical booking mutations because seat locking, cancellation, and rescheduling must be atomic. The UI can be optimistic, but the database remains the source of truth and prevents double booking with row locks plus a partial unique index.

Zustand persists only non-sensitive booking progress: search query, selected flight, selected seat, and booking step. Sensitive passenger fields, especially passport numbers, remain local to the React Hook Form instance and are sent only during booking.

The PWA integration uses `@ducanh2912/next-pwa`, a maintained Next.js-compatible successor in the `next-pwa` ecosystem. The generated `public/sw.js` and `public/workbox-*.js` files are build artifacts and are intentionally ignored.

## Getting Started

Install dependencies:

```bash
corepack pnpm install --ignore-scripts
```

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Run the development server:

```bash
corepack pnpm dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Create a Supabase project.
2. Apply migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_booking_rpcs.sql`
3. Run `supabase/seed.sql` to create 8 flights across 4 routes with full seat maps.
4. Enable email/password Auth in Supabase.
5. Ensure Realtime is enabled for the `seats` table. The migration also adds it to `supabase_realtime`.

Seeded test login:

```text
Email: test.traveller@aerodesk.dev
Password: Flight@12345
```

If your hosted Supabase project rejects direct writes to `auth.identities`, create the same user from **Authentication → Users → Add user** with the credentials above, then run the public table seed normally.

## Project Structure

```text
src/
  app/          App Router pages, loading, error, offline route
  components/   Shared layout and UI primitives
  features/     Auth, flights, seats, and bookings feature modules
  hooks/        Realtime React hooks
  lib/          Env validation, Supabase clients, validation schemas
  providers/    Toast/app providers
  services/     Supabase query and RPC service functions
  stores/       Zustand stores with persist partialize
  types/        Domain and database TypeScript types
```

## Zustand Store Structure

`src/stores/use-flight-store.ts` owns the booking workflow state:

- persisted: search query, selected flight, selected seat, booking step
- not persisted: optimistic seat locks after refresh, passenger names, passport numbers, date of birth
- reset action: `resetBookingFlow()` clears the full booking flow after sign out or successful booking

`src/stores/use-user-store.ts` owns a minimal user profile:

- persisted: user id and email only
- reset action: `resetUser()` clears client state after sign out

Both stores use Zustand `persist` with `partialize`, so local storage contains only state that improves UX without storing sensitive passenger data.

## Evaluation Checklist

- Schema & RLS: complete in `supabase/migrations/001_initial_schema.sql`.
- Seat-locking RPC: complete in `supabase/migrations/002_booking_rpcs.sql` using row locks and a partial unique index.
- Seat map UX: complete in `src/features/seats/components/seat-map.tsx`.
- Realtime sync: complete in `src/hooks/use-seat-realtime.ts`.
- Cancel and reschedule logic: complete in `cancel_booking` and `reschedule_booking` RPCs.
- 2-hour cancellation rule: enforced in both the DB trigger and cancellation RPC.
- Zustand persistence: complete in `src/stores`.
- Responsive UI: implemented with mobile-first Tailwind layouts.
- TypeScript: strict mode enabled, no `any` used in application code.
- PWA: manifest and service-worker generation configured.
- Install prompt: first-time install banner implemented in `src/components/pwa/install-prompt-banner.tsx`.

## Submission Checklist

- [x] `.env.example` lists Supabase public environment variables.
- [x] Supabase migration SQL files are in `supabase/migrations`.
- [x] Seed script includes flights, seats, and a test user account.
- [x] README includes setup, Supabase config, architecture decisions, and Zustand explanation.
- [x] PWA setup is included.
- [x] Install prompt banner for first-time visitors.
- [ ] Public GitHub repository with descriptive commit history.
- [ ] Deployed Vercel production URL.
- [ ] Lighthouse PWA screenshot in README.

## Lighthouse PWA Screenshot

After deploying or running a production build locally, capture a Lighthouse PWA audit screenshot and place it here before submission. Target score: 90 or higher.

Suggested command:

```bash
corepack pnpm build
corepack pnpm start
```

Then open Chrome DevTools → Lighthouse → PWA → Analyze page load.

## Verification

These commands passed locally:

```bash
.\node_modules\.bin\tsc.cmd --noEmit
```

```bash
$env:NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co'
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY='test-anon-key'
$env:NEXT_PUBLIC_SITE_URL='http://localhost:3000'
.\node_modules\.bin\next.cmd build
```

The build generated the PWA service worker successfully. Real Supabase credentials are required for runtime auth, search, booking, realtime updates, cancellation, and rescheduling.

## Common Mistakes

- Do not expose Supabase service role keys in Next.js public env vars.
- Do not perform booking by direct client inserts into `bookings`; use `book_seat`.
- Do not trust optimistic UI as final state; realtime events and RPC responses must reconcile state.
- Do not persist passport numbers or passenger personal details in local storage.
- Do not implement cancellation only in the UI. The database trigger and RPC enforce the 2-hour rule.

## Deployment

Deploy to Vercel, set the same public Supabase env vars, and run the Supabase migrations/seed before testing. PWA generation happens during `next build`; generated service-worker files should not be committed.

## Trade-offs

Payment handling, admin flight management, and email ticket delivery are outside the assignment scope. Rescheduling is implemented as a protected route and atomic RPC, but a production airline workflow would normally include fare rules, inventory classes, payment collection for fees, and audit logging.
