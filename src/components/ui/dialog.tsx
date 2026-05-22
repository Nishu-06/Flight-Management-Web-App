"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/50 p-3 sm:items-center sm:justify-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={cn("w-full max-w-lg rounded-lg bg-white p-5 shadow-panel")}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="dialog-title" className="text-lg font-semibold text-ink">
            {title}
          </h2>
          <Button variant="ghost" className="h-9 w-9 p-0" onClick={onClose} aria-label="Close dialog">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4">{children}</div>
      </section>
    </div>
  );
}
