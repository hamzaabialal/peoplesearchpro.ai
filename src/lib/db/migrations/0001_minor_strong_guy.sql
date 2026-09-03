-- `signups` may already exist in environments where it was created ad-hoc
-- before it was folded into the Drizzle schema, so guard the create.
CREATE TABLE IF NOT EXISTS "signups" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "signups_email_unique" UNIQUE("email"),
	CONSTRAINT "signups_role_check" CHECK ("signups"."role" in ('customer', 'partner'))
);
