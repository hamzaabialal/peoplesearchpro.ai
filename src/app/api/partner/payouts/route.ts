import { db } from "@/lib/db";
import { commissions, payouts, referrals } from "@/lib/db/schema";
import { requireAffiliate } from "@/lib/referrals";
import { and, desc, eq, isNull, ne } from "drizzle-orm";
import { jsonNoStore } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requireAffiliate();
  if (!ctx) return jsonNoStore({ error: "Unauthorized" }, { status: 401 });

  // Real transfers — a payout row exists once an admin marks a commission paid.
  const transferredRows = await db
    .select({
      id: payouts.id,
      amount: payouts.amount,
      status: payouts.status,
      date: payouts.date,
      method: payouts.method,
      commissionId: payouts.commissionId,
      referralLabel: referrals.customerLabel,
    })
    .from(payouts)
    .leftJoin(commissions, eq(payouts.commissionId, commissions.id))
    .leftJoin(referrals, eq(commissions.referralId, referrals.id))
    .where(eq(payouts.affiliateId, ctx.affiliate.id))
    .orderBy(desc(payouts.date));

  // Money that's been earned but not transferred yet — a commission with no
  // payout behind it (and not reversed). Surfaced here too, so this page is
  // the one place that shows "transferred" vs. "still pending" for every
  // commission.
  const pendingRows = await db
    .select({
      id: commissions.id,
      amount: commissions.amount,
      status: commissions.status,
      period: commissions.period,
      createdAt: commissions.createdAt,
      referralLabel: referrals.customerLabel,
    })
    .from(commissions)
    .innerJoin(referrals, eq(commissions.referralId, referrals.id))
    .leftJoin(payouts, eq(payouts.commissionId, commissions.id))
    .where(
      and(
        eq(commissions.affiliateId, ctx.affiliate.id),
        isNull(payouts.id),
        ne(commissions.status, "reversed"),
      ),
    )
    .orderBy(desc(commissions.createdAt));

  return jsonNoStore({
    transferred: transferredRows.map((p) => ({
      id: `PO-${p.id}`,
      amount: Number(p.amount),
      status: p.status,
      date: p.date,
      method: p.method ?? "—",
      commission: p.commissionId
        ? { id: `COM-${p.commissionId}`, referral: p.referralLabel }
        : null,
    })),
    pending: pendingRows.map((c) => ({
      id: `COM-${c.id}`,
      amount: Number(c.amount),
      status: c.status,
      period: c.period ?? "—",
      date: c.createdAt,
      referral: c.referralLabel,
    })),
  });
}
