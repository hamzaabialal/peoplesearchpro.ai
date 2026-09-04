import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/server";
import { referralLink, requestOrigin } from "@/lib/referrals";

export const dynamic = "force-dynamic";

const PERIODS = ["today", "yesterday", "last2days", "last7days", "lastMonth"] as const;
type Period = (typeof PERIODS)[number];

/** Admin: partner/affiliate directory with lead + conversation activity by period. */
export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const baseUrl = requestOrigin(request);
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") ?? "today") as Period;
  const selected: Period = PERIODS.includes(period) ? period : "today";

  // leads (tracked_leads.submitted_at) and conversations (referrals.created_at)
  // counted per affiliate across five rolling windows.
  const rows = await sql`
    SELECT a.id, a.name, a.email, a.status, a.ref_code, a.landing_page, a.joined_at, a.clicks,
      (SELECT count(*) FROM referrals r WHERE r.affiliate_id = a.id)::int AS conversions,

      (SELECT count(*) FROM tracked_leads l WHERE l.affiliate_id = a.id
        AND l.submitted_at >= date_trunc('day', now()))::int AS lt,
      (SELECT count(*) FROM tracked_leads l WHERE l.affiliate_id = a.id
        AND l.submitted_at >= date_trunc('day', now()) - interval '1 day'
        AND l.submitted_at <  date_trunc('day', now()))::int AS ly,
      (SELECT count(*) FROM tracked_leads l WHERE l.affiliate_id = a.id
        AND l.submitted_at >= now() - interval '2 days')::int AS l2,
      (SELECT count(*) FROM tracked_leads l WHERE l.affiliate_id = a.id
        AND l.submitted_at >= now() - interval '7 days')::int AS l7,
      (SELECT count(*) FROM tracked_leads l WHERE l.affiliate_id = a.id
        AND l.submitted_at >= now() - interval '30 days')::int AS lm,

      (SELECT count(*) FROM referrals r WHERE r.affiliate_id = a.id
        AND r.created_at >= date_trunc('day', now()))::int AS ct,
      (SELECT count(*) FROM referrals r WHERE r.affiliate_id = a.id
        AND r.created_at >= date_trunc('day', now()) - interval '1 day'
        AND r.created_at <  date_trunc('day', now()))::int AS cy,
      (SELECT count(*) FROM referrals r WHERE r.affiliate_id = a.id
        AND r.created_at >= now() - interval '2 days')::int AS c2,
      (SELECT count(*) FROM referrals r WHERE r.affiliate_id = a.id
        AND r.created_at >= now() - interval '7 days')::int AS c7,
      (SELECT count(*) FROM referrals r WHERE r.affiliate_id = a.id
        AND r.created_at >= now() - interval '30 days')::int AS cm
    FROM affiliates a
    ORDER BY a.name
  `;

  const partners = (rows as Record<string, number & string>[]).map((r) => ({
    id: String(r.id),
    name: r.name,
    email: r.email,
    status: r.status,
    referralLink: referralLink(r.ref_code, baseUrl),
    landingPage: r.landing_page,
    joinedAt: r.joined_at,
    clicks: r.clicks,
    conversions: r.conversions,
    activity: {
      today: { leads: r.lt, conversations: r.ct },
      yesterday: { leads: r.ly, conversations: r.cy },
      last2days: { leads: r.l2, conversations: r.c2 },
      last7days: { leads: r.l7, conversations: r.c7 },
      lastMonth: { leads: r.lm, conversations: r.cm },
    } as Record<Period, { leads: number; conversations: number }>,
  }));

  const totals = partners.reduce(
    (acc, p) => {
      acc.leads += p.activity[selected].leads;
      acc.conversations += p.activity[selected].conversations;
      return acc;
    },
    { leads: 0, conversations: 0 },
  );

  return NextResponse.json({ partners, totals, period: selected });
}
