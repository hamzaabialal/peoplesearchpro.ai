import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-3", className)}
    />
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-[15px] font-medium">{title}</p>
      <p className="mt-2 max-w-md text-[13px] text-muted">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  what,
  provider,
  onRetry,
}: {
  title?: string;
  what: string;
  provider?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-[12px] border border-danger/25 bg-danger-dim p-6">
      <p className="text-[14px] font-medium text-danger">{title}</p>
      <p className="mt-2 text-[13px] text-text">{what}</p>
      {provider ? (
        <p className="mt-1 text-[12px] text-muted">Provider affected: {provider}</p>
      ) : null}
      <div className="mt-4 flex gap-2">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="h-8 rounded-[8px] border border-border-strong bg-surface px-3 text-[12px]"
          >
            Retry
          </button>
        ) : null}
        <a
          href="mailto:support@peoplesearchpro.ai"
          className="inline-flex h-8 items-center rounded-[8px] px-3 text-[12px] text-muted hover:text-text"
        >
          Contact support
        </a>
      </div>
    </div>
  );
}
