import Link from "next/link";
import { Plane, TicketCheck } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

export async function SiteHeader() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-skyway text-white shadow-sm shadow-teal-900/20">
            <Plane className="h-5 w-5" aria-hidden />
          </span>
          <span className="tracking-tight">AeroDesk</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/my-bookings"
            className="inline-flex h-10 items-center gap-2 rounded-md px-3 font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            <TicketCheck className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">My bookings</span>
          </Link>
          {user ? (
            <SignOutButton />
          ) : (
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-md bg-skyway px-4 text-sm font-semibold text-white shadow-sm shadow-teal-900/20 transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
