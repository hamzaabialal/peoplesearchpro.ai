"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { currentUser } from "@/lib/data/mock";
import { useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";

const Ctx = createContext<{
  credits: number;
  requireCredit: (onOk: () => void) => void;
} | null>(null);

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const [credits] = useState(() => {
    if (typeof window !== "undefined" && localStorage.getItem("psp-zero-credits") === "1") {
      return 0;
    }
    return currentUser.creditsRemaining;
  });
  const router = useRouter();

  const requireCredit = (onOk: () => void) => {
    if (credits <= 0) {
      setPending(() => onOk);
      setOpen(true);
      return;
    }
    onOk();
  };

  return (
    <Ctx.Provider value={{ credits, requireCredit }}>
      {children}
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="You're out of report credits."
        description="This investigation requires 1 report credit."
        footer={
          <>
            <Button variant="secondary" onClick={() => router.push("/app/billing")}>
              View Billing
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
                router.push("/app/billing");
              }}
            >
              Upgrade Plan
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-[13px]">
          <div className="flex justify-between border-b border-border py-2">
            <span className="text-muted">Current plan</span>
            <span>{currentUser.planLabel}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted">Credits remaining</span>
            <span className="tabular-nums">{credits}</span>
          </div>
        </div>
      </Modal>
    </Ctx.Provider>
  );
}

export function useCredits() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("CreditsProvider missing");
  return ctx;
}
