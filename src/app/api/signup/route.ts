import { sql } from "@/lib/db";
import { setSession } from "@/lib/auth/server";
import { resolveRole } from "@/lib/auth/roles";
import { creditReferral } from "@/lib/referrals";
import { validateEmail, validateName, validatePassword, validateRole } from "@/lib/validation/signup";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, password, role, ref } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof role !== "string"
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const fieldErrors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
    // Public signup only ever accepts "customer" or "partner" — validateRole
    // rejects anything else (including "admin"). Admin accounts are assigned
    // out-of-band (directly in the DB / the admin panel's Users page).
    role: validateRole(role),
  };

  if (fieldErrors.name || fieldErrors.email || fieldErrors.password || fieldErrors.role) {
    return NextResponse.json({ error: "Validation failed", fieldErrors }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const rows = await sql`
      INSERT INTO signups (name, email, password_hash, role)
      VALUES (${name.trim()}, ${normalizedEmail}, ${passwordHash}, ${role})
      RETURNING id, name, email, role, created_at
    `;
    const user = rows[0] as {
      id: string;
      name: string;
      email: string;
      role: string;
      created_at: string;
    };

    // Priority: hardcoded admin email first, then the role picked in the form
    // (customer/partner) — see resolveRole in src/lib/auth/roles.ts.
    const effectiveRole = resolveRole({ email: user.email, role: user.role });
    await setSession({
      sub: String(user.id),
      email: user.email,
      name: user.name,
      role: effectiveRole,
    });

    if (typeof ref === "string" && ref.trim()) {
      await creditReferral({ refCode: ref, newSignup: { id: user.id, name: user.name } });
    }

    return NextResponse.json({ user: { ...user, role: effectiveRole } }, { status: 201 });
  } catch (err) {
    const code = err instanceof Error && "code" in err ? (err as { code?: string }).code : undefined;
    if (code === "23505") {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }
    console.error("signup insert failed", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
