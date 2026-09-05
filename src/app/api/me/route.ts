import { jsonNoStore } from "@/lib/http";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth/server";
import { isTrialExpired, trialEndsAt, trialTimeRemainingLabel } from "@/lib/trial";

export const dynamic = "force-dynamic";

/** Current signed-in user, re-read from the DB so name/role stay fresh. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return jsonNoStore({ user: null }, { status: 401 });
  }

  try {
    const rows = await sql`
      SELECT id, name, email, role, image, plan, created_at FROM signups WHERE id = ${session.sub} LIMIT 1
    `;
    const row = rows[0] as
      | { id: string; name: string; email: string; role: string; image: string | null; plan: string | null; created_at: string }
      | undefined;
    if (!row) return jsonNoStore({ user: null }, { status: 401 });

    const { created_at, ...user } = row;
    return jsonNoStore({
      user: {
        ...user,
        trialExpired: isTrialExpired(created_at, row.plan),
        trialLabel: trialTimeRemainingLabel(created_at),
        trialEndsAt: row.plan ? null : trialEndsAt(created_at).toISOString(),
      },
    });
  } catch (err) {
    console.error("me lookup failed", err);
    return jsonNoStore({ error: "Something went wrong." }, { status: 500 });
  }
}
