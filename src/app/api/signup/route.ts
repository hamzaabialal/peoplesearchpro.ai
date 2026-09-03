import { sql } from "@/lib/db";
import { setSession } from "@/lib/auth/server";
import { validateEmail, validateName, validatePassword } from "@/lib/validation/signup";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, password } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const fieldErrors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (fieldErrors.name || fieldErrors.email || fieldErrors.password) {
    return NextResponse.json({ error: "Validation failed", fieldErrors }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);

  // Public signup always creates a plain user. Partner/admin roles are
  // assigned out-of-band (directly in the DB / an admin tool).
  const role = "customer";

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

    await setSession({
      sub: String(user.id),
      email: user.email,
      name: user.name,
      role: "customer",
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    const code = err instanceof Error && "code" in err ? (err as { code?: string }).code : undefined;
    if (code === "23505") {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }
    console.error("signup insert failed", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
