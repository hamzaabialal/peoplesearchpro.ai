"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Overview = {
  referralLink: string;
  refCode: string;
  clicks: number;
  signups: number;
  activeSubscriptions: number;
  conversions: number;
  pending: number;
  approved: number;
  paid: number;
};

export default function Page() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/partner/overview")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Failed to load");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div>
        <PageHeader title="User overview" />
        <p className="mt-8 text-[13px] text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="User overview"
        subtitle="Your referral link, signups, and commission — live for this account only."
      />

      <div className="mt-8">
        <h2 className="text-[13px] font-medium mb-4">Your referral link</h2>
        <Card className="flex flex-wrap items-center justify-between gap-3 p-5 mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint">Referral link</p>
            <p className="mt-1 font-mono text-[13px]">{data ? data.referralLink : "Loading…"}</p>
          </div>
          <Button
            variant="secondary"
            disabled={!data}
            onClick={() => {
              if (!data) return;
              navigator.clipboard.writeText(data.referralLink);
              toast.success("Copied");
            }}
          >
            Copy
          </Button>
        </Card>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Users signed up", data?.signups],
          ["Active subscriptions", data?.activeSubscriptions],
          ["Clicks", data?.clicks],
        ].map(([k, v]) => (
          <Card key={String(k)} className="p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint">{k}</p>
            <p className="mt-2 text-[20px] tabular-nums">{data ? v : "—"}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-[13px] font-medium mb-4">Commission Overview</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Clicks", data ? String(data.clicks) : "—"],
            ["Conversions", data ? String(data.conversions) : "—"],
            ["Pending commission", data ? formatCurrency(data.pending) : "—"],
            ["Approved commission", data ? formatCurrency(data.approved) : "—"],
            ["Paid commission", data ? formatCurrency(data.paid) : "—"],
          ].map(([k, v]) => (
            <Card key={String(k)} className="p-4">
              <p className="text-[11px] uppercase tracking-[0.12em] text-faint">{k}</p>
              <p className="mt-2 text-[20px] tabular-nums">{v}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
