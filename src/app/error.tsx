"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/page-shell";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <PageShell>
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-950">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 h-5 w-5" aria-hidden />
          <div className="space-y-3">
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            <p className="text-sm text-red-800">{error.message}</p>
            <Button type="button" onClick={reset} variant="secondary">
              <RotateCcw className="h-4 w-4" />
              Try again
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
