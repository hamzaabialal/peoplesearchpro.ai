import { db } from "@/lib/db";
import { referrals } from "@/lib/db/schema";
import { referralLink, requestOrigin, requireAffiliate } from "@/lib/referrals";
import { count, eq } from "drizzle-orm";
import { jsonNoStore } from "@/lib/http";

export const dynamic = "force-dynamic";

/**
 * Each affiliate has exactly one real referral link today (schema has a
 * single `affiliates.refCode`, not a multi-campaign table) — this returns
 * that one link as a "campaign" so the page has real data instead of the
 * old multi-campaign mock list. Creating additional named campaigns per
 * affiliate would need its own table and isn't part of this pass.
 */
export async function GET(request: Request) {
  const ctx = await requireAffiliate();
  if (!ctx) return jsonNoStore({ error: "Unauthorized" }, { status: 401 });
  const { affiliate } = ctx;

  const [conversionsRow] = await db
    .select({ n: count() })
    .from(referrals)
    .where(eq(referrals.affiliateId, affiliate.id));

  return jsonNoStore({
    campaigns: [
      {
        id: affiliate.refCode,
        name: "Primary referral link",
        code: affiliate.refCode,
        link: referralLink(affiliate.refCode, requestOrigin(request)),
        clicks: affiliate.clicks,
        conversions: conversionsRow.n,
        active: affiliate.status === "active",
      },
    ],
  });
}
