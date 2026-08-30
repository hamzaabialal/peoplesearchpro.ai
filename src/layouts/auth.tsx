import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-bg lg:grid-cols-[1.1fr_0.9fr]">
      <div className="relative hidden overflow-hidden border-r border-border lg:block">
        <div className="grid-noise absolute inset-0" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[11px] font-semibold text-white">
              PS
            </span>
            <span className="text-[13px]">PeopleSearch Pro</span>
          </Link>
          <div>
            <p className="max-w-sm text-[22px] font-medium leading-snug tracking-tight">
              Professional intelligence software for public identity research.
            </p>
            <p className="mt-4 max-w-sm text-[13px] text-muted">
              Verified sources and AI inference are never mixed. Demonstration accounts
              do not call live providers.
            </p>
          </div>
          <p className="text-[11px] text-faint">Fictional demo data only</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[400px]">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[11px] font-semibold">
              PS
            </span>
            <span className="text-[13px]">PeopleSearch Pro</span>
          </Link>
          <h1 className="text-[24px] font-medium tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-2 text-[13px] text-muted">{subtitle}</p> : null}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
