import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-[11px] font-semibold text-white">
            PS
          </span>
          <span className="text-[13px] font-medium">
            PeopleSearch <span className="text-muted">Pro</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-[13px] text-muted md:flex">
          <Link href="/how-it-works" className="hover:text-text">
            How it works
          </Link>
          <Link href="/pricing" className="hover:text-text">
            Pricing
          </Link>
          <Link href="/security" className="hover:text-text">
            Security
          </Link>
          <Link href="/sample-report" className="hover:text-text">
            Sample report
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/login" className="px-3 py-1.5 text-[13px] text-muted hover:text-text">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-[10px] bg-accent px-3 py-1.5 text-[13px] font-medium text-white"
          >
            Start Investigation
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border py-10 text-[12px] text-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:justify-between">
        <p>PeopleSearch Pro · Demonstration data only · Not a consumer reporting agency</p>
        <div className="flex gap-4">
          <Link href="/security">Security</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/login">Sign in</Link>
        </div>
      </div>
    </footer>
  );
}
