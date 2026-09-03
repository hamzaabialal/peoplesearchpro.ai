import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

/**
 * DB health check. Runs on the Vercel Node runtime (the Neon HTTP driver also
 * works on `edge`, but keep Node unless you need edge). Never statically
 * rendered — always hits the database.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { rows } = await db.execute(
      sql`select now() as now, current_database() as db`,
    );
    return NextResponse.json({ ok: true, info: rows[0] });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
