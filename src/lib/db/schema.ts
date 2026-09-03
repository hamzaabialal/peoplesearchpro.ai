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
import {
  boolean,
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
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
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
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
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
