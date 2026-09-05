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
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * `sql`/`db` below are created lazily, on first real query — not at module
 * import. `next build` imports every route handler (even ones that only
 * reference these for typing) to collect its config, in an environment that
 * may not have `DATABASE_URL` yet (a fresh branch/preview deploy before env
 * vars are configured). Throwing at import time turned a missing env var on
 * one deployment into a build failure for the whole app; throwing only when
 * a request actually touches the DB fails just that request instead.
 */
function connectionString(): string {
  const value = process.env.DATABASE_URL;
  if (!value) {
    throw new Error(
      "DATABASE_URL is not set. Run `neon link` or add it to .env.local (locally), " +
        "or set it in your deployment platform's project environment variables.",
    );
  }
  return value;
}

type Sql = NeonQueryFunction<false, false>;

let _sql: Sql | undefined;
function rawSql(): Sql {
  if (!_sql) _sql = neon(connectionString());
  return _sql;
}

let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;
function rawDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!_db) _db = drizzle({ client: rawSql(), schema });
  return _db;
}

/**
 * Raw tagged-template SQL client, for code that wants plain SQL instead of the
 * query builder (e.g. the auth routes). Same connection, same pool semantics.
 */
export const sql = ((...args: Parameters<Sql>) => rawSql()(...args)) as Sql;

export const db: ReturnType<typeof drizzle<typeof schema>> = new Proxy(
  {} as ReturnType<typeof drizzle<typeof schema>>,
  {
    get(_target, prop) {
      const real = rawDb();
      const value = Reflect.get(real, prop, real);
      // Bind functions to the real instance — calling db.select() invokes
      // the returned method with `this` set to the Proxy by JS's normal
      // obj.method() rule, which would break any internal drizzle code
      // that reads its own private fields via `this`.
      return typeof value === "function" ? value.bind(real) : value;
    },
  },
);

export { schema };
export * from "./schema";
