CREATE TYPE "public"."investigation_status" AS ENUM('queued', 'collecting', 'analyzing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('paid', 'open', 'failed');--> statement-breakpoint
CREATE TYPE "public"."plan_id" AS ENUM('starter', 'professional', 'business', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."source_status" AS ENUM('checked', 'partial', 'unavailable');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('identity', 'web', 'social', 'breach', 'legal', 'professional');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'trialing', 'past_due', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'admin', 'partner');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'trial', 'suspended', 'past_due');--> statement-breakpoint
CREATE TABLE "investigations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"status" "investigation_status" DEFAULT 'queued' NOT NULL,
	"sources_checked" integer DEFAULT 0 NOT NULL,
	"confidence" double precision DEFAULT 0 NOT NULL,
	"elapsed_seconds" integer,
	"records_processed" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"stripe_invoice_id" text,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"status" "invoice_status" NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_stripe_invoice_id_unique" UNIQUE("stripe_invoice_id")
);
--> statement-breakpoint
CREATE TABLE "persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"first_name" text DEFAULT '' NOT NULL,
	"last_name" text DEFAULT '' NOT NULL,
	"known_names" text[] DEFAULT '{}' NOT NULL,
	"location" text,
	"city" text,
	"state" text,
	"country" text,
	"email" text,
	"phone" text,
	"username" text,
	"employer" text,
	"title" text,
	"education" text,
	"avatar_initials" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"investigation_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"data_freshness" text,
	"sources_checked" integer DEFAULT 0 NOT NULL,
	"identity_confidence" double precision DEFAULT 0 NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"identifiers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"personal" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"professional" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"education" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"social" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"top_content" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recent_activity" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"behavior" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"discussion_areas" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"careful_topics" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"communication_style" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"adverse" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"content_review" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"breaches" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reports_investigation_id_unique" UNIQUE("investigation_id")
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"index" integer NOT NULL,
	"name" text NOT NULL,
	"type" "source_type" NOT NULL,
	"status" "source_status" NOT NULL,
	"confidence" double precision DEFAULT 0 NOT NULL,
	"reference" text,
	"data_used" text,
	"collected_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" "plan_id" NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"stripe_subscription_id" text,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"plan" "plan_id" DEFAULT 'starter' NOT NULL,
	"status" "user_status" DEFAULT 'trial' NOT NULL,
	"credits_remaining" integer DEFAULT 0 NOT NULL,
	"credits_total" integer DEFAULT 0 NOT NULL,
	"reports_completed" integer DEFAULT 0 NOT NULL,
	"payment_method" text,
	"stripe_customer_id" text,
	"next_billing_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_investigation_id_investigations_id_fk" FOREIGN KEY ("investigation_id") REFERENCES "public"."investigations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_person_id_persons_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."persons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;