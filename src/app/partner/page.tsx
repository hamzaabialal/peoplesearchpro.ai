"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { affiliateStats } from "@/lib/data/mock";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const link = "https://peoplesearchpro.ai/signup?ref=PSP-REYES";

export default function Page() {
  return (
    <div>
      <PageHeader
        title="Partner overview"
        subtitle="Referral economics for this demonstration partner account."
      />
      <Card className="mt-8 flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-faint">Referral link</p>
          <p className="mt-1 font-mono text-[13px]">{link}</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            navigator.clipboard.writeText(link);
            toast.success("Copied");
          }}
        >
          Copy
        </Button>
      </Card>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Clicks", affiliateStats.clicks],
          ["Signups", affiliateStats.signups],
          ["Conversions", affiliateStats.conversions],
          ["Active subscribers", affiliateStats.activeSubscribers],
          ["Pending commission", formatCurrency(affiliateStats.pending)],
          ["Approved commission", formatCurrency(affiliateStats.approved)],
          ["Paid commission", formatCurrency(affiliateStats.paid)],
        ].map(([k, v]) => (
          <Card key={String(k)} className="p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint">{k}</p>
            <p className="mt-2 text-[20px] tabular-nums">{v}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
