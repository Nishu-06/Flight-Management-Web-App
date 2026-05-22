"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useFlightStore } from "@/stores/use-flight-store";
import { useUserStore } from "@/stores/use-user-store";

export function SignOutButton() {
  const router = useRouter();
  const resetUser = useUserStore((state) => state.resetUser);
  const resetBookingFlow = useFlightStore((state) => state.resetBookingFlow);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    resetUser();
    resetBookingFlow();
    router.refresh();
    router.push("/");
  }

  return (
    <Button variant="ghost" onClick={handleSignOut}>
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Logout</span>
    </Button>
  );
}
