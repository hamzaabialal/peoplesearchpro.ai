"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Page() {
  return (
    <div className="max-w-xl">
      <PageHeader title="Partner settings" subtitle="Payout destination and tax profile." />
      <Card className="mt-8 space-y-4 p-5">
        <Field label="Display name">
          <Input defaultValue="Northline Partner Desk" />
        </Field>
        <Field label="Payout method">
          <Input defaultValue="ACH •• 1193" readOnly />
        </Field>
        <p className="text-[12px] text-faint">Bank details are stored by the payout processor, not in this UI.</p>
        <Button onClick={() => toast.success("Partner settings saved (demo)")}>Save</Button>
      </Card>
    </div>
  );
}
