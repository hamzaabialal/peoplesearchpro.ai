"use client";

import { Menu } from "@/components/ui/menu";
import { UserAvatar } from "@/components/user-avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";
import {
  Activity,
  BadgeDollarSign,
  Building2,
  ClipboardList,
  Cpu,
  FileText,
  FolderSearch,
  Handshake,
  LayoutDashboard,
  Menu as MenuIcon,
  Receipt,
  ScrollText,
  Settings,
  Shield,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/investigations", label: "Investigations" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/affiliates", label: "Affiliates" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/providers", label: "Data Sources" },
  { href: "/admin/api-usage", label: "API Usage" },
  { href: "/admin/costs", label: "Costs" },
  { href: "/admin/logs", label: "System Logs" },
  { href: "/admin/audit", label: "Audit Logs" },
  { href: "/admin/settings", label: "Settings" },
];

const icons: Record<string, React.ComponentType<{ size?: number }>> = {
  "/admin": LayoutDashboard,
  "/admin/users": Users,
  "/admin/investigations": FolderSearch,
  "/admin/reports": FileText,
  "/admin/subscriptions": Receipt,
  "/admin/plans": BadgeDollarSign,
  "/admin/affiliates": Handshake,
  "/admin/clients": Building2,
  "/admin/providers": Shield,
  "/admin/api-usage": Cpu,
  "/admin/costs": Wallet,
  "/admin/logs": ScrollText,
  "/admin/audit": ClipboardList,
  "/admin/settings": Settings,
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user } = useCurrentUser();

  const profileItems = [
    { label: "Settings", href: "/admin/settings" },
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
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-border bg-bg-elevated md:flex">
        <Link href="/admin" className="flex h-14 items-center gap-2.5 border-b border-border px-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-accent/40 bg-accent-dim text-[10px] font-semibold text-accent-2">
            OPS
          </span>
          <div>
            <p className="text-[13px] font-medium">Operations</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-faint">Admin</p>
          </div>
        </Link>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3 scrollbar-thin">
          {nav.map((item) => {
            const Icon = icons[item.href] ?? Activity;
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[10px] px-2.5 py-2 text-[13px]",
                  active ? "bg-accent-dim text-text" : "text-muted hover:bg-surface-2 hover:text-text",
                )}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>
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
          <aside className="absolute left-0 top-0 h-full w-[250px] border-r border-border bg-bg-elevated p-3">
            <button className="mb-3 text-muted" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-2 py-2 text-[13px] text-muted"
              >
                {item.label}
              </Link>
            ))}
          </aside>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-bg/90 px-4 backdrop-blur">
          <button className="md:hidden" onClick={() => setOpen(true)}>
            <MenuIcon size={18} />
          </button>
          <p className="text-[12px] uppercase tracking-[0.16em] text-faint">
            Control center
          </p>
          <div className="ml-auto">
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
          </div>
        </header>
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
