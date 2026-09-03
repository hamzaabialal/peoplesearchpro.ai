/**
 * A few historical audit-log entries so the page isn't empty before any
 * admin action has been taken. Real entries are appended automatically by
 * the admin APIs (role change, commission reversal, settings save).
 *
 *   node --env-file=.env.local scripts/seed-audit.mjs
 */
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
const daysAgo = (d) => new Date(Date.now() - d * 24 * 3600 * 1000).toISOString();

await sql`DELETE FROM audit_logs WHERE (metadata->>'seed') = 'true'`;

const entries = [
  ["admin@peoplesearchpro.ai", "Changed user role", "partner@peoplesearchpro.ai → partner", 9],
  ["admin@peoplesearchpro.ai", "Reversed commission", "COM-19", 6],
  ["admin@peoplesearchpro.ai", "Updated admin settings", "logRetentionDays", 4],
  ["system", "Commission approved", "COM-24", 3],
  ["admin@peoplesearchpro.ai", "Changed user role", "user@peoplesearchpro.ai → customer", 2],
];

for (const [actor, action, target, d] of entries) {
  await sql`
    INSERT INTO audit_logs (actor, action, target, metadata, created_at)
    VALUES (${actor}, ${action}, ${target}, ${JSON.stringify({ seed: true })}::jsonb, ${daysAgo(d)})
  `;
}

console.log(`seeded ${entries.length} audit entries`);
