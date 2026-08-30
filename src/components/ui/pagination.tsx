export function Pagination({
  page = 1,
  pages = 1,
}: {
  page?: number;
  pages?: number;
}) {
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-[12px] text-muted">
      <span>
        Page {page} of {pages}
      </span>
      <div className="flex gap-2">
        <button type="button" disabled className="rounded-md border border-border px-2 py-1 disabled:opacity-40">
          Previous
        </button>
        <button type="button" className="rounded-md border border-border px-2 py-1 hover:bg-surface-2">
          Next
        </button>
      </div>
    </div>
  );
}
