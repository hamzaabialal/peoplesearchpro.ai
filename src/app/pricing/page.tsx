import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarketingFooter, MarketingHeader } from "@/layouts/marketing";
import { plans } from "@/lib/data/mock";
import { formatCurrency } from "@/lib/utils";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pricing" };

export default function Page() {
  return (
    <div className="min-h-screen bg-bg">
      <MarketingHeader />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-[11px] uppercase tracking-[0.16em] text-faint">Subscriptions</p>
        <h1 className="mt-3 text-[36px] font-medium tracking-tight">Plans</h1>
        <p className="mt-3 max-w-xl text-[15px] text-muted">
          Credits are consumed when an investigation launches. Unused credits do not
          roll over on Starter. Business and Enterprise may contract unused capacity.
        </p>
        <div className="mt-12 grid gap-4 lg:grid-cols-4">
          {plans.map((p) => (
            <Card key={p.id} className={`flex flex-col p-6 ${p.featured ? "border-accent/40" : ""}`}>
              <h2 className="text-[18px]">{p.name}</h2>
              <p className="mt-3 text-[28px] tracking-tight">
                {p.price != null ? formatCurrency(p.price) : "Custom"}
              </p>
              <p className="text-[12px] text-muted">{p.priceLabel}</p>
              <p className="mt-4 text-[13px]">
                {p.reportsPerMonth} reports / month
              </p>
              <p className="mt-1 text-[12px] text-muted">AI processing: {p.aiLevel}</p>
              <p className="mt-1 text-[12px] text-muted">
                API access: {p.apiAccess ? "Included" : "Not included"}
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-[13px] text-muted">
                {p.modules.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full" variant={p.featured ? "primary" : "secondary"}>
                <Link href="/signup">{p.id === "enterprise" ? "Contact sales" : "Start Investigation"}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
