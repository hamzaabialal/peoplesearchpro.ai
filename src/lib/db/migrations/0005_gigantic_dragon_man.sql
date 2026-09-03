CREATE TYPE "public"."affiliate_status" AS ENUM('active', 'trial', 'suspended', 'past_due', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."commission_status" AS ENUM('pending', 'approved', 'payable', 'paid', 'reversed');--> statement-breakpoint
CREATE TABLE "affiliates" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"signup_id" bigint,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"ref_code" text NOT NULL,
	"landing_page" text,
	"status" "affiliate_status" DEFAULT 'active' NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "affiliates_ref_code_unique" UNIQUE("ref_code")
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"affiliate_id" bigint NOT NULL,
	"referral_id" bigint NOT NULL,
	"click_id" text,
	"amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" "commission_status" DEFAULT 'pending' NOT NULL,
	"reversal_reason" text,
	"period" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"affiliate_id" bigint NOT NULL,
	"customer_label" text NOT NULL,
	"customer_signup_id" bigint,
	"plan" text NOT NULL,
	"status" text NOT NULL,
	"commission_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"click_id" text,
	"subscribed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracked_leads" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"affiliate_id" bigint,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"city" text,
	"state" text,
	"country" text,
	"device" text,
	"browser" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "affiliates" ADD CONSTRAINT "affiliates_signup_id_signups_id_fk" FOREIGN KEY ("signup_id") REFERENCES "public"."signups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_referral_id_referrals_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referrals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_customer_signup_id_signups_id_fk" FOREIGN KEY ("customer_signup_id") REFERENCES "public"."signups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracked_leads" ADD CONSTRAINT "tracked_leads_affiliate_id_affiliates_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliates"("id") ON DELETE set null ON UPDATE no action;