import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { referrals } from "@/lib/data/mock";
import { formatCurrency } from "@/lib/utils";

export default function Page() {
  return (
    <div>
      <PageHeader
        title="Referrals"
        subtitle="Referred customers are shown as privacy-safe organization or role labels only."
      />
      <Card className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Signed up</th>
              <th className="px-4 py-3">Commission</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((r) => (
              <tr key={r.id} className="border-b border-border/80">
                <td className="px-4 py-3">{r.customer}</td>
                <td className="px-4 py-3">{r.plan}</td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="px-4 py-3 text-muted">{r.signedUpAt}</td>
                <td className="px-4 py-3">{formatCurrency(r.commission)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
