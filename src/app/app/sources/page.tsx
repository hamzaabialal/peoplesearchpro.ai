import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { providers } from "@/lib/data/mock";
import { formatDateTime } from "@/lib/utils";

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Data sources"
        subtitle="Approved providers used by this workspace. Credentials are never displayed."
      />
      <div className="mt-8 grid gap-3 md:grid-cols-2">
        {providers.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start justify-between">
              <h2 className="text-[15px]">{p.name}</h2>
              <Badge
                tone={p.status === "healthy" ? "success" : p.status === "degraded" ? "warning" : "muted"}
              >
                {p.status}
              </Badge>
            </div>
            <p className="mt-3 text-[12px] text-muted">
              Last request {formatDateTime(p.lastRequestAt)}
            </p>
            <p className="mt-1 text-[12px] text-muted">
              Requests today {p.requestsToday} · Error rate {p.errorRate}%
            </p>
            {p.alert ? <p className="mt-3 text-[12px] text-warning">{p.alert}</p> : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
