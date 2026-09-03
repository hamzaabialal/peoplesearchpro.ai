// One-off migration: creates the `signups` table used by /api/signup.
// Run with: node --env-file=.env scripts/create-signups-table.mjs
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Run with: node --env-file=.env scripts/create-signups-table.mjs");
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS signups (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('customer', 'partner')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("signups table ready");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
