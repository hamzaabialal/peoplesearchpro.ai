import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/server";
import { writeAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/**
 * Admin: move a commission to "reversed" (e.g. subscription cancelled inside
 * the window) or "paid". Marking a commission paid also transfers it —
 * creates the matching `payouts` row (amount, method from the affiliate's
 * saved payout method) so Payouts shows exactly which commission each
 * transfer came from. Idempotent: re-marking an already-paid commission
 * paid won't create a second payout (payouts.commission_id is unique).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) {
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
  if (status !== "reversed" && status !== "paid") {
    return NextResponse.json({ error: "Only 'reversed' or 'paid' are supported" }, { status: 400 });
  }

  if (status === "reversed") {
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
    await writeAudit(admin.email, "Reversed commission", `COM-${id}`, { reason: reason ?? null });
    return NextResponse.json({ commission: rows[0] });
  }

  // status === "paid"
  const rows = await sql`
    UPDATE commissions SET status = 'paid'
    WHERE id = ${id}
    RETURNING id, status, affiliate_id, amount
  `;
  const commission = rows[0] as
    | { id: number; status: string; affiliate_id: number; amount: string }
    | undefined;
  if (!commission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [affiliate] = await sql`
    SELECT payout_method FROM affiliates WHERE id = ${commission.affiliate_id}
  `;

  const payoutRows = await sql`
    INSERT INTO payouts (affiliate_id, commission_id, amount, status, method)
    VALUES (${commission.affiliate_id}, ${commission.id}, ${commission.amount}, 'paid', ${affiliate?.payout_method ?? null})
    ON CONFLICT (commission_id) DO NOTHING
    RETURNING id
  `;

  await writeAudit(admin.email, "Marked commission paid", `COM-${id}`, {
    payoutCreated: payoutRows.length > 0,
  });

  return NextResponse.json({ commission: { id: commission.id, status: commission.status } });
}
