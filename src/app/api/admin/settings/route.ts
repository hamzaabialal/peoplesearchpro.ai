import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/server";
import { writeAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/** key -> default, plus how to validate an incoming value. */
const FIELDS = {
  organization: {
    default: "PeopleSearch Pro",
    validate: (v: string) => (v.trim().length >= 2 ? null : "Organization name is too short"),
  },
  supportEmail: {
    default: "support@peoplesearchpro.ai",
    validate: (v: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : "Enter a valid email address",
  },
  logRetentionDays: {
    default: "90",
    validate: (v: string) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= 3650 ? null : "Retention must be 1–3650 days";
    },
  },
} as const;

type Key = keyof typeof FIELDS;
const KEYS = Object.keys(FIELDS) as Key[];

async function readAll(): Promise<Record<Key, string>> {
  const rows = await sql`SELECT key, value FROM settings WHERE key = ANY(${KEYS})`;
  const stored = new Map((rows as { key: string; value: string }[]).map((r) => [r.key, r.value]));
  return Object.fromEntries(
    KEYS.map((k) => [k, stored.get(k) ?? FIELDS[k].default]),
  ) as Record<Key, string>;
}

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ settings: await readAll() });
}

export async function PUT(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const input = (body ?? {}) as Record<string, unknown>;

  const fieldErrors: Partial<Record<Key, string>> = {};
  const clean: Partial<Record<Key, string>> = {};
  for (const k of KEYS) {
    const raw = input[k];
    if (typeof raw !== "string") {
      fieldErrors[k] = "Required";
      continue;
    }
    const err = FIELDS[k].validate(raw);
    if (err) fieldErrors[k] = err;
    else clean[k] = raw.trim();
  }
  if (Object.keys(fieldErrors).length) {
    return NextResponse.json({ error: "Validation failed", fieldErrors }, { status: 400 });
  }

  const before = await readAll();
  for (const k of KEYS) {
    await sql`
      INSERT INTO settings (key, value, updated_by, updated_at)
      VALUES (${k}, ${clean[k]!}, ${admin.email}, now())
      ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()
    `;
  }

  const changed = KEYS.filter((k) => before[k] !== clean[k]);
  if (changed.length) {
    await writeAudit(admin.email, "Updated admin settings", changed.join(", "), {
      changes: Object.fromEntries(changed.map((k) => [k, { from: before[k], to: clean[k] }])),
    });
  }

  return NextResponse.json({ settings: await readAll(), changed });
}
