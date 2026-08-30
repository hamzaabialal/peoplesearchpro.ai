import { cn } from "@/lib/utils";
import type { AttributionKind } from "@/types";

const styles: Record<string, string> = {
  verified: "bg-success-dim text-success border-success/20",
  ai: "bg-accent-dim text-accent-2 border-accent/25",
  inference: "bg-accent-dim text-accent-2 border-accent/25",
  possible_match: "bg-warning-dim text-warning border-warning/25",
  unverified: "bg-surface-3 text-muted border-border-strong",
  public: "bg-surface-2 text-muted border-border-strong",
  success: "bg-success-dim text-success border-success/20",
  warning: "bg-warning-dim text-warning border-warning/25",
  danger: "bg-danger-dim text-danger border-danger/25",
  muted: "bg-surface-3 text-muted border-border",
  accent: "bg-accent-dim text-accent-2 border-accent/25",
};

const labels: Record<AttributionKind, string> = {
  verified: "Verified source",
  ai: "AI-generated",
  inference: "Inference",
  possible_match: "Possible match",
  unverified: "Unverified",
  public: "Public source",
};

export function Badge({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em]",
        styles[tone] ?? styles.muted,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function AttributionBadge({ kind }: { kind: AttributionKind }) {
  return <Badge tone={kind}>{labels[kind]}</Badge>;
}
