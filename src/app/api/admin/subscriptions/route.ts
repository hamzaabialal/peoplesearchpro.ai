import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const STATUSES = ["active", "trialing", "past_due", "canceled"];
const PLANS = ["starter", "professional", "business", "enterprise"];

/** Admin: paginated, filterable subscriptions joined to their account. */
export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const status = searchParams.get("status") ?? "";
  const plan = searchParams.get("plan") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const like = `%${q}%`;
  const statusFilter = STATUSES.includes(status) ? status : null;
  const planFilter = PLANS.includes(plan) ? plan : null;
  const offset = (page - 1) * PAGE_SIZE;

  // The neon() tagged template can't compose fragments, so the filter
  // predicate is repeated in both queries.
  const rows = await sql`
    SELECT s.id, s.plan, s.status, s.current_period_end, s.created_at,
           g.id AS user_id, g.name, g.email
    FROM subscriptions s
    JOIN signups g ON g.id = s.user_id
    WHERE (${q} = '' OR lower(g.name) LIKE ${like} OR lower(g.email) LIKE ${like})
      AND (${statusFilter}::text IS NULL OR s.status = ${statusFilter})
      AND (${planFilter}::text IS NULL OR s.plan = ${planFilter})
    ORDER BY s.created_at DESC
    LIMIT ${PAGE_SIZE} OFFSET ${offset}
  `;

  const totalRow = await sql`
    SELECT count(*)::int AS n
    FROM subscriptions s
    JOIN signups g ON g.id = s.user_id
    WHERE (${q} = '' OR lower(g.name) LIKE ${like} OR lower(g.email) LIKE ${like})
      AND (${statusFilter}::text IS NULL OR s.status = ${statusFilter})
      AND (${planFilter}::text IS NULL OR s.plan = ${planFilter})
  `;

  return NextResponse.json({
    rows,
    total: totalRow[0].n,
    page,
    pageSize: PAGE_SIZE,
  });
}
