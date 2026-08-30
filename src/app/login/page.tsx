"use client";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { AuthShell } from "@/layouts/auth";
import { authService } from "@/lib/services";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("alexandra.reyes@northline.example");
  const [password, setPassword] = useState("demo");
  const router = useRouter();

  return (
    <AuthShell title="Sign in" subtitle="Workspace access for operators.">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await authService.login(email, password);
          toast.success("Signed in");
          router.push("/app");
        }}
      >
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
