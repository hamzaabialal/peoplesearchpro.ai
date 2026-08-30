import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-[12px] text-accent-2">404</p>
      <h1 className="mt-2 text-[22px] font-medium">This record is not in the workspace</h1>
      <p className="mt-2 max-w-md text-[13px] text-muted">
        The page may have been moved, or the demonstration dataset does not include this identifier.
      </p>
      <Link href="/app" className="mt-6 text-[13px] text-accent-2">
        Return to workspace
      </Link>
    </div>
  );
}
