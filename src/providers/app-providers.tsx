"use client";

import { ToastProvider } from "@/providers/toast-provider";
import { InstallPromptBanner } from "@/components/pwa/install-prompt-banner";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <InstallPromptBanner />
    </ToastProvider>
  );
}
