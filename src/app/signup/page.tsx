"use client";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { AuthShell } from "@/layouts/auth";
import { authService } from "@/lib/services";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  return (
    <AuthShell title="Create account" subtitle="Name, work email, and a password.">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await authService.signup(name, email, password);
          router.push("/onboarding");
        }}
      >
        <Field label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Password">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <Button type="submit" className="w-full">
          Continue
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
