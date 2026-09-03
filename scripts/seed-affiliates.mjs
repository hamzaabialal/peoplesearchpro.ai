/**
 * Seed the affiliate programme: affiliates, referrals, commissions, and
 * tracked leads. Idempotent — clears these four tables first, then rebuilds.
 *
 *   node --env-file=.env.local scripts/seed-affiliates.mjs
 */
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
const daysAgo = (d) => new Date(Date.now() - d * 24 * 3600 * 1000).toISOString();
const hoursAgo = (h) => new Date(Date.now() - h * 3600 * 1000).toISOString();

await sql`DELETE FROM commissions`;
await sql`DELETE FROM tracked_leads`;
await sql`DELETE FROM referrals`;
await sql`DELETE FROM affiliates`;

// Link one affiliate to the existing partner-role signup, if present.
const partnerSignup = (
  await sql`SELECT id FROM signups WHERE role = 'partner' ORDER BY id LIMIT 1`
)[0];

const affiliateSeed = [
  { name: "Northline Media", email: "team@northline.example", refCode: "northline", landingPage: "/lp/northline", status: "active", clicks: 428, joinedAt: daysAgo(240), signupId: partnerSignup?.id ?? null },
  { name: "Bell Partners", email: "growth@bell.example", refCode: "bell", landingPage: "/lp/bell", status: "active", clicks: 263, joinedAt: daysAgo(180), signupId: null },
  { name: "Anand Digital", email: "hello@anand.example", refCode: "anand", landingPage: "/lp/anand", status: "trial", clicks: 94, joinedAt: daysAgo(35), signupId: null },
  { name: "Fjord Collective", email: "partners@fjord.example", refCode: "fjord", landingPage: "/lp/fjord", status: "suspended", clicks: 31, joinedAt: daysAgo(120), signupId: null },
];

const affById = {};
for (const a of affiliateSeed) {
  const row = (
    await sql`
      INSERT INTO affiliates (signup_id, name, email, ref_code, landing_page, status, clicks, joined_at)
      VALUES (${a.signupId}, ${a.name}, ${a.email}, ${a.refCode}, ${a.landingPage}, ${a.status}, ${a.clicks}, ${a.joinedAt})
      RETURNING id
    `
  )[0];
  affById[a.refCode] = row.id;
}

// referrals: [refCode, label, plan, status, commission, clickId, subscribedDaysAgo, cancelledDaysAgo|null]
const PRICE = { starter: 49, professional: 149, business: 399 };
const referralSeed = [
  ["northline", "Customer N-1042", "professional", "active", null, "clk_10122", 210, null],
  ["northline", "Customer N-1088", "business", "active", null, "clk_10145", 150, null],
  ["northline", "Customer N-1130", "starter", "cancelled", null, "clk_10190", 20, 6],
  ["bell", "Customer B-2201", "professional", "active", null, "clk_20233", 95, null],
  ["bell", "Customer B-2245", "starter", "past_due", null, "clk_20290", 60, null],
  ["bell", "Customer B-2260", "professional", "cancelled", null, "clk_20301", 18, 12],
  ["anand", "Customer A-3310", "starter", "trial", null, "clk_30044", 10, null],
  ["anand", "Customer A-3325", "business", "active", null, "clk_30051", 6, null],
];

const refIds = [];
for (const [code, label, plan, status, _c, clickId, subAgo, cancAgo] of referralSeed) {
  const commission = +(PRICE[plan] * 0.3).toFixed(2); // 30% first-month
  const row = (
    await sql`
      INSERT INTO referrals
        (affiliate_id, customer_label, plan, status, commission_amount, click_id, subscribed_at, cancelled_at, created_at)
      VALUES
        (${affById[code]}, ${label}, ${plan}, ${status}, ${commission}, ${clickId},
         ${daysAgo(subAgo)}, ${cancAgo == null ? null : daysAgo(cancAgo)}, ${daysAgo(subAgo)})
      RETURNING id
    `
  )[0];
  refIds.push({ id: row.id, code, clickId, commission, cancAgo, subAgo });
}

// one commission per referral; status spread; cancelled-within-30d stay non-reversed so the UI flags them
const cStatuses = ["paid", "approved", "pending", "payable", "approved", "pending", "pending", "approved"];
for (const [i, r] of refIds.entries()) {
  const period = daysAgo(r.subAgo).slice(0, 7);
  await sql`
    INSERT INTO commissions (affiliate_id, referral_id, click_id, amount, status, period, created_at)
    VALUES (${affById[r.code]}, ${r.id}, ${r.clickId}, ${r.commission}, ${cStatuses[i]}, ${period}, ${daysAgo(r.subAgo)})
  `;
}

// tracked leads spread across time buckets; some direct (null affiliate)
const leadSeed = [
  ["Marcus Hale", "m.hale@example.com", "+1 415 555 0110", "Austin", "TX", "USA", "Desktop", "Chrome", "northline", hoursAgo(3)],
  ["Priya Nair", "priya.n@example.com", "+1 512 555 0182", "Dallas", "TX", "USA", "Mobile", "Safari", "northline", hoursAgo(9)],
  ["Tom Becker", "t.becker@example.com", "+1 646 555 0143", "Newark", "NJ", "USA", "Desktop", "Firefox", "bell", hoursAgo(30)],
  ["Lena Fischer", "lena.f@example.com", "+49 30 555 0199", "Berlin", "BE", "DEU", "Mobile", "Chrome", null, hoursAgo(34)],
  ["Sara Kwon", "sara.k@example.com", "+1 213 555 0166", "Los Angeles", "CA", "USA", "Desktop", "Edge", "bell", daysAgo(3)],
  ["Ahmed Radi", "a.radi@example.com", "+20 2 555 0121", "Cairo", "C", "EGY", "Mobile", "Chrome", "anand", daysAgo(5)],
  ["Nora Vidal", "nora.v@example.com", "+34 91 555 0177", "Madrid", "M", "ESP", "Desktop", "Safari", "northline", daysAgo(6)],
  ["Chris Boone", "c.boone@example.com", "+1 305 555 0150", "Miami", "FL", "USA", "Mobile", "Chrome", null, daysAgo(9)],
  ["Ivy Chen", "ivy.c@example.com", "+65 6555 0134", "Singapore", "SG", "SGP", "Desktop", "Chrome", "bell", daysAgo(14)],
  ["Owen Pratt", "o.pratt@example.com", "+44 20 555 0188", "London", "LDN", "GBR", "Desktop", "Firefox", "anand", daysAgo(21)],
  ["Maria Lopez", "m.lopez@example.com", "+52 55 555 0102", "Mexico City", "CMX", "MEX", "Mobile", "Safari", "northline", daysAgo(26)],
  ["Jon Alt", "jon.alt@example.com", "+1 415 555 0197", "San Jose", "CA", "USA", "Desktop", "Chrome", null, daysAgo(29)],
];
for (const [name, email, phone, city, state, country, device, browser, code, at] of leadSeed) {
  await sql`
    INSERT INTO tracked_leads (affiliate_id, name, email, phone, city, state, country, device, browser, submitted_at)
    VALUES (${code ? affById[code] : null}, ${name}, ${email}, ${phone}, ${city}, ${state}, ${country}, ${device}, ${browser}, ${at})
  `;
}

console.log(
  `seeded ${affiliateSeed.length} affiliates, ${referralSeed.length} referrals + commissions, ${leadSeed.length} leads`,
);
