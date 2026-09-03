import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

/** Current signed-in user, re-read from the DB so name/role stay fresh. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const rows = await sql`
      SELECT id, name, email, role, created_at FROM signups WHERE id = ${session.sub} LIMIT 1
    `;
    const user = rows[0];
    if (!user) return NextResponse.json({ user: null }, { status: 401 });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("me lookup failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
