"use client";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AuthShell } from "@/layouts/auth";
import { cn } from "@/lib/utils";
import {
  passwordStrength,
  validateEmail,
  validateName,
  validatePassword,
  validateRole,
  type SignupRole,
} from "@/lib/validation/signup";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { dashboardPath } from "@/lib/auth/roles";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const strengthStyles: Record<"Weak" | "Medium" | "Strong", { bar: string; text: string }> = {
  Weak: { bar: "bg-danger", text: "text-danger" },
  Medium: { bar: "bg-warning", text: "text-warning" },
  Strong: { bar: "bg-success", text: "text-success" },
};

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<SignupRole | "">("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refCode, setRefCode] = useState<string | null>(null);
  const clickLogged = useRef(false);
  const router = useRouter();

  // Referral tracking: if this signup page was opened via a partner/affiliate
  // link (?ref=PSP-XXXXX), log the click once and carry the code through to
  // the signup submission so the referring account gets credited.
  // clickLogged guards against React StrictMode's dev-only double-invoke of
  // effects (which would otherwise log two clicks for one real page visit).
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref) return;
    setRefCode(ref);
    if (clickLogged.current) return;
    clickLogged.current = true;
    fetch("/api/referral/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref }),
    }).catch(() => {});
  }, []);

  const nameError = useMemo(() => validateName(name), [name]);
  const emailError = useMemo(() => validateEmail(email), [email]);
  const passwordError = useMemo(() => validatePassword(password), [password]);
  const roleError = useMemo(() => validateRole(role), [role]);
  const strength = useMemo(() => passwordStrength(password), [password]);

  const isValid = !nameError && !emailError && !passwordError && !roleError;

  // Errors are hidden until the first submit attempt; after that, they stay
  // live so fields clear their errors in real time as the user fixes them.
  const showErrors = submitted;

  return (
    <AuthShell title="Create account" subtitle="Name, email, password, and your account type.">
      <form
        className="space-y-4"
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          setSubmitted(true);
          if (!isValid || isSubmitting) return;

          const formData = {
            name: name.trim(),
            email: email.trim(),
            password,
            role,
            ref: refCode ?? undefined,
          };

          setIsSubmitting(true);
          try {
            const res = await fetch("/api/signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(formData),
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
              showErrorToast(
                res.status === 409 ? "Account already exists" : "Sign up failed",
                data.error ?? "Something went wrong. Please try again.",
              );
              return;
            }

            showSuccessToast("Account created", "Welcome to PeopleSearch Pro — redirecting you now.");
            router.push(dashboardPath(data.user?.role));
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
          <Label htmlFor="signup-name">Full Name</Label>
          <Input
            id="signup-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            aria-invalid={showErrors && !!nameError}
            className={cn(showErrors && nameError && "border-danger focus:border-danger/60")}
          />
          {showErrors && nameError ? (
            <p className="mt-1.5 text-[12px] text-danger">{nameError}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
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
          <Label htmlFor="signup-password">Password</Label>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
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

          {password ? (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                <div
                  className={cn("h-full rounded-full transition-all", strengthStyles[strength.label].bar)}
                  style={{ width: `${Math.min(100, (strength.score / 6) * 100)}%` }}
                />
              </div>
              <span className={cn("text-[11px] font-medium", strengthStyles[strength.label].text)}>
                {strength.label}
              </span>
            </div>
          ) : null}

          {showErrors && passwordError ? (
            <p className="mt-1.5 text-[12px] text-danger">{passwordError}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="signup-role">Role</Label>
          <Select
            id="signup-role"
            value={role}
            onChange={(e) => setRole(e.target.value as SignupRole)}
            aria-invalid={showErrors && !!roleError}
            className={cn(showErrors && roleError && "border-danger focus:border-danger/60")}
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="customer">Customer</option>
            <option value="partner">Partner / Affiliate</option>
          </Select>
          {showErrors && roleError ? (
            <p className="mt-1.5 text-[12px] text-danger">{roleError}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Sign up"}
        </Button>
      </form>
      <p className="mt-6 text-[13px] text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-text">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
