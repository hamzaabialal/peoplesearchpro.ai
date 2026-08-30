import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { affiliateStats, commissions, referrals } from "@/lib/data/mock";
import { formatCurrency } from "@/lib/utils";

export default function Page() {
  return (
    <div>
      <PageHeader title="Affiliates" subtitle="Partner performance. Referred customers are privacy-safe labels only." />
      <div className="mt-8 grid gap-3 sm:grid-cols-4">
        {[
          ["Clicks", affiliateStats.clicks],
          ["Signups", affiliateStats.signups],
          ["Conversions", affiliateStats.conversions],
          ["Active subscribers", affiliateStats.activeSubscribers],
        ].map(([k, v]) => (
          <Card key={String(k)} className="p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint">{k}</p>
            <p className="mt-2 text-[20px]">{v}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
              <th className="px-4 py-3">Referral</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Commission</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((r) => (
              <tr key={r.id} className="border-b border-border/80">
                <td className="px-4 py-3">{r.customer}</td>
                <td className="px-4 py-3">{r.plan}</td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3">{formatCurrency(r.commission)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="mt-4 flex flex-wrap gap-2">
        {commissions.map((c) => (
          <Badge key={c.id} tone={c.status === "paid" ? "success" : c.status === "pending" ? "warning" : "accent"}>
            {c.id} {c.status}
          </Badge>
        ))}
      </div>
    </div>
  );
}
