import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { HorizontalBars } from "@/components/ui/charts";
import { InvestigationStatusBadge, PipelineStatus } from "@/components/ui/status";
import { adminReports, perReportCosts, pipelineTemplate, sampleReport, systemLogs } from "@/lib/data/mock";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = adminReports.find((r) => r.id === id) ?? adminReports[0];
  if (!row) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        kicker="Report operations"
        title={row.id}
        subtitle={`${row.person} · ${row.user}`}
        action={
          <Button asChild variant="secondary">
            <Link href={`/app/reports/${sampleReport.id}`}>Open customer report</Link>
          </Button>
        }
      />
      <div className="mt-6 flex items-center gap-4 text-[13px]">
        <InvestigationStatusBadge status={row.status} />
        <span className="text-muted">Processing {row.processingSeconds}s</span>
        <span className="text-muted">Created {formatDateTime(row.createdAt)}</span>
      </div>

      <Card className="mt-8">
        <CardHeader title="Pipeline" subtitle="Stage completion for this job" />
        <ul className="divide-y divide-border">
          {pipelineTemplate.map((s) => (
            <li key={s.id} className="flex items-center justify-between px-5 py-3 text-[13px]">
              <span>{s.name}</span>
              <PipelineStatus status={row.status === "failed" && s.id === "identity" ? "failed" : "complete"} />
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Provider requests" />
          <ul className="space-y-2 px-5 py-4 text-[13px] text-muted">
            <li>People Data Labs — 200 · 1 match</li>
            <li>Search Provider — 200 · 28 documents</li>
            <li>Have I Been Pwned — 200 · 2 breaches</li>
            <li>Apify — 200 · social actors</li>
          </ul>
        </Card>
        <Card>
          <CardHeader title="Errors" />
          <div className="px-5 py-4 text-[13px] text-muted">
            {row.status === "failed"
              ? systemLogs.find((l) => l.level === "error")?.message
              : "No provider errors recorded for this job."}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="AI processing" subtitle="Tokenized synthesis, labeled as inference in the dossier" />
        <p className="px-5 py-4 text-[13px] text-muted">
          Narrative + behavior + interaction sections generated. Cost {formatCurrency(row.aiCost)}.
        </p>
      </Card>

      <Card className="mt-4 p-5">
        <h2 className="text-[14px] font-medium">Cost breakdown</h2>
        <div className="mt-4">
          <HorizontalBars data={perReportCosts} />
        </div>
        <p className="mt-4 text-[13px]">
          API {formatCurrency(row.apiCost)} · AI {formatCurrency(row.aiCost)} · Total{" "}
          {formatCurrency(row.totalCost)}
        </p>
      </Card>
    </div>
  );
}
