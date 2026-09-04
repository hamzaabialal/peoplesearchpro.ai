import { db } from "@/lib/db";
import { commissions, referrals } from "@/lib/db/schema";
import { requireAffiliate } from "@/lib/referrals";
import { desc, eq } from "drizzle-orm";
import { jsonNoStore } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requireAffiliate();
  if (!ctx) return jsonNoStore({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({
      id: commissions.id,
      amount: commissions.amount,
      status: commissions.status,
      period: commissions.period,
      reversalReason: commissions.reversalReason,
      customerLabel: referrals.customerLabel,
    })
    .from(commissions)
    .innerJoin(referrals, eq(commissions.referralId, referrals.id))
    .where(eq(commissions.affiliateId, ctx.affiliate.id))
    .orderBy(desc(commissions.createdAt));

  return jsonNoStore({
    commissions: rows.map((c) => ({
      id: `COM-${c.id}`,
      referral: c.customerLabel,
      period: c.period ?? "—",
      amount: Number(c.amount),
      status: c.status,
      reversalReason: c.reversalReason,
    })),
  });
}
