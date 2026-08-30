import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InvestigationList } from "@/features/investigations/list";
import { investigations } from "@/lib/data/mock";
import Link from "next/link";

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[24px] font-medium tracking-tight">Investigations</h1>
          <p className="mt-1 text-[13px] text-muted">Pipeline of identity research jobs</p>
        </div>
        <Button asChild>
          <Link href="/app/investigations/new">+ New Investigation</Link>
        </Button>
      </div>
      <Card className="mt-6">
        <InvestigationList items={investigations} />
      </Card>
    </div>
  );
}
