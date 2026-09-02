"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { affiliateStats, partnerStats } from "@/lib/data/mock";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const link = "https://peoplesearchpro.ai/signup?ref=PSP-REYES";

export default function Page() {
  return (
    <div>
      <PageHeader
        title="Partner overview"
        subtitle="Referral economics and partnership metrics for this demonstration partner account."
      />
      
      <div className="mt-8">
        <h2 className="text-[13px] font-medium mb-4">Partnership Summary</h2>
        <Card className="flex flex-wrap items-center justify-between gap-3 p-5 mb-6">
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
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Colleagues/Partners", partnerStats.colleagues],
          ["Users signed up", affiliateStats.signups],
          ["Active subscriptions", affiliateStats.activeSubscribers],
        ].map(([k, v]) => (
          <Card key={String(k)} className="p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint">{k}</p>
            <p className="mt-2 text-[20px] tabular-nums">{v}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <h2 className="text-[13px] font-medium mb-4">Commission Overview</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Clicks", affiliateStats.clicks],
            ["Conversions", affiliateStats.conversions],
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
    </div>
  );
}
