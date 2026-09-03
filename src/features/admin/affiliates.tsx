"use client";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import {
  adminUsers,
  affiliateStats,
  commissions as initialCommissions,
  partnerClients,
  referrals,
  trackedLeads,
} from "@/lib/data/mock";
import type { Commission } from "@/types";
import { cn, daysBetween, formatCurrency, formatDateTime } from "@/lib/utils";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const tone: Record<string, string> = {
  active: "success",
  trial: "accent",
  suspended: "danger",
  past_due: "warning",
  cancelled: "danger",
};

const commissionTone: Record<string, string> = {
  pending: "warning",
  approved: "accent",
  payable: "accent",
  paid: "success",
  reversed: "danger",
};

const affiliateById = new Map(partnerClients.map((a) => [a.id, a]));
const userByClickId = new Map(adminUsers.filter((u) => u.clickId).map((u) => [u.clickId!, u]));

function reversalEligibility(commission: Commission) {
  const user = userByClickId.get(commission.clickId);
  if (!user?.cancelledAt) return null;
  const days = daysBetween(user.subscribedAt, user.cancelledAt);
  if (days <= 30) return days;
  return null;
}

export function AdminAffiliates() {
  const [nameFilter, setNameFilter] = useState("");
  const [idFilter, setIdFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [commissions, setCommissions] = useState<Commission[]>(initialCommissions);

  const markReversed = (id: string) => {
    setCommissions((rows) =>
      rows.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "reversed",
              reversalReason: c.reversalReason ?? "Cancelled within the reversal window — reversed by admin.",
            }
          : c,
      ),
    );
    toast.success(`${id} marked as reversed`);
  };

  const filteredAffiliates = useMemo(() => {
    const name = nameFilter.trim().toLowerCase();
    const id = idFilter.trim().toLowerCase();
    const email = emailFilter.trim().toLowerCase();
    return partnerClients.filter(
      (a) =>
        a.name.toLowerCase().includes(name) &&
        a.id.toLowerCase().includes(id) &&
        a.email.toLowerCase().includes(email),
    );
  }, [nameFilter, idFilter, emailFilter]);

  return (
    <div>
      <PageHeader
        title="Affiliates"
        subtitle="Partner performance. Referred customers are privacy-safe labels only."
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-4">
        {[
          ["Clicks", affiliateStats.clicks],
          ["Signups", affiliateStats.signups],
          ["Conversions", affiliateStats.conversions],
          ["Active subscribers", affiliateStats.activeSubscribers],
        ].map(([k, v]) => (
          <Card key={String(k)} className="p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint">{k}</p>
            <p className="mt-2 text-[20px]">{v}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-[13px] font-medium mb-4">Affiliate directory</h2>
        <Card className="p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Filter by name">
              <Input
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="e.g. Alexandra"
              />
            </Field>
            <Field label="Filter by ID">
              <Input
                value={idFilter}
                onChange={(e) => setIdFilter(e.target.value)}
                placeholder="e.g. prt_reyes"
              />
            </Field>
            <Field label="Filter by email">
              <Input
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                placeholder="e.g. northline.example"
              />
            </Field>
          </div>
        </Card>
        <Card className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
                <th className="px-4 py-3">Affiliate name</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">Conversions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAffiliates.map((a) => (
                <tr key={a.id} className="border-b border-border/80 hover:bg-surface-2/50">
                  <td className="px-4 py-3">{a.name}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted">{a.id}</td>
                  <td className="px-4 py-3 text-muted">{a.email}</td>
                  <td className="px-4 py-3">
                    <Badge tone={tone[a.status]}>{a.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{a.clicks}</td>
                  <td className="px-4 py-3 tabular-nums">{a.conversions}</td>
                </tr>
              ))}
              {filteredAffiliates.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-muted" colSpan={6}>
                    No affiliates match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-[13px] font-medium mb-4">Tracked user submissions</h2>
        <p className="mb-3 text-[12px] text-muted">
          Captured when a visitor submits their name, email, and phone number — attributed to the
          affiliate whose link they arrived through.
        </p>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Affiliate</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {trackedLeads.map((lead) => {
                const affiliate = lead.affiliateId ? affiliateById.get(lead.affiliateId) : null;
                return (
                  <tr key={lead.id} className="border-b border-border/80 hover:bg-surface-2/50">
                    <td className="px-4 py-3">{lead.name}</td>
                    <td className="px-4 py-3 text-muted">
                      <p>{lead.email}</p>
                      <p>{lead.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {lead.city}, {lead.state}
                      <br />
                      {lead.country}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {lead.device}
                      <br />
                      {lead.browser}
                    </td>
                    <td className="px-4 py-3">
                      {affiliate ? (
                        <div>
                          <p>{affiliate.name}</p>
                          <p className="font-mono text-[12px] text-muted">{affiliate.id}</p>
                        </div>
                      ) : (
                        <Badge tone="muted">Direct / no affiliate</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDateTime(lead.submittedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-[13px] font-medium mb-4">Referrals & commissions</h2>
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
                <th className="px-4 py-3">Referral</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Commission</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((r) => (
                <tr key={r.id} className="border-b border-border/80">
                  <td className="px-4 py-3">{r.customer}</td>
                  <td className="px-4 py-3">{r.plan}</td>
                  <td className="px-4 py-3">{r.status}</td>
                  <td className="px-4 py-3">{formatCurrency(r.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <p className="mb-2 mt-6 text-[12px] text-muted">
          Each commission carries the Click ID that generated it. If the linked subscription is
          cancelled within 30 days of purchase, it is flagged below for reversal.
        </p>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Referral</th>
                <th className="px-4 py-3">Click ID</th>
                <th className="px-4 py-3">Affiliate</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => {
                const affiliate = affiliateById.get(c.affiliateId);
                const eligibleDays = c.status !== "reversed" ? reversalEligibility(c) : null;
                return (
                  <tr
                    key={c.id}
                    className={cn(
                      "border-b border-border/80",
                      eligibleDays !== null && "bg-danger-dim/40",
                    )}
                  >
                    <td className="px-4 py-3">{c.id}</td>
                    <td className="px-4 py-3">{c.referral}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-muted">{c.clickId}</td>
                    <td className="px-4 py-3 text-muted">{affiliate ? affiliate.name : "—"}</td>
                    <td className="px-4 py-3 tabular-nums">{formatCurrency(c.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={commissionTone[c.status]}>{c.status}</Badge>
                      {c.status === "reversed" && c.reversalReason ? (
                        <p className="mt-1 text-[12px] text-muted">{c.reversalReason}</p>
                      ) : eligibleDays !== null ? (
                        <p className="mt-1 text-[12px] text-danger">
                          Cancelled {eligibleDays}d after purchase — eligible for reversal
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {eligibleDays !== null ? (
                        <button
                          className="text-[12px] text-danger"
                          onClick={() => markReversed(c.id)}
                        >
                          Mark as reversed
                        </button>
                      ) : (
                        <span className="text-[12px] text-faint">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
