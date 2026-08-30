import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfidenceMeter } from "@/components/ui/status";
import { savedPeople } from "@/lib/data/mock";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Saved people"
        subtitle="Subjects previously investigated in this workspace. Fictional demo identities."
        action={
          <Button asChild>
            <Link href="/app/investigations/new">+ New Investigation</Link>
          </Button>
        }
      />
      <div className="mt-8 hidden overflow-x-auto md:block">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
              <th className="py-3 pr-4">Person</th>
              <th className="py-3 pr-4">Location</th>
              <th className="py-3 pr-4">Employer</th>
              <th className="py-3 pr-4">Reports</th>
              <th className="py-3 pr-4">Confidence</th>
              <th className="py-3">Last investigated</th>
            </tr>
          </thead>
          <tbody>
            {savedPeople.map((p) => (
              <tr key={p.id} className="border-b border-border/80 hover:bg-surface-2/50">
                <td className="py-3 pr-4">
                  <p>{p.fullName}</p>
                  <p className="text-[12px] text-muted">{p.title}</p>
                </td>
                <td className="py-3 pr-4 text-muted">{p.location}</td>
                <td className="py-3 pr-4">{p.employer}</td>
                <td className="py-3 pr-4">{p.reportsCount}</td>
                <td className="py-3 pr-4">
                  <ConfidenceMeter value={p.confidence} size="sm" />
                </td>
                <td className="py-3 text-muted">{formatDate(p.lastInvestigatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 space-y-3 md:hidden">
        {savedPeople.map((p) => (
          <Card key={p.id} className="p-4">
            <p>{p.fullName}</p>
            <p className="mt-1 text-[12px] text-muted">
              {p.employer} · {p.location}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
