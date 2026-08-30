import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { AreaSeries, BarSeries } from "@/components/ui/charts";
import { providers, reportsOverTime } from "@/lib/data/mock";
import { formatCurrency } from "@/lib/utils";

export default function Page() {
  return (
    <div>
      <PageHeader title="API usage" subtitle="Request volume, error rates, and provider performance." />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-[13px]">Requests (proxy via reports)</h2>
          <AreaSeries data={reportsOverTime} x="month" y="reports" />
        </Card>
        <Card className="p-5">
          <h2 className="text-[13px]">Failed requests</h2>
          <BarSeries data={reportsOverTime} x="month" y="failed" color="#e85d5d" />
        </Card>
      </div>
      <Card className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Requests today</th>
              <th className="px-4 py-3">Error rate</th>
              <th className="px-4 py-3">Monthly cost</th>
              <th className="px-4 py-3">Utilization</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id} className="border-b border-border/80">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">{p.requestsToday}</td>
                <td className="px-4 py-3">{p.errorRate}%</td>
                <td className="px-4 py-3">{formatCurrency(p.monthlyCost)}</td>
                <td className="px-4 py-3 text-muted">
                  {Math.round((p.requestsToday / p.dailyLimit) * 100)}% of daily limit
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
