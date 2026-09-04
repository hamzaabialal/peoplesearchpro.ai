import { db } from "@/lib/db";
import { commissions, referrals } from "@/lib/db/schema";
import { referralLink, requestOrigin, requireAffiliate } from "@/lib/referrals";
import { and, count, eq, sql } from "drizzle-orm";
import { jsonNoStore } from "@/lib/http";

export const dynamic = "force-dynamic";

const COMMISSION_STATUSES = ["pending", "approved", "payable", "paid", "reversed"] as const;

export async function GET(request: Request) {
  const ctx = await requireAffiliate();
  if (!ctx) return jsonNoStore({ error: "Unauthorized" }, { status: 401 });
  const { affiliate } = ctx;

  const [signupsRow] = await db
    .select({ n: count() })
    .from(referrals)
    .where(eq(referrals.affiliateId, affiliate.id));

  const [activeRow] = await db
    .select({ n: count() })
    .from(referrals)
    .where(and(eq(referrals.affiliateId, affiliate.id), eq(referrals.status, "Active")));

  const commissionRows = await db
    .select({
      status: commissions.status,
      total: sql<string>`coalesce(sum(${commissions.amount}), 0)`,
    })
    .from(commissions)
    .where(eq(commissions.affiliateId, affiliate.id))
    .groupBy(commissions.status);

  const totals = Object.fromEntries(COMMISSION_STATUSES.map((s) => [s, 0])) as Record<
    (typeof COMMISSION_STATUSES)[number],
    number
  >;
  for (const row of commissionRows) {
    if (row.status in totals) totals[row.status as (typeof COMMISSION_STATUSES)[number]] = Number(row.total);
  }

  return jsonNoStore({
    referralLink: referralLink(affiliate.refCode, requestOrigin(request)),
    refCode: affiliate.refCode,
    clicks: affiliate.clicks,
    signups: signupsRow.n,
    activeSubscriptions: activeRow.n,
    conversions: activeRow.n,
    pending: totals.pending,
    approved: totals.approved,
    paid: totals.paid,
  });
}
