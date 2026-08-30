"use client";

import { Button } from "@/components/ui/button";
import { AuthShell } from "@/layouts/auth";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

const options = ["Business", "Research", "Recruiting", "Compliance", "Other"] as const;

export default function Page() {
  const [choice, setChoice] = useState<string>("Business");
  const router = useRouter();

  return (
    <AuthShell
      title="What will you use the platform for?"
      subtitle="One choice. You can change this later in settings."
    >
      <div className="space-y-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setChoice(o)}
            className={cn(
              "w-full rounded-[10px] border px-4 py-3 text-left text-[14px]",
              choice === o ? "border-accent/50 bg-accent-dim" : "border-border hover:bg-surface-2",
            )}
          >
            {o}
          </button>
        ))}
      </div>
      <Button className="mt-6 w-full" onClick={() => router.push("/verify-email")}>
        Continue
      </Button>
    </AuthShell>
  );
}
