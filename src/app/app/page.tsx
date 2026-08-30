"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, Skeleton, TableSkeleton } from "@/components/ui/states";
import { InvestigationList } from "@/features/investigations/list";
import { investigationService, userService } from "@/lib/services";
import { formatDate, greetingForHour } from "@/lib/utils";
import type { CurrentUser, Investigation } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [items, setItems] = useState<Investigation[] | null>(null);

  useEffect(() => {
    userService.getCurrent().then(setUser);
    investigationService.list().then(setItems);
  }, []);

  if (!user || !items) {
    return (
      <div className="mx-auto max-w-6xl">
        <Skeleton className="h-8 w-64" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Card className="mt-8">
          <TableSkeleton />
        </Card>
      </div>
    );
  }

  const empty = items.length === 0;
  const credits =
    typeof window !== "undefined" && localStorage.getItem("psp-zero-credits") === "1"
      ? 0
      : user.creditsRemaining;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-medium tracking-tight">
            {greetingForHour()}, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-[14px] text-muted">Your intelligence workspace</p>
        </div>
        <Button asChild>
          <Link href="/app/investigations/new">+ New Investigation</Link>
        </Button>
      </div>

      {empty ? (
        <Card className="mt-10">
          <EmptyState
            title="Your intelligence workspace is ready."
            body="Start with a name, email, or profile URL. Reports distinguish verified sources from AI inference."
            action={
              <Button asChild>
                <Link href="/app/investigations/new">Start Your First Investigation</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Module k="Report credits" v={`${credits} / ${user.creditsTotal}`} d="This billing period" />
            <Module k="Reports completed" v={String(user.reportsCompleted)} d="Lifetime in this workspace" />
            <Module
              k="Active investigations"
              v={String(items.filter((i) => i.status !== "completed" && i.status !== "failed").length)}
              d="In pipeline"
            />
            <Module k="Current plan" v={user.planLabel} d="25 reports / month" />
            <Module k="Next billing" v={formatDate(user.nextBillingAt)} d={user.paymentMethod} />
          </div>

          <Card className="mt-8">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-medium">Recent investigations</h2>
              <Link href="/app/investigations" className="text-[12px] text-accent-2">
                View all
              </Link>
            </div>
            <InvestigationList items={items} />
          </Card>
        </>
      )}
    </div>
  );
}

function Module({ k, v, d }: { k: string; v: string; d: string }) {
  return (
    <Card className="p-4">
      <p className="text-[11px] uppercase tracking-[0.12em] text-faint">{k}</p>
      <p className="mt-2 text-[20px] tracking-tight">{v}</p>
      <p className="mt-1 text-[11px] text-muted">{d}</p>
    </Card>
  );
}
