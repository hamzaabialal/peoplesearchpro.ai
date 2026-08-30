"use client";

import { Button } from "@/components/ui/button";
import { AuthShell } from "@/layouts/auth";
import { authService } from "@/lib/services";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const [ok, setOk] = useState(false);
  const router = useRouter();

  return (
    <AuthShell title="Email verification" subtitle="Confirm the address used for this workspace.">
      {ok ? (
        <p className="text-[13px] text-muted">Address verified. You can continue to the workspace.</p>
      ) : (
        <Button
          className="w-full"
          onClick={async () => {
            await authService.verifyEmail("demo");
            setOk(true);
          }}
        >
          Verify email (demo)
        </Button>
      )}
      {ok ? (
        <Button className="mt-4 w-full" onClick={() => router.push("/app")}>
          Open workspace
        </Button>
      ) : null}
    </AuthShell>
  );
}
