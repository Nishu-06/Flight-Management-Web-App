import { Suspense } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { AuthForm } from "@/features/auth/components/auth-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function SignupPage() {
  return (
    <PageShell className="py-12">
      <Suspense fallback={<Skeleton className="mx-auto h-96 max-w-md" />}>
        <AuthForm mode="signup" />
      </Suspense>
    </PageShell>
  );
}
