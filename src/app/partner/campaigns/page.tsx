import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { campaigns } from "@/lib/data/mock";

export default function Page() {
  return (
    <div>
      <PageHeader title="Campaigns" subtitle="Tracked partner codes." />
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {campaigns.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex justify-between">
              <h2 className="text-[15px]">{c.name}</h2>
              <Badge tone={c.active ? "success" : "muted"}>{c.active ? "Active" : "Off"}</Badge>
            </div>
            <p className="mt-2 font-mono text-[12px] text-muted">{c.code}</p>
            <p className="mt-4 text-[13px]">
              {c.clicks} clicks · {c.conversions} conversions
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
