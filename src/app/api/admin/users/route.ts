import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const ROLES = ["customer", "partner", "admin"];

/** Admin: paginated, filterable list of real accounts (the `signups` table). */
export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const role = searchParams.get("role") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const like = `%${q}%`;
  const roleFilter = ROLES.includes(role) ? role : null;

  const rows = await sql`
    SELECT g.id, g.name, g.email, g.role, g.image, g.created_at,
           s.plan, s.status AS subscription_status
    FROM signups g
    LEFT JOIN LATERAL (
      SELECT plan, status FROM subscriptions
      WHERE user_id = g.id ORDER BY created_at DESC LIMIT 1
    ) s ON true
    WHERE (${q} = '' OR lower(g.name) LIKE ${like} OR lower(g.email) LIKE ${like})
      AND (${roleFilter}::text IS NULL OR g.role = ${roleFilter})
    ORDER BY g.created_at DESC
    LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}
  `;

  const totalRow = await sql`
    SELECT count(*)::int AS n
    FROM signups g
    WHERE (${q} = '' OR lower(g.name) LIKE ${like} OR lower(g.email) LIKE ${like})
      AND (${roleFilter}::text IS NULL OR g.role = ${roleFilter})
  `;

  return NextResponse.json({
    rows,
    total: totalRow[0].n,
    page,
    pageSize: PAGE_SIZE,
  });
}
