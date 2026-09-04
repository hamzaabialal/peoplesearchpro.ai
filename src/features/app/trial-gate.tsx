"use client";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { plans } from "@/lib/data/mock";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Full-screen, unclosable paywall shown the instant the trial ends — even if
 * the user never navigates anywhere. Mounted once in AppShell so it covers
 * every /app/* page. proxy.ts still redirects on the *next* request as a
 * fallback (no-JS, direct API hits); this is the live, no-refresh-needed layer.
 */
export function TrialGate() {
  const { user, refetch } = useCurrentUser();
  const [expired, setExpired] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!user || user.plan) {
      setExpired(false);
      return;
    }
    if (user.trialExpired) {
      setExpired(true);
      return;
    }
    if (!user.trialEndsAt) return;

    const msLeft = new Date(user.trialEndsAt).getTime() - Date.now();
    if (msLeft <= 0) {
      setExpired(true);
      return;
    }
    timerRef.current = setTimeout(() => setExpired(true), msLeft);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user]);

  if (!expired || !user) return null;

  const confirmPlan = async () => {
    if (!selectedPlan) return;
    if (selectedPlan === "enterprise") {
      toast.info("Contact sales for Enterprise pricing.");
      return;
    }
    setConfirming(true);
    try {
      const res = await fetch("/api/billing/select-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlan }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed to select plan");
      toast.success("Plan selected — welcome back");
      await refetch();
      setSelectedPlan(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to select plan");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-bg p-4">
      <div className="w-full max-w-lg py-10">
        <div className="text-center">
          <h1 className="text-[22px] font-medium tracking-tight">Your trial has ended</h1>
          <p className="mt-2 text-[13px] text-muted">
            Select a plan to keep using PeopleSearch Pro.
          </p>
        </div>

        <div className="mt-6 space-y-2">
          {plans.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPlan(p.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-[10px] border px-4 py-3 text-left transition-colors",
                selectedPlan === p.id
                  ? "border-accent/50 bg-accent-dim"
                  : "border-border hover:bg-surface-2",
              )}
            >
              <span className="text-[13px]">{p.name}</span>
              <span className="text-[13px] text-muted">{p.priceLabel}</span>
            </button>
          ))}
        </div>

        <Button className="mt-6 w-full" onClick={confirmPlan} disabled={!selectedPlan || confirming}>
          {confirming ? "Confirming…" : "Confirm plan"}
        </Button>

        <p className="mt-6 text-center text-[12px] text-faint">
          <a href="/api/logout" className="hover:text-muted">
            Sign out
          </a>
        </p>
      </div>
    </div>
  );
}
