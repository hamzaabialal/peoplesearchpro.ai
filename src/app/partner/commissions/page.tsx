import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { commissions } from "@/lib/data/mock";
import { formatCurrency } from "@/lib/utils";

const tone: Record<string, string> = {
  pending: "warning",
  approved: "accent",
  payable: "success",
  paid: "muted",
};

export default function Page() {
  return (
    <div>
      <PageHeader title="Commissions" subtitle="Pending, approved, payable, and paid." />
      <Card className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Referral</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => (
              <tr key={c.id} className="border-b border-border/80">
                <td className="px-4 py-3 font-mono text-[12px]">{c.id}</td>
                <td className="px-4 py-3">{c.referral}</td>
                <td className="px-4 py-3 text-muted">{c.period}</td>
                <td className="px-4 py-3">{formatCurrency(c.amount)}</td>
                <td className="px-4 py-3">
                  <Badge tone={tone[c.status]}>{c.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
