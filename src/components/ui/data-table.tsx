"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  /** Plain-text value — used for keyword search and as the default cell content. */
  value: (row: T) => string;
  /**
   * Optional custom cell content (badges, links, multi-line notes, ...).
   * Falls back to `value(row)` with the search term highlighted. Receives
   * the live search query so custom renders can highlight their own text
   * with `highlightMatch(text, query)`.
   */
  render?: (row: T, query: string) => React.ReactNode;
  align?: "left" | "right";
  className?: string;
};

/**
 * Wraps every case-insensitive occurrence of `query` in `text` with a
 * yellow `<mark>`. Returns `text` unchanged when there's no query.
 */
export function highlightMatch(text: string, query: string): React.ReactNode {
  const q = query.trim();
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="rounded-[2px] bg-warning/50 text-text">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

/**
 * Generic searchable, paginated table — search bar, "N items found", rows-per-page
 * selector, and Previous/Next paging, all client-side. Pass `null` for `data`
 * while loading.
 */
export function DataTable<T>({
  columns,
  data,
  getRowKey,
  searchPlaceholder = "Search by keyword",
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 10,
  emptyMessage = "No records found.",
}: {
  columns: DataTableColumn<T>[];
  data: T[] | null;
  getRowKey: (row: T) => string | number;
  searchPlaceholder?: string;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  emptyMessage?: string;
}) {
  const [query, setQuery] = useState("");
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [page, setPage] = useState(1);

  const rows = data ?? [];
  const loading = data === null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => columns.some((col) => col.value(row).toLowerCase().includes(q)));
  }, [rows, query, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Jump back to page 1 whenever the search or page size changes, so the
  // user never lands on a now-empty page.
  useEffect(() => {
    setPage(1);
  }, [query, pageSize]);

  return (
    <div>
      <div className="relative mb-3 max-w-sm">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
              {columns.map((col) => (
                <th key={col.key} className={cn("px-4 py-3", col.align === "right" && "text-right")}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted" colSpan={columns.length}>
                  Loading…
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted" colSpan={columns.length}>
                  {query ? "No records match your search." : emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr key={getRowKey(row)} className="border-b border-border/80 hover:bg-surface-2/50">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3", col.align === "right" && "text-right", col.className)}
                    >
                      {col.render ? col.render(row, query) : highlightMatch(col.value(row), query)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-[12px] text-muted">
          <span>
            {loading ? "…" : filtered.length} item{filtered.length === 1 ? "" : "s"} found
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5">
              Rows per page
              <Select
                value={String(pageSize)}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-8 w-auto py-0 pr-7 text-[12px]"
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="rounded-md border border-border px-2 py-1 disabled:opacity-40 hover:bg-surface-2"
              >
                Previous
              </button>
              <span className="tabular-nums">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-md border border-border px-2 py-1 disabled:opacity-40 hover:bg-surface-2"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
