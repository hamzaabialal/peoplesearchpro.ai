"use client";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { adminUsers, plans } from "@/lib/data/mock";
import type { AdminUser } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

const tone: Record<string, string> = {
  active: "success",
  trial: "accent",
  suspended: "danger",
  past_due: "warning",
  cancelled: "danger",
};

export function AdminUsers() {
  const [rows, setRows] = useState(adminUsers);
  const [view, setView] = useState<AdminUser | null>(null);
  const [planUser, setPlanUser] = useState<AdminUser | null>(null);
  const [creditUser, setCreditUser] = useState<AdminUser | null>(null);
  const [credits, setCredits] = useState("10");

  const patch = (id: string, fn: (u: AdminUser) => AdminUser) =>
    setRows((r) => r.map((u) => (u.id === id ? fn(u) : u)));

  return (
    <div>
      <PageHeader title="Users" subtitle="Workspace accounts, plans, and report credits." />
      <Card className="mt-8">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[960px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reports used</th>
                <th className="px-4 py-3">Remaining</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Last active</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b border-border/80 hover:bg-surface-2/50">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.plan}</td>
                  <td className="px-4 py-3">
                    <Badge tone={tone[u.status]}>{u.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{u.reportsUsed}</td>
                  <td className="px-4 py-3 tabular-nums">{u.reportsRemaining}</td>
                  <td className="px-4 py-3 text-muted">{u.joinedAt}</td>
                  <td className="px-4 py-3 text-muted">{formatDateTime(u.lastActiveAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <button className="text-[12px] text-accent-2" onClick={() => setView(u)}>
                        View
                      </button>
                      {u.status === "suspended" ? (
                        <button
                          className="text-[12px] text-success"
                          onClick={() => {
                            patch(u.id, (x) => ({ ...x, status: "active" }));
                            toast.success("Restored");
                          }}
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          className="text-[12px] text-danger"
                          onClick={() => {
                            patch(u.id, (x) => ({ ...x, status: "suspended" }));
                            toast.success("Suspended");
                          }}
                        >
                          Suspend
                        </button>
                      )}
                      <button className="text-[12px] text-muted" onClick={() => setPlanUser(u)}>
                        Change plan
                      </button>
                      <button className="text-[12px] text-muted" onClick={() => setCreditUser(u)}>
                        Credits
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 p-4 md:hidden">
          {rows.map((u) => (
            <button key={u.id} className="w-full rounded-[10px] border border-border p-3 text-left" onClick={() => setView(u)}>
              <p>{u.name}</p>
              <p className="text-[12px] text-muted">{u.email}</p>
            </button>
          ))}
        </div>
        <Pagination />
      </Card>

      <Modal open={!!view} onOpenChange={() => setView(null)} title={view?.name ?? "User"}>
        {view ? (
          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-muted">Email</dt>
              <dd>{view.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Plan</dt>
              <dd className="capitalize">{view.plan}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Joined</dt>
              <dd>{formatDate(view.joinedAt)}</dd>
            </div>
          </dl>
        ) : null}
      </Modal>

      <Modal
        open={!!planUser}
        onOpenChange={() => setPlanUser(null)}
        title="Change plan"
        footer={
          <Button
            onClick={() => {
              toast.success("Plan updated (demo)");
              setPlanUser(null);
            }}
          >
            Apply
          </Button>
        }
      >
        <ul className="space-y-2 text-[13px]">
          {plans.map((p) => (
            <li key={p.id} className="rounded-md border border-border px-3 py-2">
              {p.name} · {p.priceLabel}
            </li>
          ))}
        </ul>
      </Modal>

      <Modal
        open={!!creditUser}
        onOpenChange={() => setCreditUser(null)}
        title="Adjust credits"
        footer={
          <Button
            onClick={() => {
              if (creditUser) {
                patch(creditUser.id, (x) => ({
                  ...x,
                  reportsRemaining: x.reportsRemaining + Number(credits || 0),
                }));
              }
              toast.success("Credits adjusted");
              setCreditUser(null);
            }}
          >
            Apply
          </Button>
        }
      >
        <Field label="Credits to add">
          <Input value={credits} onChange={(e) => setCredits(e.target.value)} />
        </Field>
      </Modal>
    </div>
  );
}
