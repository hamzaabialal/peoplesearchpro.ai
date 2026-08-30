import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { adminUsers } from "@/lib/data/mock";
import { formatDateTime } from "@/lib/utils";

export default function Page() {
  return (
    <div>
      <PageHeader title="Subscriptions" subtitle="Active, trial, past due, and suspended workspaces." />
      <Card className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Credits remaining</th>
              <th className="px-4 py-3">Last active</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((u) => (
              <tr key={u.id} className="border-b border-border/80">
                <td className="px-4 py-3">
                  {u.name}
                  <div className="text-[12px] text-muted">{u.email}</div>
                </td>
                <td className="px-4 py-3 capitalize">{u.plan}</td>
                <td className="px-4 py-3">
                  <Badge
                    tone={
                      u.status === "active"
                        ? "success"
                        : u.status === "past_due"
                          ? "warning"
                          : u.status === "suspended"
                            ? "danger"
                            : "accent"
                    }
                  >
                    {u.status.replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3">{u.reportsRemaining}</td>
                <td className="px-4 py-3 text-muted">{formatDateTime(u.lastActiveAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
