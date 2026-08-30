"use client";

import { InvestigationStatusBadge, ConfidenceMeter } from "@/components/ui/status";
import { formatDate } from "@/lib/utils";
import type { Investigation } from "@/types";
import { useRouter } from "next/navigation";

export function InvestigationList({ items }: { items: Investigation[] }) {
  const router = useRouter();
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[800px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
              <th className="px-4 py-3 font-medium">Person</th>
              <th className="px-4 py-3 font-medium">Investigation</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Sources</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr
                key={i.id}
                className="cursor-pointer border-b border-border/80 hover:bg-surface-2/70"
                onClick={() =>
                  router.push(
                    i.reportId ? `/app/reports/${i.reportId}` : `/app/investigations/${i.id}`,
                  )
                }
              >
                <td className="px-4 py-3">
                  <p>{i.person.fullName}</p>
                  <p className="text-[12px] text-muted">{i.person.employer}</p>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-muted">{i.id}</td>
                <td className="px-4 py-3">
                  <InvestigationStatusBadge status={i.status} />
                </td>
                <td className="px-4 py-3 tabular-nums">{i.sourcesChecked}</td>
                <td className="px-4 py-3">
                  <ConfidenceMeter value={i.confidence} size="sm" />
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(i.createdAt)}</td>
                <td className="px-4 py-3 text-accent-2">Open</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {items.map((i) => (
          <button
            key={i.id}
            type="button"
            onClick={() =>
              router.push(i.reportId ? `/app/reports/${i.reportId}` : `/app/investigations/${i.id}`)
            }
            className="w-full rounded-[12px] border border-border bg-surface p-4 text-left"
          >
            <div className="flex justify-between gap-2">
              <p className="text-[14px]">{i.person.fullName}</p>
              <InvestigationStatusBadge status={i.status} />
            </div>
            <p className="mt-1 text-[12px] text-muted">{i.person.employer}</p>
            <p className="mt-2 font-mono text-[11px] text-faint">{i.id}</p>
          </button>
        ))}
      </div>
    </>
  );
}
