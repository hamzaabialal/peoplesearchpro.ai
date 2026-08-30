"use client";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { AreaSeries, BarSeries, HorizontalBars } from "@/components/ui/charts";
import { formatCurrency } from "@/lib/utils";
import { adminOpsService } from "@/lib/services";
import { perReportCosts, providers } from "@/lib/data/mock";
import { useEffect, useState } from "react";

export function AdminOverview() {
  const [m, setM] = useState<Awaited<ReturnType<typeof adminOpsService.metrics>> | null>(null);

  useEffect(() => {
    adminOpsService.metrics().then(setM);
  }, []);

  if (!m) {
    return <div className="h-64 animate-pulse rounded-[12px] bg-surface" />;
  }

  const metrics = [
    { k: "Total users", v: String(m.totalUsers) },
    { k: "Active subscribers", v: String(m.activeSubscribers) },
    { k: "Reports today", v: String(m.reportsToday) },
    { k: "Reports this month", v: String(m.reportsMonth) },
    { k: "API spend", v: formatCurrency(m.apiSpend) },
    { k: "AI spend", v: formatCurrency(m.aiSpend) },
    { k: "Avg report cost", v: formatCurrency(m.avgReportCost) },
    { k: "MRR", v: formatCurrency(m.mrr) },
  ];

  return (
    <div>
      <PageHeader
        kicker="Operations"
        title="Overview"
        subtitle="Live control-center metrics for the demonstration environment."
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((x) => (
          <Card key={x.k} className="p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint">{x.k}</p>
            <p className="mt-2 text-[20px] tabular-nums">{x.v}</p>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-[13px] font-medium">Reports over time</h2>
          <AreaSeries data={m.series} x="month" y="reports" />
        </Card>
        <Card className="p-5">
          <h2 className="text-[13px] font-medium">Revenue</h2>
          <AreaSeries data={m.series} x="month" y="revenue" color="#3ddc97" />
        </Card>
        <Card className="p-5">
          <h2 className="text-[13px] font-medium">API spending</h2>
          <BarSeries data={m.series} x="month" y="api" />
        </Card>
        <Card className="p-5">
          <h2 className="text-[13px] font-medium">Cost per report</h2>
          <AreaSeries data={m.series} x="month" y="cost" color="#e8b84a" />
        </Card>
        <Card className="p-5">
          <h2 className="text-[13px] font-medium">Provider performance (requests today)</h2>
          <BarSeries
            data={providers.map((p) => ({ month: p.name.split(" ")[0], reports: p.requestsToday }))}
            x="month"
            y="reports"
          />
        </Card>
        <Card className="p-5">
          <h2 className="text-[13px] font-medium">Failed requests</h2>
          <BarSeries data={m.series} x="month" y="failed" color="#e85d5d" />
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-[13px] font-medium">Typical cost mix</h2>
          <div className="mt-4">
            <HorizontalBars data={perReportCosts} />
          </div>
        </Card>
      </div>
    </div>
  );
}
