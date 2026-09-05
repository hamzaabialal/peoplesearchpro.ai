"use client";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { AreaSeries, BarSeries } from "@/components/ui/charts";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";

type TimePeriod = "today" | "last7days" | "last30days" | "thisMonth" | "lastMonth";

const timePeriods: Array<{ value: TimePeriod; label: string }> = [
  { value: "today", label: "Today" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
];

type ReportData = {
  leads: number;
  conversations: number;
  commission: number;
  series: { period: string; leads: number; conversations: number; commission: number }[];
};

export function PartnerReports() {
  const [period, setPeriod] = useState<TimePeriod>("today");
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setData(null);
    fetch(`/api/partner/reports?period=${period}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Failed to load");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [period]);

  const metrics = [
    { k: "Leads received", v: data ? String(data.leads) : "—" },
    { k: "Conversations", v: data ? String(data.conversations) : "—" },
    { k: "Commission generated", v: data ? formatCurrency(data.commission) : "—" },
  ];

  if (error) {
    return (
      <div>
        <PageHeader title="User reports" />
        <p className="mt-8 text-[13px] text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="User reports"
        subtitle="Performance metrics and commission tracking for your partnership activities."
        action={
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-faint">Time period</p>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value as TimePeriod)}
              className="w-auto"
            >
              {timePeriods.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((x) => (
          <Card key={x.k} className="p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint">{x.k}</p>
            <p className="mt-2 text-[20px] tabular-nums">{x.v}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-[13px] font-medium">Leads over time</h2>
          <AreaSeries data={data?.series ?? []} x="period" y="leads" />
        </Card>
        <Card className="p-5">
          <h2 className="text-[13px] font-medium">Conversations</h2>
          <AreaSeries data={data?.series ?? []} x="period" y="conversations" color="#3ddc97" />
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-[13px] font-medium">Commission generated</h2>
          <BarSeries data={data?.series ?? []} x="period" y="commission" />
        </Card>
      </div>
    </div>
  );
}
