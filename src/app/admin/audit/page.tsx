import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { auditLogs } from "@/lib/data/mock";
import { formatDateTime } from "@/lib/utils";

export default function Page() {
  return (
    <div>
      <PageHeader title="Audit logs" subtitle="Operator actions on users, providers, credits, and commissions." />
      <Card className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((a) => (
              <tr key={a.id} className="border-b border-border/80">
                <td className="px-4 py-3 font-mono text-[11px] text-muted">{formatDateTime(a.at)}</td>
                <td className="px-4 py-3">{a.actor}</td>
                <td className="px-4 py-3">{a.action}</td>
                <td className="px-4 py-3 text-muted">{a.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
