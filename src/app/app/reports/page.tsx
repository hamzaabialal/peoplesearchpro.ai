import { Card } from "@/components/ui/card";
import { ConfidenceMeter } from "@/components/ui/status";
import { reportsIndex } from "@/lib/data/mock";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-[24px] font-medium tracking-tight">Reports</h1>
      <p className="mt-1 text-[13px] text-muted">Completed digital identity dossiers</p>
      <div className="mt-6 hidden overflow-x-auto md:block">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
              <th className="py-3 pr-4">Person</th>
              <th className="py-3 pr-4">Report ID</th>
              <th className="py-3 pr-4">Sources</th>
              <th className="py-3 pr-4">Confidence</th>
              <th className="py-3">Generated</th>
            </tr>
          </thead>
          <tbody>
            {reportsIndex.map((r) => (
              <tr key={r.id} className="border-b border-border/80 hover:bg-surface-2/60">
                <td className="py-3 pr-4">
                  <Link href={`/app/reports/${r.id}`} className="hover:text-accent-2">
                    {r.person}
                  </Link>
                </td>
                <td className="py-3 pr-4 font-mono text-[12px] text-muted">{r.id}</td>
                <td className="py-3 pr-4">{r.sources}</td>
                <td className="py-3 pr-4">
                  <ConfidenceMeter value={r.confidence} size="sm" />
                </td>
                <td className="py-3 text-muted">{formatDate(r.generatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 space-y-3 md:hidden">
        {reportsIndex.map((r) => (
          <Link key={r.id} href={`/app/reports/${r.id}`}>
            <Card className="p-4">
              <p>{r.person}</p>
              <p className="mt-1 font-mono text-[11px] text-faint">{r.id}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
