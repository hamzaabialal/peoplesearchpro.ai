import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

/** Admin: reverse a commission (e.g. subscription cancelled inside the window). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { status, reason } = (body ?? {}) as { status?: string; reason?: string };
  if (status !== "reversed") {
    return NextResponse.json({ error: "Only 'reversed' is supported" }, { status: 400 });
  }

  const rows = await sql`
    UPDATE commissions
    SET status = 'reversed',
        reversal_reason = ${reason ?? "Cancelled within the reversal window — reversed by admin."}
    WHERE id = ${id}
    RETURNING id, status, reversal_reason
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ commission: rows[0] });
}
