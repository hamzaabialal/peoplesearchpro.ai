-- Repoint subscriptions/invoices at the real user table (signups, bigint id).
-- Both tables are empty, so the uuid user_id column is dropped and recreated
-- as bigint rather than cast in place.
ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "invoices_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "subscriptions" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "user_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "user_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_signups_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."signups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_signups_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."signups"("id") ON DELETE cascade ON UPDATE no action;
