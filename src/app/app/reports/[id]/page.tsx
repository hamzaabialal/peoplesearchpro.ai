import { ReportView } from "@/features/reports/report-view";
import { sampleReport } from "@/lib/data/mock";
import { reportService } from "@/lib/services";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = (await reportService.get(id)) ?? (id === sampleReport.id ? sampleReport : null);
  if (!report) notFound();
  return <ReportView report={report} />;
}
