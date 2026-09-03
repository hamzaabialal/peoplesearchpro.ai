"use client";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { AuthShell } from "@/layouts/auth";
import { showErrorToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { validatePassword } from "@/lib/validation/login";
import { validateEmail } from "@/lib/validation/signup";
import { dashboardPath } from "@/lib/auth/roles";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const emailError = useMemo(() => validateEmail(email), [email]);
  const passwordError = useMemo(() => validatePassword(password), [password]);

  const isValid = !emailError && !passwordError;

  // Errors are hidden until the first submit attempt; after that, they stay
  // live so fields clear their errors in real time as the user fixes them.
  const showErrors = submitted;

  return (
    <AuthShell title="Sign in" subtitle="Email and password to access your account.">
      <form
        className="space-y-4"
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          setSubmitted(true);
          if (!isValid || isSubmitting) return;

          const formData = { email: email.trim(), password };

          setIsSubmitting(true);
          try {
            const res = await fetch("/api/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(formData),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
              showErrorToast(
                res.status === 401 ? "Invalid credentials" : "Sign in failed",
                data.error ?? "Something went wrong. Please try again.",
              );
              return;
            }

            toast.success("Signed in");
            const next = new URLSearchParams(window.location.search).get("next");
            const fallback = dashboardPath(data.user?.role);
            router.push(next && next.startsWith("/") ? next : fallback);
            router.refresh();
          } catch {
            showErrorToast(
              "Connection error",
              "Could not reach the server. Please check your connection and try again.",
            );
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <div>
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={showErrors && !!emailError}
            className={cn(showErrors && emailError && "border-danger focus:border-danger/60")}
          />
          {showErrors && emailError ? (
            <p className="mt-1.5 text-[12px] text-danger">{emailError}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              aria-invalid={showErrors && !!passwordError}
              className={cn(
                "pr-10",
                showErrors && passwordError && "border-danger focus:border-danger/60",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-text"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {showErrors && passwordError ? (
            <p className="mt-1.5 text-[12px] text-danger">{passwordError}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="mt-6 flex justify-between text-[13px] text-muted">
        <Link href="/forgot-password" className="hover:text-text">
          Forgot password
        </Link>
        <Link href="/signup" className="hover:text-text">
          Create account
        </Link>
      </div>
    </AuthShell>
  );
}
