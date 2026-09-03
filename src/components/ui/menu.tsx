"use client";

import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export function Menu({
  trigger,
  items,
  header,
}: {
  trigger: React.ReactNode;
  items: { label: string; onSelect?: () => void; href?: string; danger?: boolean }[];
  header?: React.ReactNode;
}) {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>{trigger}</Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          align="end"
          className="z-50 min-w-44 rounded-[10px] border border-border bg-surface p-1 shadow-[var(--shadow)]"
        >
          {header ? (
            <>
              <div className="px-3 py-2 text-[12px] leading-tight text-muted">{header}</div>
              <Dropdown.Separator className="my-1 h-px bg-border" />
            </>
          ) : null}
          {items.map((item) =>
            item.href ? (
              <Dropdown.Item key={item.label} asChild>
                <a
                  href={item.href}
                  className={cn(
                    "block rounded-md px-3 py-1.5 text-[13px] outline-none hover:bg-surface-2",
                    item.danger && "text-danger",
                  )}
                >
                  {item.label}
                </a>
              </Dropdown.Item>
            ) : (
              <Dropdown.Item
                key={item.label}
                onSelect={item.onSelect}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1.5 text-[13px] outline-none hover:bg-surface-2",
                  item.danger && "text-danger",
                )}
              >
                {item.label}
              </Dropdown.Item>
            ),
          )}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
