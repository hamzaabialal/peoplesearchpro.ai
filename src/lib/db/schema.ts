/**
 * Drizzle schema for PeopleSearch Pro.
 *
 * Design notes:
 * - Relational core: users, persons, investigations, reports, sources, billing.
 * - The deep, document-shaped parts of an IntelligenceReport (professional
 *   history, social profiles, behaviour insights, adverse findings, ...) are
 *   stored as JSONB. They are read as a whole with the report and never queried
 *   field-by-field, so normalising them buys nothing.
 * - Enums mirror the string unions in `src/types/index.ts`.
 * - Money is `numeric(12,2)`; confidence/probability scores are `doublePrecision`
 *   in the 0..1 range.
 */
import { sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  boolean,
  check,
  doublePrecision,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type {
  AttributedValue,
  BehaviorInsight,
  BreachRecord,
  ContentReviewFinding,
  AdverseFinding,
  EducationRecord,
  ProfessionalRole,
  SocialActivity,
  SocialPost,
  SocialProfile,
} from "@/types";

/* -------------------------------------------------------------------------- */
/* Enums                                                                       */
/* -------------------------------------------------------------------------- */

export const userRole = pgEnum("user_role", ["customer", "admin", "partner"]);
export const planId = pgEnum("plan_id", [
  "starter",
  "professional",
  "business",
  "enterprise",
]);
export const userStatus = pgEnum("user_status", [
  "active",
  "trial",
  "suspended",
  "past_due",
]);
export const investigationStatus = pgEnum("investigation_status", [
  "queued",
  "collecting",
  "analyzing",
  "completed",
  "failed",
]);
export const sourceType = pgEnum("source_type", [
  "identity",
  "web",
  "social",
  "breach",
  "legal",
  "professional",
]);
export const sourceStatus = pgEnum("source_status", [
  "checked",
  "partial",
  "unavailable",
]);
export const invoiceStatus = pgEnum("invoice_status", ["paid", "open", "failed"]);
export const subscriptionStatus = pgEnum("subscription_status", [
  "active",
  "trialing",
  "past_due",
  "canceled",
]);
export const affiliateStatus = pgEnum("affiliate_status", [
  "active",
  "trial",
  "suspended",
  "past_due",
  "cancelled",
]);
export const commissionStatus = pgEnum("commission_status", [
  "pending",
  "approved",
  "payable",
  "paid",
  "reversed",
]);

/* -------------------------------------------------------------------------- */
/* Users & billing                                                             */
/* -------------------------------------------------------------------------- */

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRole("role").notNull().default("customer"),
  plan: planId("plan").notNull().default("starter"),
  status: userStatus("status").notNull().default("trial"),
  creditsRemaining: integer("credits_remaining").notNull().default(0),
  creditsTotal: integer("credits_total").notNull().default(0),
  reportsCompleted: integer("reports_completed").notNull().default(0),
  paymentMethod: text("payment_method"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  nextBillingAt: timestamp("next_billing_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  // The account this subscription belongs to (signups is the user table).
  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => signups.id, { onDelete: "cascade" }),
  plan: planId("plan").notNull(),
  status: subscriptionStatus("status").notNull().default("active"),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => signups.id, { onDelete: "cascade" }),
  stripeInvoiceId: text("stripe_invoice_id").unique(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("usd"),
  status: invoiceStatus("status").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Persons — the subject of an investigation                                   */
/* -------------------------------------------------------------------------- */

export const persons = pgTable("persons", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  firstName: text("first_name").notNull().default(""),
  lastName: text("last_name").notNull().default(""),
  knownNames: text("known_names").array().notNull().default([]),
  location: text("location"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  email: text("email"),
  phone: text("phone"),
  username: text("username"),
  employer: text("employer"),
  title: text("title"),
  education: text("education"),
  avatarInitials: text("avatar_initials").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Investigations                                                              */
/* -------------------------------------------------------------------------- */

export const investigations = pgTable("investigations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  personId: uuid("person_id")
    .notNull()
    .references(() => persons.id, { onDelete: "restrict" }),
  status: investigationStatus("status").notNull().default("queued"),
  sourcesChecked: integer("sources_checked").notNull().default(0),
  confidence: doublePrecision("confidence").notNull().default(0),
  elapsedSeconds: integer("elapsed_seconds"),
  recordsProcessed: integer("records_processed"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Reports                                                                     */
/* -------------------------------------------------------------------------- */

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  investigationId: uuid("investigation_id")
    .notNull()
    .references(() => investigations.id, { onDelete: "cascade" })
    .unique(),
  personId: uuid("person_id")
    .notNull()
    .references(() => persons.id, { onDelete: "restrict" }),
  generatedAt: timestamp("generated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  dataFreshness: text("data_freshness"),
  sourcesChecked: integer("sources_checked").notNull().default(0),
  identityConfidence: doublePrecision("identity_confidence")
    .notNull()
    .default(0),
  summary: text("summary").notNull().default(""),

  // Document-shaped sections — read with the report, never filtered on.
  identifiers: jsonb("identifiers").$type<AttributedValue[]>().notNull().default([]),
  personal: jsonb("personal")
    .$type<Record<string, AttributedValue>>()
    .notNull()
    .default({}),
  professional: jsonb("professional")
    .$type<ProfessionalRole[]>()
    .notNull()
    .default([]),
  education: jsonb("education").$type<EducationRecord[]>().notNull().default([]),
  social: jsonb("social").$type<SocialProfile[]>().notNull().default([]),
  topContent: jsonb("top_content").$type<SocialPost[]>().notNull().default([]),
  recentActivity: jsonb("recent_activity")
    .$type<SocialActivity[]>()
    .notNull()
    .default([]),
  behavior: jsonb("behavior").$type<BehaviorInsight[]>().notNull().default([]),
  discussionAreas: jsonb("discussion_areas")
    .$type<string[]>()
    .notNull()
    .default([]),
  carefulTopics: jsonb("careful_topics").$type<string[]>().notNull().default([]),
  communicationStyle: jsonb("communication_style")
    .$type<string[]>()
    .notNull()
    .default([]),
  adverse: jsonb("adverse").$type<AdverseFinding[]>().notNull().default([]),
  contentReview: jsonb("content_review")
    .$type<ContentReviewFinding[]>()
    .notNull()
    .default([]),
  breaches: jsonb("breaches").$type<BreachRecord[]>().notNull().default([]),

  // Reserved for semantic search once pgvector is enabled:
  //   embedding: vector("embedding", { dimensions: 1536 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Sources — one row per record checked while building a report                */
/* -------------------------------------------------------------------------- */

export const sources = pgTable("sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id")
    .notNull()
    .references(() => reports.id, { onDelete: "cascade" }),
  index: integer("index").notNull(),
  name: text("name").notNull(),
  type: sourceType("type").notNull(),
  status: sourceStatus("status").notNull(),
  confidence: doublePrecision("confidence").notNull().default(0),
  reference: text("reference"),
  dataUsed: text("data_used"),
  collectedAt: timestamp("collected_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Signups — credentials for the /api/signup + /api/login flow                 */
/*                                                                            */
/* Kept separate from `users` (which models a provisioned customer/admin/      */
/* partner account): a signup is just "someone made an account with an email   */
/* and password". Promote a signup into `users` when they first pay / onboard. */
/* -------------------------------------------------------------------------- */

export const signups = pgTable(
  "signups",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull(),
    /** Optional avatar URL; when null the UI falls back to initials. */
    image: text("image"),
    /**
     * Plan id chosen via /app/billing → POST /api/billing/select-plan.
     * Null until they pick one. See src/lib/trial.ts: after TRIAL_DAYS with
     * no plan, /app access is locked to /app/billing + /app/settings.
     */
    plan: text("plan"),
    planSelectedAt: timestamp("plan_selected_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check("signups_role_check", sql`${t.role} in ('customer', 'partner', 'admin')`),
  ],
);

/* -------------------------------------------------------------------------- */
/* Affiliates / referral programme                                             */
/* -------------------------------------------------------------------------- */

export const affiliates = pgTable("affiliates", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  /**
   * Their login. One affiliate row per signup account — `.unique()` is what
   * lets `ensureAffiliate()` (src/lib/referrals.ts) safely auto-provision a
   * row the first time any signup (customer or partner) opens /partner,
   * without ever creating duplicates for the same account.
   */
  signupId: bigint("signup_id", { mode: "number" })
    .references(() => signups.id, { onDelete: "set null" })
    .unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  refCode: text("ref_code").notNull().unique(),
  landingPage: text("landing_page"),
  status: affiliateStatus("status").notNull().default("active"),
  clicks: integer("clicks").notNull().default(0),
  /** Free-text payout destination shown in Partner Settings (no real processor wired up). */
  payoutMethod: text("payout_method"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** One row per click on an affiliate's referral link — powers the "leads over
 *  time" charts on the Partner Reports page. `affiliates.clicks` stays as a
 *  fast running total; this table is the detailed, timestamped log. */
export const referralClicks = pgTable("referral_clicks", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  affiliateId: bigint("affiliate_id", { mode: "number" })
    .notNull()
    .references(() => affiliates.id, { onDelete: "cascade" }),
  refCode: text("ref_code").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  affiliateId: bigint("affiliate_id", { mode: "number" })
    .notNull()
    .references(() => affiliates.id, { onDelete: "cascade" }),
  /** Privacy-safe label shown in admin (not the real customer name). */
  customerLabel: text("customer_label").notNull(),
  /**
   * `.unique()` — a signup can be credited to at most one affiliate, ever.
   * Prevents double-crediting the same referred account.
   */
  customerSignupId: bigint("customer_signup_id", { mode: "number" })
    .references(() => signups.id, { onDelete: "set null" })
    .unique(),
  plan: text("plan").notNull(),
  status: text("status").notNull(),
  commissionAmount: numeric("commission_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  clickId: text("click_id"),
  subscribedAt: timestamp("subscribed_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const commissions = pgTable("commissions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  affiliateId: bigint("affiliate_id", { mode: "number" })
    .notNull()
    .references(() => affiliates.id, { onDelete: "cascade" }),
  referralId: bigint("referral_id", { mode: "number" })
    .notNull()
    .references(() => referrals.id, { onDelete: "cascade" }),
  clickId: text("click_id"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
  status: commissionStatus("status").notNull().default("pending"),
  reversalReason: text("reversal_reason"),
  period: text("period"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const payoutStatus = pgEnum("payout_status", ["scheduled", "paid"]);

/** A transfer of paid-out commission to an affiliate. No real payout
 *  processor is wired up yet — these rows exist so the Payouts page reflects
 *  real per-affiliate history instead of shared demo data. */
export const payouts = pgTable("payouts", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  affiliateId: bigint("affiliate_id", { mode: "number" })
    .notNull()
    .references(() => affiliates.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
  status: payoutStatus("status").notNull().default("scheduled"),
  method: text("method"),
  date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const trackedLeads = pgTable("tracked_leads", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  /** null = arrived directly, no affiliate link. */
  affiliateId: bigint("affiliate_id", { mode: "number" }).references(
    () => affiliates.id,
    { onDelete: "set null" },
  ),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  device: text("device"),
  browser: text("browser"),
  submittedAt: timestamp("submitted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Operations: audit trail + settings                                          */
/* -------------------------------------------------------------------------- */

export const auditLogs = pgTable("audit_logs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  actor: text("actor").notNull(), // admin email, or "system"
  action: text("action").notNull(),
  target: text("target"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Simple key/value store for admin-editable settings. */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/* Inferred types                                                              */
/* -------------------------------------------------------------------------- */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Person = typeof persons.$inferSelect;
export type NewPerson = typeof persons.$inferInsert;
export type InvestigationRow = typeof investigations.$inferSelect;
export type NewInvestigation = typeof investigations.$inferInsert;
export type ReportRow = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type SourceRow = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Signup = typeof signups.$inferSelect;
export type NewSignup = typeof signups.$inferInsert;
export type Affiliate = typeof affiliates.$inferSelect;
export type ReferralClick = typeof referralClicks.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type Commission = typeof commissions.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
export type TrackedLead = typeof trackedLeads.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Setting = typeof settings.$inferSelect;
