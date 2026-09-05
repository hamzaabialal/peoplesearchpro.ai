"use client";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Affiliate = {
  id: string;
  name: string;
  email: string;
  refCode: string;
  referralLink: string;
  landingPage: string | null;
  status: string;
  clicks: number;
  conversions: number;
  joinedAt: string;
};
type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  device: string | null;
  browser: string | null;
  submittedAt: string;
  affiliate: { id: string; name: string; code: string } | null;
};
type Referral = {
  id: string;
  customer: string;
  plan: string;
  status: string;
  affiliate: string;
  commission: number;
};
type Commission = {
  id: string;
  referral: string;
  clickId: string | null;
  affiliate: string;
  amount: number;
  status: string;
  reversalReason: string | null;
  eligibleDays: number | null;
};
type Payload = {
  stats: { clicks: number; signups: number; conversions: number; activeSubscribers: number };
  affiliates: Affiliate[];
  trackedLeads: Lead[];
  referrals: Referral[];
  commissions: Commission[];
};

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

export function AdminAffiliates() {
  const [nameFilter, setNameFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [f, setF] = useState({ name: "", code: "", email: "" });
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(
      () => setF({ name: nameFilter.trim(), code: codeFilter.trim(), email: emailFilter.trim() }),
      300,
    );
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [nameFilter, codeFilter, emailFilter]);

  const load = useCallback(() => {
    const p = new URLSearchParams();
    if (f.name) p.set("name", f.name);
    if (f.code) p.set("code", f.code);
    if (f.email) p.set("email", f.email);
    fetch(`/api/admin/affiliates?${p}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Failed to load");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [f]);

  useEffect(load, [load]);

  async function markReversed(id: string) {
    try {
      const res = await fetch(`/api/admin/commissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "reversed" }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed");
      toast.success(`${id} marked as reversed`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  async function markPaid(id: string) {
    try {
      const res = await fetch(`/api/admin/commissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed");
      toast.success(`${id} paid — transferred to the affiliate's payouts`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  const filtersActive = useMemo(
    () => !!(f.name || f.code || f.email),
    [f],
  );

  if (error) {
    return (
      <div>
        <PageHeader title="Affiliates" />
        <p className="mt-8 text-[13px] text-danger">{error}</p>
      </div>
    );
  }
  if (!data) {
    return <div className="mt-8 h-64 animate-pulse rounded-[12px] bg-surface" />;
  }

  return (
    <div>
      <PageHeader
        title="Affiliates"
        subtitle="Partner performance, live from the database. Referred customers are privacy-safe labels only."
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-4">
        {[
          ["Clicks", data.stats.clicks],
          ["Referred signups", data.stats.signups],
          ["Conversions", data.stats.conversions],
          ["Active subscribers", data.stats.activeSubscribers],
        ].map(([k, v]) => (
          <Card key={String(k)} className="p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint">{k}</p>
            <p className="mt-2 text-[20px] tabular-nums">{v}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-[13px] font-medium">Affiliate directory</h2>
        <Card className="p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Filter by name">
              <Input value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} placeholder="e.g. Northline" />
            </Field>
            <Field label="Filter by code">
              <Input value={codeFilter} onChange={(e) => setCodeFilter(e.target.value)} placeholder="e.g. bell" />
            </Field>
            <Field label="Filter by email">
              <Input value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)} placeholder="e.g. northline.example" />
            </Field>
          </div>
          {filtersActive ? (
            <button
              type="button"
              className="mt-2 text-[12px] text-accent-2"
              onClick={() => {
                setNameFilter("");
                setCodeFilter("");
                setEmailFilter("");
              }}
            >
              Clear filters
            </button>
          ) : null}
        </Card>
        <Card className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
                <th className="px-4 py-3">Affiliate</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">Conversions</th>
              </tr>
            </thead>
            <tbody>
              {data.affiliates.map((a) => (
                <tr key={a.id} className="border-b border-border/80 hover:bg-surface-2/50">
                  <td className="px-4 py-3">{a.name}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted">{a.refCode}</td>
                  <td className="px-4 py-3 text-muted">{a.email}</td>
                  <td className="px-4 py-3">
                    <Badge tone={tone[a.status]}>{a.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{a.clicks}</td>
                  <td className="px-4 py-3 tabular-nums">{a.conversions}</td>
                </tr>
              ))}
              {data.affiliates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted">
                    No affiliates match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-1 text-[13px] font-medium">Tracked user submissions</h2>
        <p className="mb-3 text-[12px] text-muted">
          Captured when a visitor submits name, email, and phone — attributed to the affiliate whose
          link they arrived through.
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
              {data.trackedLeads.map((lead) => (
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
                    {lead.affiliate ? (
                      <div>
                        <p>{lead.affiliate.name}</p>
                        <p className="font-mono text-[12px] text-muted">{lead.affiliate.code}</p>
                      </div>
                    ) : (
                      <Badge tone="muted">Direct / no affiliate</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDateTime(lead.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-[13px] font-medium">Referrals &amp; commissions</h2>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
                <th className="px-4 py-3">Referral</th>
                <th className="px-4 py-3">Affiliate</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Commission</th>
              </tr>
            </thead>
            <tbody>
              {data.referrals.map((r) => (
                <tr key={r.id} className="border-b border-border/80">
                  <td className="px-4 py-3">{r.customer}</td>
                  <td className="px-4 py-3 text-muted">{r.affiliate}</td>
                  <td className="px-4 py-3 capitalize">{r.plan}</td>
                  <td className="px-4 py-3">
                    <Badge tone={tone[r.status] ?? "muted"}>{r.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatCurrency(r.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <p className="mb-2 mt-6 text-[12px] text-muted">
          Each commission carries the Click ID that generated it. If the linked subscription is
          cancelled within 30 days of purchase it is flagged for reversal.
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
              {data.commissions.map((c) => (
                <tr
                  key={c.id}
                  className={cn("border-b border-border/80", c.eligibleDays != null && "bg-danger-dim/40")}
                >
                  <td className="px-4 py-3">{c.id}</td>
                  <td className="px-4 py-3">{c.referral}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted">{c.clickId}</td>
                  <td className="px-4 py-3 text-muted">{c.affiliate}</td>
                  <td className="px-4 py-3 tabular-nums">{formatCurrency(c.amount)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={commissionTone[c.status]}>{c.status}</Badge>
                    {c.status === "reversed" && c.reversalReason ? (
                      <p className="mt-1 text-[12px] text-muted">{c.reversalReason}</p>
                    ) : c.eligibleDays != null ? (
                      <p className="mt-1 text-[12px] text-danger">
                        Cancelled {c.eligibleDays}d after purchase — eligible for reversal
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {c.eligibleDays != null ? (
                        <button className="text-[12px] text-danger" onClick={() => markReversed(c.id)}>
                          Mark as reversed
                        </button>
                      ) : null}
                      {c.status !== "paid" && c.status !== "reversed" ? (
                        <button className="text-[12px] text-success" onClick={() => markPaid(c.id)}>
                          Mark as paid
                        </button>
                      ) : null}
                      {c.eligibleDays == null && (c.status === "paid" || c.status === "reversed") ? (
                        <span className="text-[12px] text-faint">—</span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
