import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { payouts } from "@/lib/data/mock";
import { formatCurrency } from "@/lib/utils";

export default function Page() {
  return (
    <div>
      <PageHeader title="Payouts" subtitle="Scheduled and completed transfers." />
      <Card className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Method</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id} className="border-b border-border/80">
                <td className="px-4 py-3 font-mono text-[12px]">{p.id}</td>
                <td className="px-4 py-3">{formatCurrency(p.amount)}</td>
                <td className="px-4 py-3">
                  <Badge tone={p.status === "paid" ? "success" : "accent"}>{p.status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted">{p.date}</td>
                <td className="px-4 py-3">{p.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
