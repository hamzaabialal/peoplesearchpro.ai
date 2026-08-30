import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { systemLogs } from "@/lib/data/mock";
import { formatDateTime } from "@/lib/utils";

export default function Page() {
  return (
    <div>
      <PageHeader title="System logs" subtitle="Provider and pipeline messages. Stack traces are never shown." />
      <Card className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Message</th>
            </tr>
          </thead>
          <tbody>
            {systemLogs.map((l) => (
              <tr key={l.id} className="border-b border-border/80">
                <td className="px-4 py-3 font-mono text-[11px] text-muted">{formatDateTime(l.at)}</td>
                <td className="px-4 py-3">
                  <Badge tone={l.level === "error" ? "danger" : l.level === "warn" ? "warning" : "muted"}>
                    {l.level}
                  </Badge>
                </td>
                <td className="px-4 py-3">{l.provider ?? "—"}</td>
                <td className="px-4 py-3">{l.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
