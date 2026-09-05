"use client";

import { Menu } from "@/components/ui/menu";
import { UserAvatar } from "@/components/user-avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn, formatCurrency } from "@/lib/utils";
import { Handshake, Menu as MenuIcon, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { href: "/app/user", label: "Overview" },
  { href: "/app/user/reports", label: "Reports" },
  { href: "/app/user/referrals", label: "Referrals" },
  { href: "/app/user/commissions", label: "Commissions" },
  { href: "/app/user/payouts", label: "Payouts" },
  { href: "/app/user/campaigns", label: "Campaigns" },
  { href: "/app/user/settings", label: "Settings" },
];

export function PartnerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user } = useCurrentUser();
  const [paidToDate, setPaidToDate] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/partner/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setPaidToDate(d?.paid ?? 0))
      .catch(() => setPaidToDate(0));
  }, []);

  const profileItems = [
    { label: "Settings", href: "/app/user/settings" },
    { label: "Sign out", href: "/api/logout", danger: true },
  ];
  const profileHeader = (
    <div className="min-w-0">
      <p className="truncate text-text">{user?.name || "Account"}</p>
      <p className="truncate">{user?.email ?? "—"}</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="sticky top-0 hidden h-screen w-[248px] flex-col border-r border-border bg-bg-elevated md:flex">
        <Link href="/app/user" className="flex h-14 items-center gap-2.5 border-b border-border px-4">
          <Handshake size={16} className="text-accent-2" />
          <span className="text-[13px] font-medium">User</span>
        </Link>
        <nav className="flex-1 space-y-0.5 px-2 py-3">
          {nav.map((item) => {
            const active =
              item.href === "/app/user" ? pathname === "/app/user" : pathname.startsWith(item.href);
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
          <p className="mt-1 text-[18px]">{paidToDate === null ? "—" : formatCurrency(paidToDate)}</p>
        </div>
        <div className="border-t border-border p-3">
          <Menu
            header={profileHeader}
            items={profileItems}
            trigger={
              <button className="flex w-full items-center gap-2.5 rounded-[10px] p-1.5 text-left hover:bg-surface-2">
                <UserAvatar name={user?.name} email={user?.email} image={user?.image} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-text">
                    {user?.name || "Account"}
                  </span>
                  <span className="block truncate text-[11px] text-muted">
                    {user?.email ?? "—"}
                  </span>
                </span>
              </button>
            }
          />
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
            <MenuIcon size={18} />
          </button>
          <p className="text-[13px] text-muted">Affiliate workspace</p>
          <Link href="/app" className="ml-auto text-[12px] text-accent-2">
            Back to product
          </Link>
          <Menu
            header={profileHeader}
            items={profileItems}
            trigger={
              <button
                className="flex items-center rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Account menu"
              >
                <UserAvatar
                  name={user?.name}
                  email={user?.email}
                  image={user?.image}
                  size={32}
                />
              </button>
            }
          />
        </header>
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
