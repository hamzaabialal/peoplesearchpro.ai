import { db } from "@/lib/db";
import { referrals } from "@/lib/db/schema";
import { requireAffiliate } from "@/lib/referrals";
import { desc, eq } from "drizzle-orm";
import { jsonNoStore } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requireAffiliate();
  if (!ctx) return jsonNoStore({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(referrals)
    .where(eq(referrals.affiliateId, ctx.affiliate.id))
    .orderBy(desc(referrals.createdAt));

  return jsonNoStore({
    referrals: rows.map((r) => ({
      id: r.id,
      customer: r.customerLabel,
      plan: r.plan,
      status: r.status,
      signedUpAt: r.subscribedAt ?? r.createdAt,
      commission: Number(r.commissionAmount),
    })),
  });
}
