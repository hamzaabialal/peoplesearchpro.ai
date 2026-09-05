"use client";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useEffect, useState } from "react";

type Transferred = {
  id: string;
  amount: number;
  status: string;
  date: string;
  method: string;
  commission: { id: string; referral: string } | null;
};

type Pending = {
  id: string;
  amount: number;
  status: string;
  period: string;
  date: string;
  referral: string;
};

const commissionStatusTone: Record<string, string> = {
  pending: "warning",
  approved: "accent",
  payable: "accent",
};

const pendingColumns: DataTableColumn<Pending>[] = [
  { key: "id", header: "Commission", value: (p) => p.id, className: "font-mono text-[12px]" },
  { key: "referral", header: "Referral", value: (p) => p.referral },
  { key: "period", header: "Period", value: (p) => p.period, className: "text-muted" },
  { key: "amount", header: "Amount", value: (p) => formatCurrency(p.amount), align: "right" },
  {
    key: "status",
    header: "Status",
    value: (p) => p.status,
    render: (p) => <Badge tone={commissionStatusTone[p.status] ?? "muted"}>{p.status}</Badge>,
  },
];

const transferredColumns: DataTableColumn<Transferred>[] = [
  { key: "id", header: "Payout", value: (p) => p.id, className: "font-mono text-[12px]" },
  {
    key: "commission",
    header: "From commission",
    value: (p) => (p.commission ? `${p.commission.id} ${p.commission.referral}` : ""),
    render: (p) =>
      p.commission ? (
        <>
          <span className="font-mono text-[12px] text-muted">{p.commission.id}</span>
          <p className="text-[12px] text-muted">{p.commission.referral}</p>
        </>
      ) : (
        <span className="text-faint">—</span>
      ),
  },
  {
    key: "amount",
    header: "Amount",
    value: (p) => formatCurrency(p.amount),
    render: (p) =>
      p.status === "paid" ? (
        <span>
          {formatCurrency(p.amount)} <span className="text-[12px] text-success">transferred</span>
        </span>
      ) : (
        formatCurrency(p.amount)
      ),
  },
  {
    key: "status",
    header: "Status",
    value: (p) => p.status,
    render: (p) => <Badge tone={p.status === "paid" ? "success" : "accent"}>{p.status}</Badge>,
  },
  { key: "date", header: "Date", value: (p) => formatDate(p.date), className: "text-muted" },
  { key: "method", header: "Method", value: (p) => p.method },
];

export default function Page() {
  const [transferred, setTransferred] = useState<Transferred[] | null>(null);
  const [pending, setPending] = useState<Pending[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/partner/payouts")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Failed to load");
        return r.json();
      })
      .then((d) => {
        setTransferred(d.transferred);
        setPending(d.pending);
      })
      .catch((e) => setError(e.message));
  }, []);

  const pendingTotal = (pending ?? []).reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <PageHeader
        title="Payouts"
        subtitle="Every commission you've earned — what's been transferred to your account, and what's still pending."
      />
      {error ? (
        <p className="mt-8 text-[13px] text-danger">{error}</p>
      ) : (
        <>
          <div className="mt-8">
            <h2 className="mb-1 text-[13px] font-medium">Pending — not yet transferred</h2>
            <p className="mb-3 text-[12px] text-muted">
              Earned commissions waiting on an admin to process the transfer.
              {pending && pending.length > 0 ? ` Total: ${formatCurrency(pendingTotal)}.` : ""}
            </p>
            <DataTable
              columns={pendingColumns}
              data={pending}
              getRowKey={(p) => p.id}
              searchPlaceholder="Search by referral, period, or status"
              emptyMessage="Nothing pending — everything you've earned has been transferred."
            />
          </div>

          <div className="mt-8">
            <h2 className="mb-1 text-[13px] font-medium">Transferred</h2>
            <p className="mb-3 text-[12px] text-muted">
              Commissions an admin has already paid out to your account.
            </p>
            <DataTable
              columns={transferredColumns}
              data={transferred}
              getRowKey={(p) => p.id}
              searchPlaceholder="Search by commission, referral, or method"
              emptyMessage="No payouts yet — once an admin marks a commission paid, it shows up here as a transfer to your account."
            />
          </div>
        </>
      )}
    </div>
  );
}
