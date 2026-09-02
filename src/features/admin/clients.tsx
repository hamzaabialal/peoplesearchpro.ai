"use client";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { partnerClients } from "@/lib/data/mock";
import type { PartnerActivityPeriod, PartnerClient } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

const tone: Record<string, string> = {
  active: "success",
  trial: "accent",
  suspended: "danger",
  past_due: "warning",
  cancelled: "danger",
};

const periods: Array<{ value: PartnerActivityPeriod; label: string }> = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last2days", label: "Last 2 Days" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "lastMonth", label: "Last Month" },
];

export function AdminClients() {
  const [period, setPeriod] = useState<PartnerActivityPeriod>("today");
  const [view, setView] = useState<PartnerClient | null>(null);

  const periodLabel = periods.find((p) => p.value === period)!.label;
  const totals = partnerClients.reduce(
    (acc, c) => {
      acc.leads += c.activity[period].leads;
      acc.conversations += c.activity[period].conversations;
      return acc;
    },
    { leads: 0, conversations: 0 },
  );

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle="Partners and affiliates working with PeopleSearch Pro, and their referral performance."
        action={
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-faint">Period</p>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PartnerActivityPeriod)}
              className="w-auto"
            >
              {periods.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          ["Partners", partnerClients.length],
          [`Leads (${periodLabel})`, totals.leads],
          [`Conversations (${periodLabel})`, totals.conversations],
        ].map(([k, v]) => (
          <Card key={String(k)} className="p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint">{k}</p>
            <p className="mt-2 text-[20px] tabular-nums">{v}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 overflow-x-auto">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Referral link</th>
                <th className="px-4 py-3">Landing page</th>
                <th className="px-4 py-3">Leads</th>
                <th className="px-4 py-3">Conversations</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partnerClients.map((c) => (
                <tr key={c.id} className="border-b border-border/80 hover:bg-surface-2/50">
                  <td className="px-4 py-3">
                    <p>{c.name}</p>
                    <p className="text-[12px] text-muted">{c.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={tone[c.status]}>{c.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted">{c.referralLink}</td>
                  <td className="px-4 py-3 text-muted">{c.landingPage}</td>
                  <td className="px-4 py-3 tabular-nums">{c.activity[period].leads}</td>
                  <td className="px-4 py-3 tabular-nums">{c.activity[period].conversations}</td>
                  <td className="px-4 py-3">
                    <button className="text-[12px] text-accent-2" onClick={() => setView(c)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 p-4 md:hidden">
          {partnerClients.map((c) => (
            <button
              key={c.id}
              className="w-full rounded-[10px] border border-border p-3 text-left"
              onClick={() => setView(c)}
            >
              <div className="flex items-center justify-between gap-2">
                <p>{c.name}</p>
                <Badge tone={tone[c.status]}>{c.status.replace("_", " ")}</Badge>
              </div>
              <p className="mt-1 text-[12px] text-muted">{c.landingPage}</p>
              <p className="mt-1 text-[12px] tabular-nums text-muted">
                {c.activity[period].leads} leads · {c.activity[period].conversations} conversations
              </p>
            </button>
          ))}
        </div>
        <Pagination />
      </Card>

      <Modal
        open={!!view}
        onOpenChange={() => setView(null)}
        title={view?.name ?? "Partner"}
        description={view?.email}
      >
        {view ? (
          <div className="space-y-4 text-[13px]">
            <div className="flex items-center justify-between">
              <span className="text-muted">Status</span>
              <Badge tone={tone[view.status]}>{view.status.replace("_", " ")}</Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted">Referral link</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px]">{view.referralLink}</span>
                <button
                  className="text-[12px] text-accent-2"
                  onClick={() => {
                    navigator.clipboard.writeText(view.referralLink);
                    toast.success("Copied");
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Landing page</span>
              <span>{view.landingPage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Partner since</span>
              <span>{formatDate(view.joinedAt)}</span>
            </div>
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-faint">Activity by period</p>
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
                    <th className="py-2">Period</th>
                    <th className="py-2">Leads</th>
                    <th className="py-2">Conversations</th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map((p) => (
                    <tr key={p.value} className={cn("border-b border-border/80", p.value === period && "text-text")}>
                      <td className="py-2 text-muted">{p.label}</td>
                      <td className="py-2 tabular-nums">{view.activity[p.value].leads}</td>
                      <td className="py-2 tabular-nums">{view.activity[p.value].conversations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
