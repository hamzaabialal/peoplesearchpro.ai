import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

// Monthly recurring price per plan (matches the pricing catalogue).
const PLAN_PRICE: Record<string, number> = {
  starter: 49,
  professional: 149,
  business: 399,
  enterprise: 0,
};
const ACTIVE = new Set(["active", "trialing"]);

/** Last N month keys, oldest first, e.g. ["2026-04", ..., "2026-09"]. */
function recentMonths(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setUTCDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1));
    out.push(`${m.getUTCFullYear()}-${String(m.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    usersRow,
    byStatus,
    byPlan,
    reportsRow,
    invoicedRow,
    revenueRows,
    signupRows,
  ] = await Promise.all([
    sql`SELECT count(*)::int AS n FROM signups`,
    sql`SELECT status, count(*)::int AS n FROM subscriptions GROUP BY status`,
    sql`SELECT plan, status, count(*)::int AS n FROM subscriptions GROUP BY plan, status`,
    sql`
      SELECT count(*)::int AS total,
        count(*) FILTER (WHERE date_trunc('month', created_at) = date_trunc('month', now()))::int AS this_month,
        count(*) FILTER (WHERE created_at::date = current_date)::int AS today
      FROM reports
    `,
    sql`
      SELECT coalesce(sum(amount), 0)::float AS total,
        coalesce(sum(amount) FILTER (WHERE date_trunc('month', issued_at) = date_trunc('month', now())), 0)::float AS this_month
      FROM invoices WHERE status = 'paid'
    `,
    sql`
      SELECT to_char(date_trunc('month', issued_at), 'YYYY-MM') AS month,
             sum(amount)::float AS revenue
      FROM invoices
      WHERE issued_at >= date_trunc('month', now()) - interval '5 months'
      GROUP BY 1
    `,
    sql`
      SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
             count(*)::int AS count
      FROM signups
      WHERE created_at >= date_trunc('month', now()) - interval '5 months'
      GROUP BY 1
    `,
  ]);

  const statusCount = (s: string) =>
    (byStatus as { status: string; n: number }[])
      .filter((r) => r.status === s)
      .reduce((a, r) => a + r.n, 0);

  const mrr = (byPlan as { plan: string; status: string; n: number }[])
    .filter((r) => ACTIVE.has(r.status))
    .reduce((sum, r) => sum + (PLAN_PRICE[r.plan] ?? 0) * r.n, 0);

  const planTotals: Record<string, number> = {};
  for (const r of byPlan as { plan: string; n: number }[]) {
    planTotals[r.plan] = (planTotals[r.plan] ?? 0) + r.n;
  }

  const months = recentMonths(6);
  const revByMonth = new Map(
    (revenueRows as { month: string; revenue: number }[]).map((r) => [r.month, r.revenue]),
  );
  const signupByMonth = new Map(
    (signupRows as { month: string; count: number }[]).map((r) => [r.month, r.count]),
  );

  return NextResponse.json({
    totals: {
      users: usersRow[0].n,
      activeSubscribers: statusCount("active") + statusCount("trialing"),
      pastDue: statusCount("past_due"),
      canceled: statusCount("canceled"),
      mrr,
      reports: reportsRow[0].total,
      reportsThisMonth: reportsRow[0].this_month,
      reportsToday: reportsRow[0].today,
      invoicedTotal: invoicedRow[0].total,
      invoicedThisMonth: invoicedRow[0].this_month,
    },
    // Cost + provider telemetry. These stay empty until a data provider is
    // connected and per-report cost tracking is recorded; the Overview shows
    // an "unavailable" state for each while `connected` is false.
    integrations: {
      costTracking: { connected: false },
      providers: [] as { name: string; requestsToday: number; errorRate: number }[],
    },
    apiSpend: null as number | null,
    aiSpend: null as number | null,
    avgReportCost: null as number | null,
    costByMonth: months.map((m) => ({ month: m.slice(5), api: 0, cost: 0 })),
    failedByMonth: months.map((m) => ({ month: m.slice(5), failed: 0 })),
    costMix: [] as { label: string; amount: number }[],
    revenueByMonth: months.map((m) => ({ month: m.slice(5), revenue: revByMonth.get(m) ?? 0 })),
    signupsByMonth: months.map((m) => ({ month: m.slice(5), signups: signupByMonth.get(m) ?? 0 })),
    byPlan: ["starter", "professional", "business", "enterprise"]
      .filter((p) => planTotals[p])
      .map((p) => ({ label: p[0].toUpperCase() + p.slice(1), amount: planTotals[p] })),
    byStatus: ["active", "trialing", "past_due", "canceled"]
      .map((s) => ({ label: s.replace("_", " "), amount: statusCount(s) }))
      .filter((r) => r.amount > 0),
  });
}
