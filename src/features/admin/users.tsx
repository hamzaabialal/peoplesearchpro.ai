"use client";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { UserAvatar } from "@/components/user-avatar";
import { formatDate } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Row = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "partner" | "admin";
  image: string | null;
  created_at: string;
  plan: string | null;
  subscription_status: string | null;
};

const roleTone: Record<string, string> = {
  admin: "accent",
  partner: "warning",
  customer: "muted",
};

const PAGE_SIZE = 20;

export function AdminUsers() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<Row | null>(null);
  const [roleEdit, setRoleEdit] = useState<Row | null>(null);
  const [nextRole, setNextRole] = useState<Row["role"]>("customer");
  const [saving, setSaving] = useState(false);

  // Debounce the search box; reset to page 1 whenever a filter changes.
  const debounced = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQ, setDebouncedQ] = useState("");
  useEffect(() => {
    if (debounced.current) clearTimeout(debounced.current);
    debounced.current = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => {
      if (debounced.current) clearTimeout(debounced.current);
    };
  }, [q]);
  useEffect(() => {
    setPage(1);
  }, [debouncedQ, role]);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (debouncedQ) params.set("q", debouncedQ);
    if (role) params.set("role", role);
    params.set("page", String(page));
    fetch(`/api/admin/users?${params}`)
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
  }, [debouncedQ, role, page]);

  useEffect(load, [load]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(total, page * PAGE_SIZE);

  const filtersActive = useMemo(() => !!debouncedQ || !!role, [debouncedQ, role]);

  async function saveRole() {
    if (!roleEdit) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${roleEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success(`Role changed to ${nextRole}`);
      setRoleEdit(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to change role");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Users" subtitle="Every account, live from the database." />

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="w-full max-w-xs">
          <Label htmlFor="user-search">Search</Label>
          <Input
            id="user-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name or email"
          />
        </div>
        <div className="w-40">
          <Label htmlFor="user-role">Role</Label>
          <Select id="user-role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="customer">Customer</option>
            <option value="partner">Partner</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
        {filtersActive ? (
          <button
            type="button"
            className="h-9 text-[12px] text-accent-2"
            onClick={() => {
              setQ("");
              setRole("");
            }}
          >
            Clear filters
          </button>
        ) : null}
        <span className="ml-auto self-center text-[12px] text-muted">
          {loading ? "Loading…" : `${total} user${total === 1 ? "" : "s"}`}
        </span>
      </div>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-danger">
                    {error}
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted">
                    No users match these filters.
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.id} className="border-b border-border/80 hover:bg-surface-2/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar name={u.name} email={u.email} image={u.image} size={28} />
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge tone={roleTone[u.role]}>{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3 capitalize">{u.plan ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          className="text-[12px] text-accent-2"
                          onClick={() => setView(u)}
                        >
                          View
                        </button>
                        <button
                          className="text-[12px] text-muted hover:text-text"
                          onClick={() => {
                            setRoleEdit(u);
                            setNextRole(u.role);
                          }}
                        >
                          Change role
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[12px] text-muted">
          <span>
            {showingFrom}–{showingTo} of {total}
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

      <Modal open={!!view} onOpenChange={() => setView(null)} title={view?.name ?? "User"}>
        {view ? (
          <dl className="space-y-2 text-[13px]">
            <Row2 k="Email" v={view.email} />
            <Row2 k="Role" v={view.role} />
            <Row2 k="Plan" v={view.plan ?? "—"} />
            <Row2 k="Subscription" v={view.subscription_status ?? "—"} />
            <Row2 k="Joined" v={formatDate(view.created_at)} />
          </dl>
        ) : null}
      </Modal>

      <Modal
        open={!!roleEdit}
        onOpenChange={() => setRoleEdit(null)}
        title={`Change role — ${roleEdit?.name ?? ""}`}
        footer={
          <Button onClick={saveRole} disabled={saving || nextRole === roleEdit?.role}>
            {saving ? "Saving…" : "Apply"}
          </Button>
        }
      >
        <Label htmlFor="next-role">Role</Label>
        <Select
          id="next-role"
          value={nextRole}
          onChange={(e) => setNextRole(e.target.value as Row["role"])}
        >
          <option value="customer">Customer</option>
          <option value="partner">Partner</option>
          <option value="admin">Admin</option>
        </Select>
      </Modal>
    </div>
  );
}

function Row2({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{k}</dt>
      <dd className="capitalize">{v}</dd>
    </div>
  );
}
