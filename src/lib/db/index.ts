/**
 * Database client — Neon serverless driver + Drizzle.
 *
 * `neon-http` issues each query as a single HTTPS request, which is the right
 * default for Vercel functions and edge: no connection pool to warm up, no
 * sockets left open between invocations. Use the pooled `DATABASE_URL`.
 *
 * If you need interactive transactions (multiple statements in one BEGIN/COMMIT),
 * swap to the WebSocket driver:
 *
 *   import { Pool } from "@neondatabase/serverless";
 *   import { drizzle } from "drizzle-orm/neon-serverless";
 *   export const db = drizzle({ client: new Pool({ connectionString: url }), schema });
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Run `neon link` or add it to .env.local.",
  );
}

/**
 * Raw tagged-template SQL client, for code that wants plain SQL instead of the
 * query builder (e.g. the auth routes). Same connection, same pool semantics.
 */
export const sql = neon(connectionString);

export const db = drizzle({ client: sql, schema });

export { schema };
export * from "./schema";
