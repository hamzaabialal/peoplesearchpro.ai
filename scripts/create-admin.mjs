/**
 * Create (or promote) an admin account in the `signups` table.
 *
 * Usage:
 *   node --env-file=.env.local scripts/create-admin.mjs <email> <password> ["Full Name"]
 *
 * If the email already exists it is updated: role -> admin and, when a
 * password is given, the password is reset too.
 */
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const [, , emailArg, passwordArg, nameArg] = process.argv;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env.local scripts/create-admin.mjs ...");
  process.exit(1);
}
if (!emailArg || !passwordArg) {
  console.error('Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password> ["Full Name"]');
  process.exit(1);
}

const email = emailArg.trim().toLowerCase();
const name = (nameArg ?? "Admin").trim();
const sql = neon(process.env.DATABASE_URL);

const passwordHash = await bcrypt.hash(passwordArg, 10);

const rows = await sql`
  INSERT INTO signups (name, email, password_hash, role)
  VALUES (${name}, ${email}, ${passwordHash}, 'admin')
  ON CONFLICT (email) DO UPDATE
    SET role = 'admin', password_hash = EXCLUDED.password_hash, name = EXCLUDED.name
  RETURNING id, name, email, role, created_at
`;

console.log("admin ready:", rows[0]);
