import { db } from "@/lib/db";
import { payouts } from "@/lib/db/schema";
import { requireAffiliate } from "@/lib/referrals";
import { desc, eq } from "drizzle-orm";
import { jsonNoStore } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requireAffiliate();
  if (!ctx) return jsonNoStore({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(payouts)
    .where(eq(payouts.affiliateId, ctx.affiliate.id))
    .orderBy(desc(payouts.date));

  return jsonNoStore({
    payouts: rows.map((p) => ({
      id: `PO-${p.id}`,
      amount: Number(p.amount),
      status: p.status,
      date: p.date,
      method: p.method ?? "—",
    })),
  });
}
