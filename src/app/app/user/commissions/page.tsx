"use client";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
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

const columns: DataTableColumn<Commission>[] = [
  { key: "id", header: "ID", value: (c) => c.id, className: "font-mono text-[12px]" },
  {
    key: "referral",
    header: "Referral",
    value: (c) => c.referral,
    render: (c) => (
      <>
        {c.referral}
        {c.reversalReason ? <p className="mt-0.5 text-[11px] text-danger">{c.reversalReason}</p> : null}
      </>
    ),
  },
  { key: "period", header: "Period", value: (c) => c.period, className: "text-muted" },
  {
    key: "amount",
    header: "Amount",
    value: (c) => formatCurrency(c.amount),
    align: "right",
  },
  {
    key: "status",
    header: "Status",
    value: (c) => c.status,
    render: (c) => <Badge tone={tone[c.status]}>{c.status}</Badge>,
  },
];

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
        <div className="mt-8">
          <DataTable
            columns={columns}
            data={commissions}
            getRowKey={(c) => c.id}
            searchPlaceholder="Search by referral, period, or status"
            emptyMessage="No commissions yet."
          />
        </div>
      )}
    </div>
  );
}
