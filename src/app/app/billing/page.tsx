"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { currentUser, invoices, plans } from "@/lib/data/mock";
import { stripeService } from "@/lib/services";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [change, setChange] = useState(false);
  const [cancel, setCancel] = useState(false);
  const used = currentUser.creditsTotal - currentUser.creditsRemaining;
  const pct = Math.round((used / currentUser.creditsTotal) * 100);

  const portal = async () => {
    await stripeService.portalUrl();
    toast.success("Stripe Customer Portal would open here");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Billing"
        subtitle="Plan, report credits, invoices, and payment method."
        action={
          <Button variant="secondary" onClick={portal}>
            Manage Billing
          </Button>
        }
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <p className="text-[11px] uppercase tracking-[0.12em] text-faint">Current plan</p>
          <p className="mt-2 text-[22px]">{currentUser.planLabel}</p>
          <p className="mt-1 text-[13px] text-muted">
            {formatCurrency(149)} · Next billing {formatDate(currentUser.nextBillingAt)}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => setChange(true)}>Upgrade</Button>
            <Button variant="secondary" onClick={() => setChange(true)}>
              Change Plan
            </Button>
            <Button variant="ghost" onClick={() => setCancel(true)}>
              Cancel Subscription
            </Button>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-[11px] uppercase tracking-[0.12em] text-faint">Report credits</p>
          <p className="mt-2 text-[22px]">
            {used} used · {currentUser.creditsRemaining} remaining
          </p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-3">
            <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-[12px] text-muted">{pct}% of {currentUser.creditsTotal} this period</p>
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <p className="text-[11px] uppercase tracking-[0.12em] text-faint">Payment method</p>
        <p className="mt-2 text-[14px]">{currentUser.paymentMethod}</p>
        <p className="mt-1 text-[12px] text-muted">Updated via Stripe Customer Portal.</p>
      </Card>

      <Card className="mt-4">
        <CardHeader title="Invoices" subtitle="Demo history" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id} className="border-b border-border/80">
                  <td className="px-5 py-3 font-mono text-[12px]">{i.id}</td>
                  <td className="px-5 py-3 text-muted">{i.date}</td>
                  <td className="px-5 py-3">{formatCurrency(i.amount)}</td>
                  <td className="px-5 py-3 capitalize text-success">{i.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={change}
        onOpenChange={setChange}
        title="Change plan"
        description="Stripe Checkout would complete this in production."
        footer={
          <Button onClick={() => { setChange(false); toast.success("Plan change queued (demo)"); }}>
            Confirm
          </Button>
        }
      >
        <ul className="space-y-2 text-[13px]">
          {plans.map((p) => (
            <li key={p.id} className="flex justify-between rounded-md border border-border px-3 py-2">
              <span>{p.name}</span>
              <span className="text-muted">{p.priceLabel}</span>
            </li>
          ))}
        </ul>
      </Modal>
      <Modal
        open={cancel}
        onOpenChange={setCancel}
        title="Cancel subscription?"
        description="Access continues through the current period. Credits stop renewing."
        footer={
          <>
            <Button variant="secondary" onClick={() => setCancel(false)}>
              Keep plan
            </Button>
            <Button variant="danger" onClick={() => { setCancel(false); toast.success("Cancellation scheduled (demo)"); }}>
              Cancel subscription
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-muted">This is a demonstration. No charge is issued.</p>
      </Modal>
    </div>
  );
}
