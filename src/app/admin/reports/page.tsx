import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { InvestigationStatusBadge } from "@/components/ui/status";
import { adminReports } from "@/lib/data/mock";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Link from "next/link";

export default function Page() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="Costed dossier output across customers." />
      <Card className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
              <th className="px-4 py-3">Report ID</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Person</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sources</th>
              <th className="px-4 py-3">Processing</th>
              <th className="px-4 py-3">API cost</th>
              <th className="px-4 py-3">AI cost</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {adminReports.map((r) => (
              <tr key={r.id} className="border-b border-border/80 hover:bg-surface-2/50">
                <td className="px-4 py-3 font-mono text-[12px]">
                  <Link href={`/admin/reports/${r.id}`} className="text-accent-2">
                    {r.id}
                  </Link>
                </td>
                <td className="px-4 py-3">{r.user}</td>
                <td className="px-4 py-3">{r.person}</td>
                <td className="px-4 py-3">
                  <InvestigationStatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">{r.sources}</td>
                <td className="px-4 py-3 text-muted">{r.processingSeconds}s</td>
                <td className="px-4 py-3 tabular-nums">{formatCurrency(r.apiCost)}</td>
                <td className="px-4 py-3 tabular-nums">{formatCurrency(r.aiCost)}</td>
                <td className="px-4 py-3 tabular-nums">{formatCurrency(r.totalCost)}</td>
                <td className="px-4 py-3 text-muted">{formatDateTime(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
