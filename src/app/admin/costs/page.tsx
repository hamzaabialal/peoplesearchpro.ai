import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { BarSeries, HorizontalBars } from "@/components/ui/charts";
import { costTotals, perReportCosts, reportsOverTime } from "@/lib/data/mock";
import { formatCurrency } from "@/lib/utils";

export default function Page() {
  return (
    <div>
      <PageHeader
        title="Costs"
        subtitle="Unit economics: API, AI, search, social, and breach spend versus revenue."
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {costTotals.map((c) => (
          <Card key={c.label} className="p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint">{c.label}</p>
            <p className="mt-2 text-[20px] tabular-nums">{formatCurrency(c.amount)}</p>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-[13px] font-medium">Cost per report (typical mix)</h2>
          <div className="mt-4">
            <HorizontalBars data={perReportCosts} />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-[13px] font-medium">API spend over time</h2>
          <BarSeries data={reportsOverTime} x="month" y="api" />
        </Card>
      </div>
    </div>
  );
}
