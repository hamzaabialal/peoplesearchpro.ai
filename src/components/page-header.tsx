export function PageHeader({
  kicker,
  title,
  subtitle,
  action,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker ? (
          <p className="text-[11px] uppercase tracking-[0.16em] text-faint">{kicker}</p>
        ) : null}
        <h1 className="mt-1 text-[24px] font-medium tracking-tight md:text-[26px]">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-2xl text-[13px] text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
