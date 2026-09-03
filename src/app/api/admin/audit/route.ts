import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

/** Admin: paginated audit trail with actor + free-text filters. */
export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const actor = (searchParams.get("actor") ?? "").trim().toLowerCase();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const like = `%${q}%`;
  const actorLike = `%${actor}%`;

  const rows = await sql`
    SELECT id, actor, action, target, metadata, created_at
    FROM audit_logs
    WHERE (${q} = '' OR lower(action) LIKE ${like} OR lower(coalesce(target, '')) LIKE ${like})
      AND (${actor} = '' OR lower(actor) LIKE ${actorLike})
    ORDER BY created_at DESC, id DESC
    LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}
  `;
  const totalRow = await sql`
    SELECT count(*)::int AS n FROM audit_logs
    WHERE (${q} = '' OR lower(action) LIKE ${like} OR lower(coalesce(target, '')) LIKE ${like})
      AND (${actor} = '' OR lower(actor) LIKE ${actorLike})
  `;
  const actorsRow = await sql`SELECT DISTINCT actor FROM audit_logs ORDER BY actor`;

  return NextResponse.json({
    rows,
    total: totalRow[0].n,
    page,
    pageSize: PAGE_SIZE,
    actors: (actorsRow as { actor: string }[]).map((r) => r.actor),
  });
}
