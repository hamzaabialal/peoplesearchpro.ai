import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-[10px] border border-border bg-surface px-3 text-[13px] text-text outline-none focus:border-accent/50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
