"use client";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { AuthShell } from "@/layouts/auth";
import { authService } from "@/lib/services";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  return (
    <AuthShell title="Reset password" subtitle="Choose a new password for this workspace.">
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await authService.resetPassword("demo", password);
          toast.success("Password updated");
          router.push("/login");
        }}
      >
        <Field label="New password">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <Button type="submit" className="w-full">
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}
