import { PdfDocument } from "@/features/reports/pdf-document";
import { reportService } from "@/lib/services";
import { notFound } from "next/navigation";

export default async function PdfPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await reportService.get(id);
  if (!report) notFound();
  return <PdfDocument report={report} />;
}
