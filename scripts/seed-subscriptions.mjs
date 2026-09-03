/**
 * Give every existing signup a subscription + a couple of invoices so the
 * admin Subscriptions page has real rows to show. Idempotent (re-running
 * replaces a user's subscription, keeps one invoice set).
 *
 *   node --env-file=.env.local scripts/seed-subscriptions.mjs
 */
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const planByRole = { admin: "business", partner: "professional", customer: "starter" };
const priceByPlan = { starter: "29.00", professional: "99.00", business: "299.00", enterprise: "0.00" };
// A deterministic-ish status spread so filters have something to filter.
const statuses = ["active", "active", "trialing", "past_due", "canceled"];

const users = await sql`select id, role, created_at from signups order by id`;
let subs = 0;
let invs = 0;

for (const [i, u] of users.entries()) {
  const plan = planByRole[u.role] ?? "starter";
  const status = statuses[i % statuses.length];
  const periodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

  await sql`
    INSERT INTO subscriptions (user_id, plan, status, current_period_end, created_at)
    VALUES (${u.id}, ${plan}, ${status}, ${periodEnd}, ${u.created_at})
    ON CONFLICT DO NOTHING
  `;
  // subscriptions has no unique key on user_id, so clear extras from earlier runs.
  await sql`
    DELETE FROM subscriptions
    WHERE user_id = ${u.id}
      AND id NOT IN (SELECT id FROM subscriptions WHERE user_id = ${u.id} ORDER BY created_at LIMIT 1)
  `;
  subs++;

  const existing = await sql`select count(*)::int n from invoices where user_id = ${u.id}`;
  if (existing[0].n === 0) {
    const amount = priceByPlan[plan] ?? "29.00";
    for (let m = 0; m < 3; m++) {
      const issued = new Date(Date.now() - m * 30 * 24 * 3600 * 1000).toISOString();
      const st = m === 0 && status === "past_due" ? "open" : "paid";
      await sql`
        INSERT INTO invoices (user_id, amount, currency, status, issued_at)
        VALUES (${u.id}, ${amount}, 'usd', ${st}, ${issued})
      `;
      invs++;
    }
  }
}

console.log(`seeded ${subs} subscriptions, ${invs} invoices for ${users.length} users`);
