"use client";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { AreaSeries, BarSeries } from "@/components/ui/charts";
import { Select } from "@/components/ui/select";
import { partnerReportData } from "@/lib/data/mock";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

type TimePeriod = "today" | "last7days" | "last30days" | "thisMonth" | "lastMonth";

const timePeriods: Array<{ value: TimePeriod; label: string }> = [
  { value: "today", label: "Today" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
];

export function PartnerReports() {
  const [period, setPeriod] = useState<TimePeriod>("today");

  const data = partnerReportData[period];

  const metrics = [
    { k: "Leads received", v: String(data.leads) },
    { k: "Conversations", v: String(data.conversations) },
    { k: "Commission generated", v: formatCurrency(data.commission) },
  ];

  return (
    <div>
      <PageHeader
        title="Partner reports"
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
          <AreaSeries data={partnerReportData.series} x="period" y="leads" />
        </Card>
        <Card className="p-5">
          <h2 className="text-[13px] font-medium">Conversations</h2>
          <AreaSeries data={partnerReportData.series} x="period" y="conversations" color="#3ddc97" />
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-[13px] font-medium">Commission generated</h2>
          <BarSeries data={partnerReportData.series} x="period" y="commission" />
        </Card>
      </div>
    </div>
  );
}
