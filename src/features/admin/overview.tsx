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
    </div>
  );
}
