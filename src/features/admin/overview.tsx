"use client";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { AreaSeries, BarSeries, HorizontalBars } from "@/components/ui/charts";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useEffect, useState } from "react";

type Overview = {
  totals: {
    users: number;
    activeSubscribers: number;
    pastDue: number;
    canceled: number;
    mrr: number;
    reports: number;
    reportsThisMonth: number;
    reportsToday: number;
    invoicedTotal: number;
    invoicedThisMonth: number;
  };
  revenueByMonth: { month: string; revenue: number }[];
  signupsByMonth: { month: string; signups: number }[];
  byPlan: { label: string; amount: number }[];
  byStatus: { label: string; amount: number }[];
  integrations: {
    costTracking: { connected: boolean };
    providers: { name: string; requestsToday: number; errorRate: number }[];
  };
  apiSpend: number | null;
  aiSpend: number | null;
  avgReportCost: number | null;
  costByMonth: { month: string; api: number; cost: number }[];
  failedByMonth: { month: string; failed: number }[];
  costMix: { label: string; amount: number }[];
};

export function AdminOverview() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Failed to load");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div>
        <PageHeader kicker="Operations" title="Overview" />
        <p className="mt-8 text-[13px] text-danger">{error}</p>
      </div>
    );
  }

  if (!data) {
    return <div className="mt-8 h-64 animate-pulse rounded-[12px] bg-surface" />;
  }

  const t = data.totals;
  const costOn = data.integrations.costTracking.connected;
  const hasProviders = data.integrations.providers.length > 0;

  const tiles = [
    { k: "Total users", v: formatNumber(t.users) },
    { k: "Active subscribers", v: formatNumber(t.activeSubscribers) },
    { k: "Past due", v: formatNumber(t.pastDue) },
    { k: "Canceled", v: formatNumber(t.canceled) },
    { k: "MRR", v: formatCurrency(t.mrr) },
    { k: "Invoiced (all time)", v: formatCurrency(t.invoicedTotal) },
    { k: "Invoiced this month", v: formatCurrency(t.invoicedThisMonth) },
    { k: "Reports", v: formatNumber(t.reports) },
  ];

  const costTiles = [
    { k: "API spend", v: data.apiSpend, on: costOn },
    { k: "AI spend", v: data.aiSpend, on: costOn },
    { k: "Avg report cost", v: data.avgReportCost, on: costOn },
  ];

  return (
    <div>
      <PageHeader
        kicker="Operations"
        title="Overview"
        subtitle="Live from the database."
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((x) => (
          <Card key={x.k} className="p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint">{x.k}</p>
            <p className="mt-2 text-[20px] tabular-nums">{x.v}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-[13px] font-medium">Revenue by month</h2>
          <p className="mt-0.5 text-[11px] text-muted">Paid invoices, last 6 months</p>
          <AreaSeries data={data.revenueByMonth} x="month" y="revenue" color="#3ddc97" />
        </Card>
        <Card className="p-5">
          <h2 className="text-[13px] font-medium">New signups by month</h2>
          <p className="mt-0.5 text-[11px] text-muted">Last 6 months</p>
          <BarSeries data={data.signupsByMonth} x="month" y="signups" />
        </Card>
        <Card className="p-5">
          <h2 className="text-[13px] font-medium">Subscriptions by plan</h2>
          <div className="mt-4">
            {data.byPlan.length ? (
              <HorizontalBars data={data.byPlan} />
            ) : (
              <p className="text-[12px] text-muted">No subscriptions yet.</p>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-[13px] font-medium">Subscriptions by status</h2>
          <div className="mt-4">
            {data.byStatus.length ? (
              <HorizontalBars data={data.byStatus} />
            ) : (
              <p className="text-[12px] text-muted">No subscriptions yet.</p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-10 flex items-end justify-between">
        <div>
          <h2 className="text-[15px] font-medium">Cost &amp; providers</h2>
          <p className="mt-0.5 text-[12px] text-muted">
            Populates once a data provider is connected and per-report cost
            tracking is recorded.
          </p>
        </div>
        <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] text-muted">
          {costOn || hasProviders ? "Partially connected" : "Not connected"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {costTiles.map((x) => (
          <Card key={x.k} className="p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint">{x.k}</p>
            {x.on && x.v != null ? (
              <p className="mt-2 text-[20px] tabular-nums">{formatCurrency(x.v)}</p>
            ) : (
              <p className="mt-2 text-[13px] text-faint">No API connected</p>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-[13px] font-medium">API spending by month</h3>
          {costOn ? (
            <BarSeries data={data.costByMonth} x="month" y="api" />
          ) : (
            <Unavailable label="No cost tracking connected" />
          )}
        </Card>
        <Card className="p-5">
          <h3 className="text-[13px] font-medium">Cost per report</h3>
          {costOn ? (
            <AreaSeries data={data.costByMonth} x="month" y="cost" color="#e8b84a" />
          ) : (
            <Unavailable label="No cost tracking connected" />
          )}
        </Card>
        <Card className="p-5">
          <h3 className="text-[13px] font-medium">Provider performance (requests today)</h3>
          {hasProviders ? (
            <BarSeries
              data={data.integrations.providers.map((p) => ({
                month: p.name.split(" ")[0],
                requests: p.requestsToday,
              }))}
              x="month"
              y="requests"
            />
          ) : (
            <Unavailable label="No data provider connected" />
          )}
        </Card>
        <Card className="p-5">
          <h3 className="text-[13px] font-medium">Failed requests by month</h3>
          {hasProviders ? (
            <BarSeries data={data.failedByMonth} x="month" y="failed" color="#e85d5d" />
          ) : (
            <Unavailable label="No data provider connected" />
          )}
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-[13px] font-medium">Cost mix per report</h3>
          <div className="mt-4">
            {costOn && data.costMix.length ? (
              <HorizontalBars data={data.costMix} />
            ) : (
              <Unavailable label="No cost tracking connected" />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Unavailable({ label }: { label: string }) {
  return (
    <div className="mt-2 flex h-[220px] flex-col items-center justify-center rounded-[10px] border border-dashed border-border text-center">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-1 text-[11px] text-faint">
        Data appears here automatically once it&apos;s wired up.
      </p>
    </div>
  );
}
