"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Settings = {
  name: string;
  email: string;
  payoutMethod: string | null;
  referralLink: string;
  refCode: string;
};

export default function Page() {
  const [data, setData] = useState<Settings | null>(null);
  const [name, setName] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/partner/settings")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Failed to load");
        return r.json();
      })
      .then((d: Settings) => {
        setData(d);
        setName(d.name);
        setPayoutMethod(d.payoutMethod ?? "");
      })
      .catch((e) => setError(e.message));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/partner/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, payoutMethod }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed to save");
      const updated: Settings = await res.json();
      setData(updated);
      toast.success("User settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-xl">
        <PageHeader title="User settings" />
        <p className="mt-8 text-[13px] text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <PageHeader title="User settings" subtitle="Display name and payout destination for this account." />
      <Card className="mt-8 space-y-4 p-5">
        <Field label="Display name">
          <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!data} />
        </Field>
        <Field label="Payout method">
          <Input
            value={payoutMethod}
            onChange={(e) => setPayoutMethod(e.target.value)}
            placeholder="e.g. ACH •• 1193"
            disabled={!data}
          />
        </Field>
        <p className="text-[12px] text-faint">Bank details are stored by the payout processor, not in this UI.</p>
        <Button onClick={save} disabled={!data || saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </Card>
    </div>
  );
}
