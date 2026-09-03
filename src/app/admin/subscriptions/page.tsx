import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { adminUsers, partnerClients } from "@/lib/data/mock";
import { daysBetween, formatDateTime } from "@/lib/utils";

const statusTone: Record<string, string> = {
  active: "success",
  trial: "accent",
  past_due: "warning",
  suspended: "danger",
  cancelled: "danger",
};

const affiliateById = new Map(partnerClients.map((a) => [a.id, a]));

function reversalWindow(days: number | null) {
  if (days === null) return { label: "—", tone: "muted" };
  if (days <= 7) return { label: `Within 7 days (${days}d)`, tone: "danger" };
  if (days <= 30) return { label: `Within 30 days (${days}d)`, tone: "warning" };
  return { label: `Outside window (${days}d)`, tone: "muted" };
}

export default function Page() {
  return (
    <div>
      <PageHeader
        title="Subscriptions"
        subtitle="Active, trial, past due, suspended, and cancelled workspaces. Cancellations are tracked back to the originating click for commission review."
      />
      <Card className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.1em] text-faint">
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Click ID</th>
              <th className="px-4 py-3">Affiliate</th>
              <th className="px-4 py-3">Subscribed</th>
              <th className="px-4 py-3">Cancelled</th>
              <th className="px-4 py-3">Commission reversal</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((u) => {
              const days = u.cancelledAt ? daysBetween(u.subscribedAt, u.cancelledAt) : null;
              const window = reversalWindow(days);
              const affiliate = u.affiliateId ? affiliateById.get(u.affiliateId) : null;
              return (
                <tr key={u.id} className="border-b border-border/80">
                  <td className="px-4 py-3">
                    {u.name}
                    <div className="text-[12px] text-muted">{u.email}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{u.plan}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone[u.status]}>{u.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted">{u.clickId ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{affiliate ? affiliate.name : "—"}</td>
                  <td className="px-4 py-3 text-muted">{formatDateTime(u.subscribedAt)}</td>
                  <td className="px-4 py-3 text-muted">
                    {u.cancelledAt ? formatDateTime(u.cancelledAt) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {u.cancelledAt ? <Badge tone={window.tone}>{window.label}</Badge> : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <p className="mt-3 text-[12px] text-muted">
        A subscription automatically moves to Cancelled when the customer cancels — commonly within
        2–3 days of purchase. The Click ID links a cancellation back to the referring affiliate so
        commissions cancelled within 7 days (or up to 1 month) can be reviewed for reversal in{" "}
        <span className="text-text">Affiliates → Referrals &amp; commissions</span>.
      </p>
    </div>
  );
}
