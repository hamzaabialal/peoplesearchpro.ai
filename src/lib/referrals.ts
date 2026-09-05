import { db } from "@/lib/db";
import { affiliates, commissions, referrals, type Affiliate } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/server";
import type { SessionPayload } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

const REF_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I

function generateRefCode(): string {
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += REF_CODE_CHARS[Math.floor(Math.random() * REF_CODE_CHARS.length)];
  }
  return `PSP-${code}`;
}

/**
 * The real, reachable origin for this running instance — `http://localhost:3000`
 * in dev, the actual deployed domain in production. Never hardcode a domain
 * here: `peoplesearchpro.ai` was never deployed anywhere, so a link built
 * from it opened for no one, including the account that generated it.
 *
 * Prefers `NEXT_PUBLIC_APP_URL` (set this once you have a stable public
 * domain, so every server instance generates the same links); otherwise
 * falls back to the origin the current request actually arrived on.
 */
export function requestOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/+$/, "");
  return new URL(request.url).origin;
}

export function referralLink(refCode: string, baseUrl: string): string {
  return `${baseUrl}/signup?ref=${refCode}`;
}

function pgErrorCode(err: unknown): string | undefined {
  return err instanceof Error && "code" in err ? (err as { code?: string }).code : undefined;
}

async function findAffiliateBySignupId(signupId: string | number): Promise<Affiliate | undefined> {
  const [row] = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.signupId, Number(signupId)))
    .limit(1);
  return row;
}

/**
 * Returns the signed-in user's affiliate/referral record, auto-provisioning
 * one — with a freshly generated, unique referral code — the first time they
 * open the section. Works for any signup role (customer or partner): the
 * referral program is role-independent, keyed only on signups.id.
 */
export async function ensureAffiliate(session: SessionPayload): Promise<Affiliate> {
  const existing = await findAffiliateBySignupId(session.sub);
  if (existing) return existing;

  for (let attempt = 0; attempt < 5; attempt++) {
    const refCode = generateRefCode();
    try {
      const [row] = await db
        .insert(affiliates)
        .values({
          signupId: Number(session.sub),
          name: session.name,
          email: session.email,
          refCode,
        })
        .returning();
      return row;
    } catch (err) {
      if (pgErrorCode(err) === "23505") {
        // Either the ref code collided (retry with a new one) or a
        // concurrent request already created this user's row (return it).
        const raced = await findAffiliateBySignupId(session.sub);
        if (raced) return raced;
        continue;
      }
      throw err;
    }
  }
  throw new Error("Could not allocate a unique referral code");
}

/**
 * Auth guard used by every /api/partner/* route: resolves the signed-in
 * session and their affiliate row together, or null if not signed in.
 * Role-independent by design — a customer and a partner session both get
 * their own isolated affiliate row, scoped by signups.id only.
 */
export async function requireAffiliate(): Promise<{
  session: SessionPayload;
  affiliate: Affiliate;
} | null> {
  const session = await getSession();
  if (!session) return null;
  const affiliate = await ensureAffiliate(session);
  return { session, affiliate };
}

function privacyLabel(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? "New";
  const lastInitial = parts.length > 1 ? `${parts[parts.length - 1][0]}.` : "";
  return `${first} ${lastInitial}`.trim();
}

function currentPeriodLabel(now = new Date()): string {
  return now.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

/**
 * Records that a signup arrived via an affiliate's referral link. This is
 * just the click-to-signup link — no plan has been chosen yet, so there's
 * nothing to earn a commission on. Status is "Trial" and plan/amount are
 * empty/zero until `activateReferralPlan` runs (when the referred user
 * actually picks a plan on the billing page). Best-effort — never throws,
 * so a referral-crediting hiccup can never fail the signup itself. No-op if
 * the ref code doesn't match any affiliate, or if this signup is already
 * credited to someone (the customerSignupId unique constraint on
 * `referrals` guards double-crediting).
 */
export async function creditReferral(params: {
  refCode: string;
  newSignup: { id: string | number; name: string };
}): Promise<void> {
  try {
    const code = params.refCode.trim().toUpperCase();
    if (!code) return;

    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.refCode, code)).limit(1);
    if (!affiliate) return;
    // Guard against self-referral crediting (unreachable for a brand-new
    // signup today, but cheap to rule out).
    if (affiliate.signupId !== null && String(affiliate.signupId) === String(params.newSignup.id)) {
      return;
    }

    await db
      .insert(referrals)
      .values({
        affiliateId: affiliate.id,
        customerLabel: privacyLabel(params.newSignup.name),
        customerSignupId: Number(params.newSignup.id),
        plan: "",
        status: "Trial",
        commissionAmount: "0",
        clickId: code,
      })
      .onConflictDoNothing({ target: referrals.customerSignupId });
  } catch (err) {
    console.error("creditReferral failed", err);
  }
}

/** 20% of the plan's monthly price, rounded to the nearest dollar. There's
 *  no live payment processor wired up (see `subscriptions` in schema.ts),
 *  so this is an honest stand-in for "commission automatically calculated
 *  from what they actually subscribed to" — not a percentage of a real charge. */
const COMMISSION_RATE = 0.2;

/**
 * Activates a referral once the referred user actually selects a plan:
 * sets their referral to Active with the real plan + commission amount, and
 * creates the first `pending` commission for it. No-op if this signup
 * wasn't referred, or if their referral is already active (a plan change
 * updates the plan label but never creates a second commission).
 */
export async function activateReferralPlan(params: {
  signupId: string | number;
  planName: string;
  planPrice: number | null;
}): Promise<void> {
  const [referral] = await db
    .select()
    .from(referrals)
    .where(eq(referrals.customerSignupId, Number(params.signupId)))
    .limit(1);
  if (!referral) return; // not a referred signup — nothing to activate

  const alreadyActive = referral.status === "Active";
  const commissionAmount = params.planPrice ? Math.round(params.planPrice * COMMISSION_RATE) : 0;

  await db
    .update(referrals)
    .set({
      plan: params.planName,
      status: "Active",
      commissionAmount: String(commissionAmount),
      subscribedAt: referral.subscribedAt ?? new Date(),
    })
    .where(eq(referrals.id, referral.id));

  if (!alreadyActive && commissionAmount > 0) {
    await db.insert(commissions).values({
      affiliateId: referral.affiliateId,
      referralId: referral.id,
      clickId: referral.clickId,
      amount: String(commissionAmount),
      status: "pending",
      period: currentPeriodLabel(),
    });
  }
}

export type ReportPeriod = "today" | "last7days" | "last30days" | "thisMonth" | "lastMonth";

/** Inclusive start / exclusive end (both UTC) for a report period, computed at query time. */
export function periodRange(period: ReportPeriod, now = new Date()): { start: Date; end: Date } {
  const startOfDay = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const startOfMonth = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));

  switch (period) {
    case "today":
      return { start: startOfDay(now), end: now };
    case "last7days":
      return { start: new Date(now.getTime() - 7 * 86400000), end: now };
    case "last30days":
      return { start: new Date(now.getTime() - 30 * 86400000), end: now };
    case "thisMonth":
      return { start: startOfMonth(now), end: now };
    case "lastMonth": {
      const thisMonthStart = startOfMonth(now);
      const lastMonthStart = new Date(
        Date.UTC(thisMonthStart.getUTCFullYear(), thisMonthStart.getUTCMonth() - 1, 1),
      );
      return { start: lastMonthStart, end: thisMonthStart };
    }
  }
}
