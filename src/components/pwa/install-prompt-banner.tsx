"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const dismissedStorageKey = "aerodesk-install-banner-dismissed";

export function InstallPromptBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(dismissedStorageKey) === "true";

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      if (dismissed) {
        return;
      }
      setInstallEvent(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setIsVisible(false);
      setInstallEvent(null);
    }
  }

  function dismiss() {
    window.localStorage.setItem(dismissedStorageKey, "true");
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-3 shadow-panel sm:bottom-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal-50 text-skyway">
          <Download className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">Install AeroDesk</p>
          <p className="text-xs text-slate-600">Add the app to your device for faster access and offline booking history.</p>
        </div>
        <Button className="hidden sm:inline-flex" onClick={handleInstall}>
          Install
        </Button>
        <Button variant="ghost" className="h-9 w-9 shrink-0 p-0" onClick={dismiss} aria-label="Dismiss install prompt">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Button className="mt-3 w-full sm:hidden" onClick={handleInstall}>
        Install
      </Button>
    </div>
  );
}
