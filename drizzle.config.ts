import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next, so load the same env file the app uses.
// Migrations go through the unpooled (direct) endpoint — PgBouncer chokes on
// some DDL and on the session-level statements drizzle-kit issues.
process.loadEnvFile?.(".env.local");

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!url) {
  throw new Error("Set DATABASE_URL_UNPOOLED (or DATABASE_URL) in .env.local");
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
