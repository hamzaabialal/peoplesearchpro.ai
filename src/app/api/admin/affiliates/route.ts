import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

/** Admin: affiliate directory + tracked leads + referrals + commissions. */
export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const name = (searchParams.get("name") ?? "").trim().toLowerCase();
  const code = (searchParams.get("code") ?? "").trim().toLowerCase();
  const email = (searchParams.get("email") ?? "").trim().toLowerCase();
  const nameLike = `%${name}%`;
  const codeLike = `%${code}%`;
  const emailLike = `%${email}%`;

  const [statsRow, affiliates, leads, referrals, commissions] = await Promise.all([
    sql`
      SELECT
        coalesce((SELECT sum(clicks) FROM affiliates), 0)::int AS clicks,
        (SELECT count(*) FROM referrals)::int AS signups,
        (SELECT count(*) FROM referrals WHERE status IN ('active', 'past_due'))::int AS conversions,
        (SELECT count(*) FROM referrals WHERE status = 'active')::int AS active_subscribers
    `,
    sql`
      SELECT a.id, a.name, a.email, a.ref_code, a.landing_page, a.status, a.clicks, a.joined_at,
             (SELECT count(*) FROM referrals r WHERE r.affiliate_id = a.id)::int AS conversions
      FROM affiliates a
      WHERE (${name} = '' OR lower(a.name) LIKE ${nameLike})
        AND (${code} = '' OR lower(a.ref_code) LIKE ${codeLike})
        AND (${email} = '' OR lower(a.email) LIKE ${emailLike})
      ORDER BY a.clicks DESC
    `,
    sql`
      SELECT l.id, l.name, l.email, l.phone, l.city, l.state, l.country, l.device, l.browser,
             l.submitted_at, a.id AS affiliate_id, a.name AS affiliate_name, a.ref_code AS affiliate_code
      FROM tracked_leads l
      LEFT JOIN affiliates a ON a.id = l.affiliate_id
      ORDER BY l.submitted_at DESC
    `,
    sql`
      SELECT r.id, r.customer_label, r.plan, r.status, r.commission_amount, r.click_id,
             r.subscribed_at, r.cancelled_at,
             a.name AS affiliate_name
      FROM referrals r
      JOIN affiliates a ON a.id = r.affiliate_id
      ORDER BY r.created_at DESC
    `,
    sql`
      SELECT c.id, c.click_id, c.amount, c.status, c.reversal_reason, c.period,
             a.name AS affiliate_name,
             r.customer_label,
             r.subscribed_at, r.cancelled_at
      FROM commissions c
      JOIN affiliates a ON a.id = c.affiliate_id
      JOIN referrals r ON r.id = c.referral_id
      ORDER BY c.created_at DESC
    `,
  ]);

  const daysBetween = (a: string | null, b: string | null) =>
    a && b ? Math.round((+new Date(b) - +new Date(a)) / 86400000) : null;

  return NextResponse.json({
    stats: {
      clicks: statsRow[0].clicks,
      signups: statsRow[0].signups,
      conversions: statsRow[0].conversions,
      activeSubscribers: statsRow[0].active_subscribers,
    },
    affiliates: (affiliates as Record<string, unknown>[]).map((a) => ({
      id: String(a.id),
      name: a.name,
      email: a.email,
      refCode: a.ref_code,
      referralLink: `peoplesearchpro.ai/r/${a.ref_code}`,
      landingPage: a.landing_page,
      status: a.status,
      clicks: a.clicks,
      conversions: a.conversions,
      joinedAt: a.joined_at,
    })),
    trackedLeads: (leads as Record<string, unknown>[]).map((l) => ({
      id: String(l.id),
      name: l.name,
      email: l.email,
      phone: l.phone,
      city: l.city,
      state: l.state,
      country: l.country,
      device: l.device,
      browser: l.browser,
      submittedAt: l.submitted_at,
      affiliate: l.affiliate_id
        ? { id: String(l.affiliate_id), name: l.affiliate_name, code: l.affiliate_code }
        : null,
    })),
    referrals: (referrals as Record<string, unknown>[]).map((r) => ({
      id: String(r.id),
      customer: r.customer_label,
      plan: r.plan,
      status: r.status,
      affiliate: r.affiliate_name,
      commission: Number(r.commission_amount),
    })),
    commissions: (commissions as Record<string, unknown>[]).map((c) => {
      const days =
        c.status !== "reversed"
          ? daysBetween(c.subscribed_at as string, c.cancelled_at as string)
          : null;
      return {
        id: String(c.id),
        referral: c.customer_label,
        clickId: c.click_id,
        affiliate: c.affiliate_name,
        amount: Number(c.amount),
        status: c.status,
        reversalReason: c.reversal_reason,
        eligibleDays: days != null && days <= 30 ? days : null,
      };
    }),
  });
}
