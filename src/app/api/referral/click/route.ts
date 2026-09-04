import { db } from "@/lib/db";
import { affiliates, referralClicks } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Public — no session required. Called once when the signup page loads with
 * a `?ref=PSP-XXXXX` param, so a click is logged against the referring
 * affiliate even if the visitor never completes signup.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ref = (body as { ref?: unknown })?.ref;
  if (typeof ref !== "string" || !ref.trim()) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const refCode = ref.trim().toUpperCase();

  try {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.refCode, refCode)).limit(1);
    if (!affiliate) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    await db
      .update(affiliates)
      .set({ clicks: sql`${affiliates.clicks} + 1` })
      .where(eq(affiliates.id, affiliate.id));
    await db.insert(referralClicks).values({ affiliateId: affiliate.id, refCode });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("referral click tracking failed", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
