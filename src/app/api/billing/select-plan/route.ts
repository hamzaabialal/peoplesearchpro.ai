import { getSession } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { signups } from "@/lib/db/schema";
import { activateReferralPlan } from "@/lib/referrals";
import { plans } from "@/lib/data/mock";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Called when a signed-in user actually picks a plan (billing page's
 * Change plan / Upgrade confirm). There's no live payment processor here —
 * this doesn't charge anything — but it's the one real "they selected
 * something" event: it (a) persists the plan on their own signup row, which
 * is what ends the 7-day trial lock (see src/lib/trial.ts + src/proxy.ts),
 * and (b) activates their referral (if they were referred) and generates
 * the first commission. Before this call, a referred signup sits at Trial
 * with no plan and $0 commission.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const planId = (body as { planId?: unknown })?.planId;
  const plan = typeof planId === "string" ? plans.find((p) => p.id === planId) : undefined;
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  await db
    .update(signups)
    .set({ plan: plan.id, planSelectedAt: new Date() })
    .where(eq(signups.id, Number(session.sub)));

  await activateReferralPlan({
    signupId: session.sub,
    planName: plan.name,
    planPrice: plan.price,
  });

  return NextResponse.json({ ok: true, plan: plan.id });
}
