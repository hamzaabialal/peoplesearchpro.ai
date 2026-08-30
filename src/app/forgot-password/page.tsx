"use client";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { AuthShell } from "@/layouts/auth";
import { authService } from "@/lib/services";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <AuthShell title="Forgot password" subtitle="We’ll send a reset link to your email.">
      {sent ? (
        <p className="text-[13px] text-muted">
          If an account exists for that address, a reset message is on its way. Demo: use
          any token on the reset page.
        </p>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await authService.requestReset(email);
            setSent(true);
            toast.success("Reset requested");
          }}
        >
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>
      )}
      <Link href="/login" className="mt-6 inline-block text-[13px] text-muted">
        Back to sign in
      </Link>
    </AuthShell>
  );
}
