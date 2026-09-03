"use client";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDateTime } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

type Row = {
  id: string;
  actor: string;
  action: string;
  target: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

const PAGE_SIZE = 25;

export function AdminAudit() {
  const [q, setQ] = useState("");
  const [actor, setActor] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<Row[]>([]);
  const [actors, setActors] = useState<string[]>([]);
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
  }, [debouncedQ, actor]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const p = new URLSearchParams();
    if (debouncedQ) p.set("q", debouncedQ);
    if (actor) p.set("actor", actor);
    p.set("page", String(page));
    fetch(`/api/admin/audit?${p}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Failed to load");
        return r.json();
      })
      .then((d) => {
        setRows(d.rows);
        setTotal(d.total);
        setActors(d.actors);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [debouncedQ, actor, page]);

  useEffect(load, [load]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(total, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="Audit logs"
        subtitle="Every operator action on users, commissions, and settings — written as it happens."
      />

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="w-full max-w-xs">
          <Label htmlFor="audit-search">Search</Label>
          <Input
            id="audit-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Action or target"
          />
        </div>
        <div className="w-64">
          <Label htmlFor="audit-actor">Actor</Label>
          <Select id="audit-actor" value={actor} onChange={(e) => setActor(e.target.value)}>
            <option value="">All actors</option>
            {actors.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
        </div>
        {(debouncedQ || actor) && (
          <button
            type="button"
            className="h-9 text-[12px] text-accent-2"
            onClick={() => {
              setQ("");
              setActor("");
            }}
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto self-center text-[12px] text-muted">
          {loading ? "Loading…" : `${total} event${total === 1 ? "" : "s"}`}
        </span>
      </div>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-danger">
                  {error}
                </td>
              </tr>
            ) : loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted">
                  No audit events match these filters.
                </td>
              </tr>
            ) : (
              rows.map((a) => (
                <tr key={a.id} className="border-b border-border/80">
                  <td className="px-4 py-3 font-mono text-[11px] text-muted">
                    {formatDateTime(a.created_at)}
                  </td>
                  <td className="px-4 py-3">{a.actor}</td>
                  <td className="px-4 py-3">{a.action}</td>
                  <td className="px-4 py-3 text-muted">{a.target ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

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
