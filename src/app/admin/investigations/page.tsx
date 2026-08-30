import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { InvestigationList } from "@/features/investigations/list";
import { investigations } from "@/lib/data/mock";

export default function Page() {
  return (
    <div>
      <PageHeader title="Investigations" subtitle="All workspaces · demonstration queue." />
      <Card className="mt-8">
        <InvestigationList items={investigations} />
      </Card>
    </div>
  );
}
