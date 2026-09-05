import { db } from "@/lib/db";
import { affiliates } from "@/lib/db/schema";
import { referralLink, requestOrigin, requireAffiliate } from "@/lib/referrals";
import { eq } from "drizzle-orm";
import { jsonNoStore } from "@/lib/http";

export const dynamic = "force-dynamic";

function serialize(affiliate: typeof affiliates.$inferSelect, baseUrl: string) {
  return {
    name: affiliate.name,
    email: affiliate.email,
    payoutMethod: affiliate.payoutMethod,
    referralLink: referralLink(affiliate.refCode, baseUrl),
    refCode: affiliate.refCode,
  };
}

export async function GET(request: Request) {
  const ctx = await requireAffiliate();
  if (!ctx) return jsonNoStore({ error: "Unauthorized" }, { status: 401 });
  return jsonNoStore(serialize(ctx.affiliate, requestOrigin(request)));
}

export async function PATCH(request: Request) {
  const ctx = await requireAffiliate();
  if (!ctx) return jsonNoStore({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, payoutMethod } = (body ?? {}) as Record<string, unknown>;
  const updates: Partial<{ name: string; payoutMethod: string | null }> = {};
  if (typeof name === "string" && name.trim()) updates.name = name.trim();
  if (typeof payoutMethod === "string") updates.payoutMethod = payoutMethod.trim() || null;

  if (Object.keys(updates).length === 0) {
    return jsonNoStore({ error: "Nothing to update" }, { status: 400 });
  }

  const [row] = await db
    .update(affiliates)
    .set(updates)
    .where(eq(affiliates.id, ctx.affiliate.id))
    .returning();

  return jsonNoStore(serialize(row, requestOrigin(request)));
}
