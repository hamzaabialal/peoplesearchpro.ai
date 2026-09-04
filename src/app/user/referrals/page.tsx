"use client";

import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";

type Referral = {
  id: number;
  customer: string;
  plan: string;
  status: string;
  signedUpAt: string;
  commission: number;
};

export default function Page() {
  const [referrals, setReferrals] = useState<Referral[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/partner/referrals")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Failed to load");
        return r.json();
      })
      .then((d) => setReferrals(d.referrals))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <PageHeader
        title="Referrals"
        subtitle="Referred customers are shown as privacy-safe labels only. This list is yours alone."
      />
      {error ? (
        <p className="mt-8 text-[13px] text-danger">{error}</p>
      ) : (
        <Card className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Signed up</th>
                <th className="px-4 py-3">Commission</th>
              </tr>
            </thead>
            <tbody>
              {referrals === null ? (
                <tr>
                  <td className="px-4 py-6 text-center text-muted" colSpan={5}>
                    Loading…
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-muted" colSpan={5}>
                    No referrals yet — share your referral link to start earning.
                  </td>
                </tr>
              ) : (
                referrals.map((r) => (
                  <tr key={r.id} className="border-b border-border/80">
                    <td className="px-4 py-3">{r.customer}</td>
                    <td className="px-4 py-3 text-muted">{r.plan || "Not selected yet"}</td>
                    <td className="px-4 py-3">{r.status}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(r.signedUpAt)}</td>
                    <td className="px-4 py-3">{r.commission > 0 ? formatCurrency(r.commission) : "—"}</td>
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
