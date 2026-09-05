"use client";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";

type Commission = {
  id: string;
  referral: string;
  period: string;
  amount: number;
  status: string;
  reversalReason: string | null;
};

const tone: Record<string, string> = {
  pending: "warning",
  approved: "accent",
  payable: "success",
  paid: "muted",
  reversed: "danger",
};

export default function Page() {
  const [commissions, setCommissions] = useState<Commission[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/partner/commissions")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Failed to load");
        return r.json();
      })
      .then((d) => setCommissions(d.commissions))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <PageHeader title="Commissions" subtitle="Pending, approved, payable, paid, and reversed — yours alone." />
      {error ? (
        <p className="mt-8 text-[13px] text-danger">{error}</p>
      ) : (
        <Card className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Referral</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {commissions === null ? (
                <tr>
                  <td className="px-4 py-6 text-center text-muted" colSpan={5}>
                    Loading…
                  </td>
                </tr>
              ) : commissions.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-muted" colSpan={5}>
                    No commissions yet.
                  </td>
                </tr>
              ) : (
                commissions.map((c) => (
                  <tr key={c.id} className="border-b border-border/80">
                    <td className="px-4 py-3 font-mono text-[12px]">{c.id}</td>
                    <td className="px-4 py-3">
                      {c.referral}
                      {c.reversalReason ? (
                        <p className="mt-0.5 text-[11px] text-danger">{c.reversalReason}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-muted">{c.period}</td>
                    <td className="px-4 py-3">{formatCurrency(c.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={tone[c.status]}>{c.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
