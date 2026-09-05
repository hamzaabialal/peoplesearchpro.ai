CREATE TYPE "public"."payout_status" AS ENUM('scheduled', 'paid');--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"affiliate_id" bigint NOT NULL,
	"amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" "payout_status" DEFAULT 'scheduled' NOT NULL,
	"method" text,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_clicks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"affiliate_id" bigint NOT NULL,
	"ref_code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "affiliates" ADD COLUMN "payout_method" text;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_clicks" ADD CONSTRAINT "referral_clicks_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_signup_id_unique" UNIQUE("signup_id");--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_customer_signup_id_unique" UNIQUE("customer_signup_id");