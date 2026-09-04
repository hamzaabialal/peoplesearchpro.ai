"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { useCurrentUser } from "@/hooks/use-current-user";
import { currentUser, invoices, plans } from "@/lib/data/mock";
import { stripeService } from "@/lib/services";
import { cn, formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const { user } = useCurrentUser();
  const [change, setChange] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [trialExpiredNotice, setTrialExpiredNotice] = useState(false);
  const used = currentUser.creditsTotal - currentUser.creditsRemaining;
  const pct = Math.round((used / currentUser.creditsTotal) * 100);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reason") === "trial_expired") {
      setTrialExpiredNotice(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const currentPlan = plans.find((p) => p.id === user?.plan);

  const confirmPlan = async () => {
    if (!selectedPlan) return;
    setConfirming(true);
    try {
      const res = await fetch("/api/billing/select-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed to change plan");
      toast.success("Plan change queued (demo)");
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to change plan");
      setConfirming(false);
    }
  };

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

      {trialExpiredNotice ? (
        <div className="mt-6 rounded-[10px] border border-danger/25 bg-danger-dim px-4 py-3 text-[13px] text-danger">
          Your 7-day trial has ended. Select a plan below to keep using PeopleSearch Pro.
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <p className="text-[11px] uppercase tracking-[0.12em] text-faint">Current plan</p>
          {currentPlan ? (
            <>
              <p className="mt-2 text-[22px]">{currentPlan.name}</p>
              <p className="mt-1 text-[13px] text-muted">{currentPlan.priceLabel}</p>
            </>
          ) : (
            <>
              <p className="mt-2 text-[22px]">Trial</p>
              <p className="mt-1 text-[13px] text-muted">
                {user
                  ? user.trialExpired
                    ? "Trial ended — select a plan to continue"
                    : `${user.trialLabel} — no plan selected yet`
                  : "Loading…"}
              </p>
            </>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => setChange(true)}>{currentPlan ? "Upgrade" : "Select a plan"}</Button>
            {currentPlan ? (
              <Button variant="secondary" onClick={() => setChange(true)}>
                Change Plan
              </Button>
            ) : null}
            {currentPlan ? (
              <Button variant="ghost" onClick={() => setCancel(true)}>
                Cancel Subscription
              </Button>
            ) : null}
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
        onOpenChange={(v) => {
          setChange(v);
          if (!v) setSelectedPlan(null);
        }}
        title="Change plan"
        description="Stripe Checkout would complete this in production."
        footer={
          <Button onClick={confirmPlan} disabled={!selectedPlan || confirming}>
            {confirming ? "Confirming…" : "Confirm"}
          </Button>
        }
      >
        <ul className="space-y-2 text-[13px]">
          {plans.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setSelectedPlan(p.id)}
                className={cn(
                  "flex w-full justify-between rounded-md border px-3 py-2 text-left transition-colors",
                  selectedPlan === p.id
                    ? "border-accent/50 bg-accent-dim"
                    : "border-border hover:bg-surface-2",
                )}
              >
                <span>{p.name}</span>
                <span className="text-muted">{p.priceLabel}</span>
              </button>
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
