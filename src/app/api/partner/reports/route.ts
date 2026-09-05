import { db } from "@/lib/db";
import { commissions, referralClicks, referrals } from "@/lib/db/schema";
import { periodRange, requireAffiliate, type ReportPeriod } from "@/lib/referrals";
import { and, count, eq, gte, lt, sql } from "drizzle-orm";
import { jsonNoStore } from "@/lib/http";

export const dynamic = "force-dynamic";

const PERIODS: ReportPeriod[] = ["today", "last7days", "last30days", "thisMonth", "lastMonth"];
const DAY_MS = 86400000;

type DailyBucket = { leads: number; conversations: number; commission: number };

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildDailySeries(
  seriesStart: Date,
  clicks: { createdAt: Date }[],
  referralRows: { createdAt: Date }[],
  commissionRows: { createdAt: Date; amount: string }[],
) {
  const buckets = new Map<string, DailyBucket>();
  for (let i = 0; i < 30; i++) {
    buckets.set(dayKey(new Date(seriesStart.getTime() + i * DAY_MS)), {
      leads: 0,
      conversations: 0,
      commission: 0,
    });
  }
  for (const c of clicks) {
    const bucket = buckets.get(dayKey(new Date(c.createdAt)));
    if (bucket) bucket.leads += 1;
  }
  for (const r of referralRows) {
    const bucket = buckets.get(dayKey(new Date(r.createdAt)));
    if (bucket) bucket.conversations += 1;
  }
  for (const c of commissionRows) {
    const bucket = buckets.get(dayKey(new Date(c.createdAt)));
    if (bucket) bucket.commission += Number(c.amount);
  }

  return [...buckets.entries()].map(([key, bucket]) => ({
    period: new Date(key).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
    ...bucket,
  }));
}

export async function GET(request: Request) {
  const ctx = await requireAffiliate();
  if (!ctx) return jsonNoStore({ error: "Unauthorized" }, { status: 401 });
  const { affiliate } = ctx;

  const { searchParams } = new URL(request.url);
  const requested = searchParams.get("period");
  const period: ReportPeriod = PERIODS.includes(requested as ReportPeriod)
    ? (requested as ReportPeriod)
    : "today";
  const { start, end } = periodRange(period);

  const [leadsRow] = await db
    .select({ n: count() })
    .from(referralClicks)
    .where(
      and(
        eq(referralClicks.affiliateId, affiliate.id),
        gte(referralClicks.createdAt, start),
        lt(referralClicks.createdAt, end),
      ),
    );

  const [conversationsRow] = await db
    .select({ n: count() })
    .from(referrals)
    .where(
      and(eq(referrals.affiliateId, affiliate.id), gte(referrals.createdAt, start), lt(referrals.createdAt, end)),
    );

  const [commissionRow] = await db
    .select({ total: sql<string>`coalesce(sum(${commissions.amount}), 0)` })
    .from(commissions)
    .where(
      and(
        eq(commissions.affiliateId, affiliate.id),
        gte(commissions.createdAt, start),
        lt(commissions.createdAt, end),
      ),
    );

  // Fixed 30-day daily trend for the charts — independent of the period selector.
  const seriesStart = new Date(Date.now() - 30 * DAY_MS);
  const [clickRows, referralRows, commissionRows] = await Promise.all([
    db
      .select({ createdAt: referralClicks.createdAt })
      .from(referralClicks)
      .where(and(eq(referralClicks.affiliateId, affiliate.id), gte(referralClicks.createdAt, seriesStart))),
    db
      .select({ createdAt: referrals.createdAt })
      .from(referrals)
      .where(and(eq(referrals.affiliateId, affiliate.id), gte(referrals.createdAt, seriesStart))),
    db
      .select({ createdAt: commissions.createdAt, amount: commissions.amount })
      .from(commissions)
      .where(and(eq(commissions.affiliateId, affiliate.id), gte(commissions.createdAt, seriesStart))),
  ]);

  return jsonNoStore({
    leads: leadsRow.n,
    conversations: conversationsRow.n,
    commission: Number(commissionRow.total),
    series: buildDailySeries(seriesStart, clickRows, referralRows, commissionRows),
  });
}
