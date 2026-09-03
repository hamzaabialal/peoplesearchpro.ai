import { sql } from "@/lib/db";

/** Append an entry to the admin audit trail. Never throws into the caller. */
export async function writeAudit(
  actor: string,
  action: string,
  target?: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    await sql`
      INSERT INTO audit_logs (actor, action, target, metadata)
      VALUES (${actor}, ${action}, ${target ?? null}, ${JSON.stringify(metadata)}::jsonb)
    `;
  } catch (err) {
    console.error("writeAudit failed", err);
  }
}
