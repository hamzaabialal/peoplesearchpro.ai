"use client";

import { Menu } from "@/components/ui/menu";
import { Tooltip } from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/user-avatar";
import { useCurrentUser, type CurrentUser } from "@/hooks/use-current-user";
import { TrialGate } from "@/features/app/trial-gate";
import { currentUser, notifications, plans } from "@/lib/data/mock";
import { cn } from "@/lib/utils";
import {
  Bell,
  CircleHelp,
  CreditCard,
  FileText,
  FolderSearch,
  Handshake,
  LayoutDashboard,
  LifeBuoy,
  Menu as MenuIcon,
  PanelLeft,
  Search,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import { openCommandPalette } from "@/hooks/use-command-palette";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const nav = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/investigations", label: "Investigations", icon: FolderSearch },
  { href: "/app/reports", label: "Reports", icon: FileText },
  { href: "/app/people", label: "Saved People", icon: Users },
  { href: "/app/sources", label: "Data Sources", icon: Shield },
  { href: "/app/billing", label: "Billing", icon: CreditCard },
  { href: "/app/user", label: "Affiliate / User", icon: Handshake },
  { href: "/app/settings", label: "Settings", icon: Settings },
  { href: "/app/help", label: "Help", icon: LifeBuoy },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const crumbs = useMemo(() => breadcrumbs(pathname), [pathname]);
  const { user } = useCurrentUser();

  // /app/user has its own shell (PartnerShell, in src/app/app/user/layout.tsx)
  // with its own sidebar/header. Rendering AppShell's chrome around it too
  // would nest two shells inside each other, so step aside entirely here —
  // this also means the trial paywall (TrialGate, below) never covers the
  // affiliate dashboard, which shouldn't be gated by the product trial.
  if (pathname === "/app/user" || pathname.startsWith("/app/user/")) {
    return <>{children}</>;
  }

  const profileHeader = (
    <div className="min-w-0">
      <p className="truncate text-text">{user?.name || "Account"}</p>
      <p className="truncate">{user?.email ?? "—"}</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-bg">
      <aside
        className={cn(
          "no-print sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-bg-elevated transition-[width] duration-200 md:flex",
          collapsed ? "w-[68px]" : "w-[248px]",
        )}
      >
        <Brand collapsed={collapsed} />
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3 scrollbar-thin">
          {nav.map((item) => {
            const active =
              item.href === "/app"
                ? pathname === "/app"
                : pathname === item.href || pathname.startsWith(item.href + "/");
            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[10px] px-2.5 py-2 text-[13px] transition-colors",
                  active
                    ? "bg-accent-dim text-text"
                    : "text-muted hover:bg-surface-2 hover:text-text",
                  collapsed && "justify-center px-0",
                )}
              >
                <item.icon size={16} className={active ? "text-accent-2" : ""} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
            return collapsed ? (
              <Tooltip key={item.href} content={item.label}>
                {link}
              </Tooltip>
            ) : (
              link
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          {!collapsed ? (
            <div className="mb-3 rounded-[10px] border border-border bg-surface px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.12em] text-faint">
                Current plan
              </p>
              {user ? (
                (() => {
                  const plan = plans.find((p) => p.id === user.plan);
                  return plan ? (
                    <p className="mt-0.5 text-[13px]">{plan.name}</p>
                  ) : (
                    <p className="mt-0.5 text-[13px]">
                      Trial — {user.trialLabel}
                    </p>
                  );
                })()
              ) : (
                <p className="mt-0.5 text-[13px]">—</p>
              )}
              <p className="text-[11px] text-muted">
                {currentUser.creditsRemaining} credits remaining
              </p>
            </div>
          ) : null}
          <ProfileBlock collapsed={collapsed} user={user} />
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[260px] flex-col border-r border-border bg-bg-elevated">
            <div className="flex items-center justify-between px-3 py-3">
              <Brand collapsed={false} />
              <button onClick={() => setMobileOpen(false)} className="text-muted">
                <X size={16} />
              </button>
            </div>
            <nav className="flex-1 space-y-0.5 px-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-[10px] px-2.5 py-2 text-[13px] text-muted hover:bg-surface-2 hover:text-text"
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-bg/90 px-4 backdrop-blur-md">
          <button
            className="text-muted md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon size={18} />
          </button>
          <button
            className="hidden text-muted hover:text-text md:inline-flex"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Collapse sidebar"
          >
            <PanelLeft size={16} />
          </button>
          <nav className="hidden min-w-0 items-center gap-2 text-[12px] text-muted sm:flex">
            {crumbs.map((c, i) => (
              <span key={c.href} className="flex items-center gap-2">
                {i > 0 && <span className="text-faint">/</span>}
                <Link href={c.href} className="truncate hover:text-text">
                  {c.label}
                </Link>
              </span>
            ))}
          </nav>
          <SearchButton />
          <div className="ml-auto flex items-center gap-1">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-[10px] text-muted hover:bg-surface-2 hover:text-text lg:hidden"
              onClick={openCommandPalette}
              aria-label="Search"
            >
              <Search size={16} />
            </button>
            <Link
              href="/app/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-[10px] text-muted hover:bg-surface-2 hover:text-text"
            >
              <Bell size={16} />
              {notifications.some((n) => !n.read) ? (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
              ) : null}
            </Link>
            <Link
              href="/app/help"
              className="flex h-9 w-9 items-center justify-center rounded-[10px] text-muted hover:bg-surface-2 hover:text-text"
            >
              <CircleHelp size={16} />
            </Link>
            <Menu
              header={profileHeader}
              trigger={
                <button
                  className="ml-1 flex items-center rounded-full outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-accent"
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
              items={[
                { label: "Profile", href: "/app/settings" },
                { label: "Billing", href: "/app/billing" },
                { label: "Sign out", href: "/api/logout", danger: true },
              ]}
            />
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
      <TrialGate />
    </div>
  );
}

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/app"
      className={cn(
        "flex h-14 items-center gap-2.5 border-b border-border px-4",
        collapsed && "justify-center px-0",
      )}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[11px] font-semibold text-white">
        PS
      </span>
      {!collapsed && (
        <span className="text-[13px] font-medium tracking-tight">
          PeopleSearch <span className="text-muted">Pro</span>
        </span>
      )}
    </Link>
  );
}

function ProfileBlock({
  collapsed,
  user,
}: {
  collapsed: boolean;
  user: CurrentUser | null;
}) {
  const menu = (trigger: React.ReactNode) => (
    <Menu
      header={
        <div className="min-w-0">
          <p className="truncate text-text">{user?.name || "Account"}</p>
          <p className="truncate">{user?.email ?? "—"}</p>
        </div>
      }
      items={[
        { label: "Profile", href: "/app/settings" },
        { label: "Billing", href: "/app/billing" },
        { label: "Sign out", href: "/api/logout", danger: true },
      ]}
      trigger={trigger}
    />
  );

  if (collapsed) {
    return (
      <div className="flex justify-center">
        {menu(
          <button aria-label="Account menu" className="outline-none">
            <UserAvatar
              name={user?.name}
              email={user?.email}
              image={user?.image}
              size={28}
            />
          </button>,
        )}
      </div>
    );
  }

  return menu(
    <button className="flex w-full items-center gap-2.5 rounded-[10px] p-1 text-left outline-none hover:bg-surface-2">
      <UserAvatar name={user?.name} email={user?.email} image={user?.image} size={32} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px]">{user?.name || "Account"}</span>
        <span className="block truncate text-[11px] text-muted">{user?.email ?? "—"}</span>
      </span>
    </button>,
  );
}

function SearchButton() {
  return (
    <button
      onClick={openCommandPalette}
      className="ml-auto hidden h-9 min-w-[200px] items-center gap-2 rounded-[10px] border border-border bg-surface px-3 text-[12px] text-faint lg:ml-6 lg:flex"
    >
      <Search size={14} />
      Search
      <span className="ml-auto rounded border border-border px-1 font-mono text-[10px]">
        ⌘K
      </span>
    </button>
  );
}

function breadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const acc: { href: string; label: string }[] = [];
  let href = "";
  for (const p of parts) {
    href += `/${p}`;
    acc.push({
      href,
      label: p.startsWith("RPT") || p.startsWith("inv") ? p : pretty(p),
    });
  }
  return acc;
}

function pretty(s: string) {
  if (s === "app") return "Workspace";
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
