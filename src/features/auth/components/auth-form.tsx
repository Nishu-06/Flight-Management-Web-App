"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlaneTakeoff } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authSchema, type AuthInput } from "@/lib/validations";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useToast } from "@/providers/toast-provider";
import { useUserStore } from "@/stores/use-user-store";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pushToast } = useToast();
  const setUser = useUserStore((state) => state.setUser);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AuthInput>({ resolver: zodResolver(authSchema) });

  async function onSubmit(values: AuthInput) {
    const supabase = createSupabaseBrowserClient();
    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword(values)
        : await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: { emailRedirectTo: `${window.location.origin}/` }
          });

    if (result.error) {
      pushToast(result.error.message, "error");
      return;
    }

    if (result.data.user) {
      setUser({ id: result.data.user.id, email: result.data.user.email ?? values.email });
    }

    pushToast(mode === "login" ? "Welcome back." : "Account created. Check email confirmation if enabled.");
    router.refresh();
    router.push((searchParams.get("redirectTo") ?? "/") as Route);
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-lg border bg-white p-6 shadow-panel">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-50 text-skyway">
          <PlaneTakeoff className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-ink">{mode === "login" ? "Login" : "Create account"}</h1>
          <p className="text-sm text-slate-600">Use Supabase Auth with persisted sessions.</p>
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <Input
          label="Password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Sign up"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        {mode === "login" ? "New here?" : "Already registered?"}{" "}
        <Link className="font-semibold text-skyway hover:underline" href={mode === "login" ? "/signup" : "/login"}>
          {mode === "login" ? "Create an account" : "Login"}
        </Link>
      </p>
    </section>
  );
}
