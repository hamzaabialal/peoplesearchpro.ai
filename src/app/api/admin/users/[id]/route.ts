import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/server";
import { writeAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const ROLES = ["customer", "partner", "admin"];

/** Admin: change a user's role. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const role = (body as { role?: unknown })?.role;
  if (typeof role !== "string" || !ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (String(id) === admin.sub && role !== "admin") {
    return NextResponse.json(
      { error: "You can't remove your own admin role" },
      { status: 400 },
    );
  }

  const rows = await sql`
    UPDATE signups SET role = ${role} WHERE id = ${id}
    RETURNING id, name, email, role
  `;
  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const user = rows[0] as { email: string; role: string };
  await writeAudit(admin.email, "Changed user role", `${user.email} → ${role}`, {
    userId: String(id),
  });
  return NextResponse.json({ user: rows[0] });
}
