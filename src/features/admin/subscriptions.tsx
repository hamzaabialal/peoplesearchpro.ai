"use client";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

type Row = {
  id: string;
  plan: string;
  status: "active" | "trialing" | "past_due" | "canceled";
  current_period_end: string | null;
  created_at: string;
  user_id: number;
  name: string;
  email: string;
};

const statusTone: Record<string, string> = {
  active: "success",
  trialing: "accent",
  past_due: "warning",
  canceled: "danger",
};

const PAGE_SIZE = 20;

export function AdminSubscriptions() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQ, setDebouncedQ] = useState("");
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);
  useEffect(() => {
    setPage(1);
  }, [debouncedQ, status, plan]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (debouncedQ) params.set("q", debouncedQ);
    if (status) params.set("status", status);
    if (plan) params.set("plan", plan);
    params.set("page", String(page));
    fetch(`/api/admin/subscriptions?${params}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Failed to load");
        return r.json();
      })
      .then((d) => {
        setRows(d.rows);
        setTotal(d.total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [debouncedQ, status, plan, page]);

  useEffect(load, [load]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(total, page * PAGE_SIZE);
  const filtersActive = !!debouncedQ || !!status || !!plan;

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        subtitle="Active, trial, past-due, and cancelled workspaces — live from the database."
      />

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="w-full max-w-xs">
          <Label htmlFor="sub-search">Search</Label>
          <Input
            id="sub-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Customer name or email"
          />
        </div>
        <div className="w-40">
          <Label htmlFor="sub-status">Status</Label>
          <Select id="sub-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Past due</option>
            <option value="canceled">Canceled</option>
          </Select>
        </div>
        <div className="w-40">
          <Label htmlFor="sub-plan">Plan</Label>
          <Select id="sub-plan" value={plan} onChange={(e) => setPlan(e.target.value)}>
            <option value="">All plans</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="business">Business</option>
            <option value="enterprise">Enterprise</option>
          </Select>
        </div>
        {filtersActive ? (
          <button
            type="button"
            className="h-9 text-[12px] text-accent-2"
            onClick={() => {
              setQ("");
              setStatus("");
              setPlan("");
            }}
          >
            Clear filters
          </button>
        ) : null}
        <span className="ml-auto self-center text-[12px] text-muted">
          {loading ? "Loading…" : `${total} subscription${total === 1 ? "" : "s"}`}
        </span>
      </div>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Renews</th>
                <th className="px-4 py-3">Started</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-danger">
                    {error}
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">
                    No subscriptions match these filters.
                  </td>
                </tr>
              ) : (
                rows.map((s) => (
                  <tr key={s.id} className="border-b border-border/80 hover:bg-surface-2/50">
                    <td className="px-4 py-3">
                      {s.name}
                      <div className="text-[12px] text-muted">{s.email}</div>
                    </td>
                    <td className="px-4 py-3 capitalize">{s.plan}</td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone[s.status]}>{s.status.replace("_", " ")}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {s.current_period_end ? formatDate(s.current_period_end) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(s.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[12px] text-muted">
          <span>
            {from}–{to} of {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-border px-2 py-1 disabled:opacity-40"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span>
              Page {page} of {pages}
            </span>
            <button
              type="button"
              className="rounded-md border border-border px-2 py-1 hover:bg-surface-2 disabled:opacity-40"
              disabled={page >= pages || loading}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
