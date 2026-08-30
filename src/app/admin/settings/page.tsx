"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Page() {
  return (
    <div className="max-w-xl">
      <PageHeader title="Admin settings" subtitle="Organization, retention, and support contacts." />
      <Card className="mt-8 space-y-4 p-5">
        <Field label="Organization">
          <Input defaultValue="PeopleSearch Pro" />
        </Field>
        <Field label="Support email">
          <Input defaultValue="support@peoplesearchpro.ai" />
        </Field>
        <Field label="Log retention (days)">
          <Input defaultValue="90" />
        </Field>
        <Button onClick={() => toast.success("Admin settings saved (demo)")}>Save</Button>
      </Card>
    </div>
  );
}
