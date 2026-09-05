"use client";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

type Campaign = {
  id: string;
  name: string;
  code: string;
  link: string;
  clicks: number;
  conversions: number;
  active: boolean;
};

export default function Page() {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/partner/campaigns")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Failed to load");
        return r.json();
      })
      .then((d) => setCampaigns(d.campaigns))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <PageHeader title="Campaigns" subtitle="Your tracked referral link and its performance." />
      {error ? (
        <p className="mt-8 text-[13px] text-danger">{error}</p>
      ) : (
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {campaigns === null ? (
            <Card className="p-5 text-[13px] text-muted">Loading…</Card>
          ) : (
            campaigns.map((c) => (
              <Card key={c.id} className="p-5">
                <div className="flex justify-between">
                  <h2 className="text-[15px]">{c.name}</h2>
                  <Badge tone={c.active ? "success" : "muted"}>{c.active ? "Active" : "Off"}</Badge>
                </div>
                <p className="mt-2 font-mono text-[12px] text-muted">{c.code}</p>
                <p className="mt-4 text-[13px]">
                  {c.clicks} clicks · {c.conversions} conversions
                </p>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
