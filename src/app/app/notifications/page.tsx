import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { notifications } from "@/lib/data/mock";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle="Report completed, subscription, payment, credits, and affiliate events."
      />
      <div className="mt-8 space-y-3">
        {notifications.map((n) => (
          <Link key={n.id} href={n.href ?? "/app"}>
            <Card className="mb-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[14px]">{n.title}</p>
                  <p className="mt-1 text-[13px] text-muted">{n.body}</p>
                </div>
                {!n.read ? <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" /> : null}
              </div>
              <p className="mt-3 text-[11px] text-faint">{formatDateTime(n.at)}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
