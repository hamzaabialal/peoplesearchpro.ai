"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { investigations, reportsIndex, savedPeople } from "@/lib/data/mock";
import { COMMAND_PALETTE_EVENT } from "@/hooks/use-command-palette";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(COMMAND_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(COMMAND_PALETTE_EVENT, onOpen);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
      <Command
        className="absolute left-1/2 top-[18%] w-[min(560px,calc(100vw-24px))] -translate-x-1/2 overflow-hidden rounded-[14px] border border-border-strong bg-surface shadow-[var(--shadow)]"
        label="Command palette"
      >
        <Command.Input
          autoFocus
          placeholder="Search people, reports, investigations, settings…"
          className="h-12 w-full border-b border-border bg-transparent px-4 text-[14px] outline-none placeholder:text-faint"
        />
        <Command.List className="max-h-[380px] overflow-y-auto p-2 scrollbar-thin">
          <Command.Empty className="px-3 py-8 text-center text-[13px] text-muted">
            No matches
          </Command.Empty>
          <Command.Group heading="Quick actions" className="text-[11px] uppercase tracking-[0.12em] text-faint">
            <Item onSelect={() => go("/app/investigations/new")}>New Investigation</Item>
            <Item onSelect={() => go("/app/reports")}>View Reports</Item>
            <Item onSelect={() => go("/app/billing")}>Billing</Item>
            <Item onSelect={() => go("/app/settings")}>Settings</Item>
          </Command.Group>
          <Command.Group heading="People" className="mt-2 text-[11px] uppercase tracking-[0.12em] text-faint">
            {savedPeople.map((p) => (
              <Item key={p.id} onSelect={() => go("/app/people")}>
                {p.fullName}
              </Item>
            ))}
          </Command.Group>
          <Command.Group heading="Investigations" className="mt-2 text-[11px] uppercase tracking-[0.12em] text-faint">
            {investigations.map((i) => (
              <Item key={i.id} onSelect={() => go(`/app/investigations/${i.id}`)}>
                {i.person.fullName} · {i.id}
              </Item>
            ))}
          </Command.Group>
          <Command.Group heading="Reports" className="mt-2 text-[11px] uppercase tracking-[0.12em] text-faint">
            {reportsIndex.map((r) => (
              <Item key={r.id} onSelect={() => go(`/app/reports/${r.id}`)}>
                {r.person} · {r.id}
              </Item>
            ))}
          </Command.Group>
          <Command.Group heading="Settings" className="mt-2 text-[11px] uppercase tracking-[0.12em] text-faint">
            <Item onSelect={() => go("/app/settings")}>Workspace settings</Item>
            <Item onSelect={() => go("/app/notifications")}>Notifications</Item>
            <Item onSelect={() => go("/app/billing")}>Plan & credits</Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}

function Item({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center rounded-md px-3 py-2 text-[13px] text-text data-[selected=true]:bg-surface-2"
    >
      {children}
    </Command.Item>
  );
}
