"use client";

import { cn } from "@/lib/utils";
import type { InvestigationStatus, PipelineStageStatus } from "@/types";

const inv: Record<InvestigationStatus, { label: string; className: string }> = {
  completed: { label: "Completed", className: "text-success" },
  analyzing: { label: "Analyzing", className: "text-accent-2" },
  collecting: { label: "Collecting", className: "text-warning" },
  queued: { label: "Queued", className: "text-muted" },
  failed: { label: "Failed", className: "text-danger" },
};

const pipe: Record<PipelineStageStatus, { label: string; className: string }> = {
  complete: { label: "Complete", className: "text-success" },
  processing: { label: "Processing", className: "text-accent-2" },
  waiting: { label: "Waiting", className: "text-faint" },
  failed: { label: "Failed", className: "text-danger" },
};

export function StatusDot({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block h-1.5 w-1.5 rounded-full bg-current", className)}
    />
  );
}

export function InvestigationStatusBadge({
  status,
}: {
  status: InvestigationStatus;
}) {
  const s = inv[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium", s.className)}>
      <StatusDot className={status === "analyzing" || status === "collecting" ? "animate-pulse" : ""} />
      {s.label}
    </span>
  );
}

export function PipelineStatus({ status }: { status: PipelineStageStatus }) {
  const s = pipe[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px]", s.className)}>
      <StatusDot className={status === "processing" ? "animate-pulse" : ""} />
      {s.label}
    </span>
  );
}

export function ConfidenceMeter({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md" | "lg";
}) {
  const tone =
    value >= 80 ? "bg-success" : value >= 55 ? "bg-warning" : "bg-danger";
  const h = size === "lg" ? "h-2" : size === "sm" ? "h-1" : "h-1.5";
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-20 overflow-hidden rounded-full bg-surface-3", h)}>
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="tabular-nums text-[12px] text-muted">{value}%</span>
    </div>
  );
}

export function ConfidenceRing({ value, label }: { value: number; label?: string }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color =
    value >= 80 ? "var(--success)" : value >= 55 ? "var(--warning)" : "var(--danger)";
  return (
    <div className="relative h-[96px] w-[96px]">
      <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="6" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[18px] font-medium tabular-nums">{value}</span>
        <span className="text-[9px] uppercase tracking-[0.14em] text-faint">
          {label ?? "conf"}
        </span>
      </div>
    </div>
  );
}
