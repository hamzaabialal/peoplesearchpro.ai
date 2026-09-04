"use client";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";

type Payout = {
  id: string;
  amount: number;
  status: string;
  date: string;
  method: string;
};

export default function Page() {
  const [payouts, setPayouts] = useState<Payout[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/partner/payouts")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Failed to load");
        return r.json();
      })
      .then((d) => setPayouts(d.payouts))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <PageHeader title="Payouts" subtitle="Scheduled and completed transfers for this account." />
      {error ? (
        <p className="mt-8 text-[13px] text-danger">{error}</p>
      ) : (
        <Card className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Method</th>
              </tr>
            </thead>
            <tbody>
              {payouts === null ? (
                <tr>
                  <td className="px-4 py-6 text-center text-muted" colSpan={5}>
                    Loading…
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-muted" colSpan={5}>
                    No payouts yet — paid commissions will appear here once transferred.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p.id} className="border-b border-border/80">
                    <td className="px-4 py-3 font-mono text-[12px]">{p.id}</td>
                    <td className="px-4 py-3">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={p.status === "paid" ? "success" : "accent"}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(p.date)}</td>
                    <td className="px-4 py-3">{p.method}</td>
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
