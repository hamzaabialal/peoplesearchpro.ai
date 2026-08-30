import { ReportView } from "@/features/reports/report-view";
import { MarketingFooter, MarketingHeader } from "@/layouts/marketing";
import { sampleReport } from "@/lib/data/mock";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sample report" };

export default function Page() {
  return (
    <div className="min-h-screen bg-bg">
      <MarketingHeader />
      <main className="px-4 py-10 md:px-8">
        <ReportView report={sampleReport} sample />
      </main>
      <MarketingFooter />
    </div>
  );
}
