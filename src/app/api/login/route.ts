import { sql } from "@/lib/db";
import { validateEmail } from "@/lib/validation/signup";
import { validatePassword } from "@/lib/validation/login";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// A precomputed bcrypt hash with no matching plaintext, used to run
// bcrypt.compare against a fixed cost even when no user is found —
// keeps "unknown email" and "wrong password" responses similarly timed.
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8Q7GEyzhr9yFVVCU/AKRxL4x08d0k6";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as Record<string, unknown>;

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const fieldErrors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (fieldErrors.email || fieldErrors.password) {
    return NextResponse.json({ error: "Validation failed", fieldErrors }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const rows = await sql`
      SELECT id, name, email, role, password_hash FROM signups WHERE email = ${normalizedEmail} LIMIT 1
    `;
    const user = rows[0] as
      | { id: string; name: string; email: string; role: string; password_hash: string }
      | undefined;

    const passwordMatches = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);

    if (!user || !passwordMatches) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("login failed", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
