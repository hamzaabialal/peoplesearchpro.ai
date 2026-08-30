"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { currentUser } from "@/lib/data/mock";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [name, setName] = useState(currentUser.name);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" subtitle="Workspace profile and preferences." />
      <Card className="mt-8 p-5">
        <h2 className="text-[14px] font-medium">Profile</h2>
        <div className="mt-4 space-y-4">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={currentUser.email} readOnly />
          </Field>
          <Button onClick={() => toast.success("Settings saved (demo)")}>Save</Button>
        </div>
      </Card>
      <Card className="mt-4 p-5">
        <h2 className="text-[14px] font-medium">Notifications</h2>
        <p className="mt-2 text-[13px] text-muted">
          Report completed, credits low, payment failed, and subscription renewal are enabled.
        </p>
      </Card>
      <Card className="mt-4 p-5">
        <h2 className="text-[14px] font-medium">Use case</h2>
        <p className="mt-2 text-[13px] text-muted">Recorded at onboarding: Business.</p>
      </Card>
      <Card className="mt-4 p-5">
        <h2 className="text-[14px] font-medium">Demo: report credits</h2>
        <p className="mt-2 text-[13px] text-muted">
          Simulate an exhausted credit balance to preview the upgrade modal.
        </p>
        <Button
          className="mt-4"
          variant="secondary"
          onClick={() => {
            const next = localStorage.getItem("psp-zero-credits") === "1" ? "0" : "1";
            localStorage.setItem("psp-zero-credits", next);
            toast.success(
              next === "1" ? "Next investigation will show the credits modal" : "Credits restored for demo",
            );
            window.location.reload();
          }}
        >
          Toggle exhausted credits
        </Button>
      </Card>
    </div>
  );
}
