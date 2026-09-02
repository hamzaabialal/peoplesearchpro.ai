"use client";

import { affiliateStats } from "@/lib/data/mock";
import { cn, formatCurrency } from "@/lib/utils";
import { Handshake, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/partner", label: "Overview" },
  { href: "/partner/reports", label: "Reports" },
  { href: "/partner/referrals", label: "Referrals" },
  { href: "/partner/commissions", label: "Commissions" },
  { href: "/partner/payouts", label: "Payouts" },
  { href: "/partner/campaigns", label: "Campaigns" },
  { href: "/partner/settings", label: "Settings" },
];

export function PartnerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="sticky top-0 hidden h-screen w-[248px] flex-col border-r border-border bg-bg-elevated md:flex">
        <Link href="/partner" className="flex h-14 items-center gap-2.5 border-b border-border px-4">
          <Handshake size={16} className="text-accent-2" />
          <span className="text-[13px] font-medium">Partner</span>
        </Link>
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {nav.map((item) => {
            const active =
              item.href === "/partner" ? pathname === "/partner" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-[10px] px-2.5 py-2 text-[13px]",
                  active ? "bg-accent-dim text-text" : "text-muted hover:bg-surface-2 hover:text-text",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <p className="text-[10px] uppercase tracking-[0.12em] text-faint">Paid to date</p>
          <p className="mt-1 text-[18px]">{formatCurrency(affiliateStats.paid)}</p>
        </div>
      </aside>
      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[240px] bg-bg-elevated p-3">
            <button onClick={() => setOpen(false)} className="mb-3 text-muted">
              <X size={16} />
            </button>
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block py-2 text-[13px]">
                {n.label}
              </Link>
            ))}
          </aside>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border px-4">
          <button className="md:hidden" onClick={() => setOpen(true)}>
            <Menu size={18} />
          </button>
          <p className="text-[13px] text-muted">Affiliate workspace</p>
          <Link href="/app" className="ml-auto text-[12px] text-accent-2">
            Back to product
          </Link>
        </header>
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
