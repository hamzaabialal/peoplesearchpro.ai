export type AttributionKind =
  | "verified"
  | "ai"
  | "inference"
  | "possible_match"
  | "unverified"
  | "public";

export type SourceType =
  | "identity"
  | "web"
  | "social"
  | "breach"
  | "legal"
  | "professional";

export type InvestigationStatus =
  | "queued"
  | "collecting"
  | "analyzing"
  | "completed"
  | "failed";

export type PipelineStageStatus = "waiting" | "processing" | "complete" | "failed";

export type AdverseCategory =
  | "criminal"
  | "regulatory"
  | "legal"
  | "sanctions"
  | "administrative"
  | "media"
  | "scandals";

export type ContentReviewCategory =
  | "sensitive"
  | "alcohol"
  | "crime"
  | "offensive"
  | "toxic";

export type PlanId = "starter" | "professional" | "business" | "enterprise";

export type UserStatus = "active" | "trial" | "suspended" | "past_due" | "cancelled";

export type CommissionStatus = "pending" | "approved" | "payable" | "paid" | "reversed";

export type NotificationKind =
  | "report_completed"
  | "subscription_renewed"
  | "payment_failed"
  | "report_failed"
  | "credits_low"
  | "commission_approved";

export interface SourceRecord {
  id: string;
  index: number;
  name: string;
  type: SourceType;
  collectedAt: string;
  confidence: number;
  reference: string;
  status: "checked" | "partial" | "unavailable";
  dataUsed: string;
}

export interface AttributedValue {
  value: string;
  kind: AttributionKind;
  sourceIds: string[];
  note?: string;
}

export interface PersonSummary {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  knownNames: string[];
  location: string;
  city?: string;
  state?: string;
  country?: string;
  email?: string;
  phone?: string;
  username?: string;
  employer?: string;
  title?: string;
  education?: string;
  avatarInitials: string;
}

export interface SavedPerson extends PersonSummary {
  lastInvestigatedAt: string;
  reportsCount: number;
  confidence: number;
}

export interface Investigation {
  id: string;
  person: PersonSummary;
  status: InvestigationStatus;
  sourcesChecked: number;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  reportId?: string;
  elapsedSeconds?: number;
  recordsProcessed?: number;
}

export interface PipelineStage {
  id: string;
  name: string;
  status: PipelineStageStatus;
  progress: number;
  sourceCount: number;
  processingMs: number;
}

export interface ActivityEvent {
  id: string;
  at: string;
  message: string;
}

export interface ProfessionalRole {
  employer: string;
  role: string;
  location: string;
  start: string;
  end: string | null;
  sourceIds: string[];
  confidence: number;
}

export interface EducationRecord {
  institution: string;
  degree: string;
  field: string;
  years: string;
  sourceIds: string[];
  kind: AttributionKind;
}

export interface SocialProfile {
  platform: string;
  username: string;
  url: string;
  followers: number | null;
  following: number | null;
  posts: number | null;
  engagement: string | null;
  industry?: string;
  categories: string[];
  kind: AttributionKind;
  sourceIds: string[];
}

export interface SocialPost {
  platform: string;
  excerpt: string;
  date: string;
  likes: number;
  comments: number;
  views: number | null;
  engagement: string;
  sourceIds: string[];
}

export interface SocialActivity {
  date: string;
  platform: string;
  description: string;
  kind: AttributionKind;
}

export interface BehaviorInsight {
  insight: string;
  confidence: number;
  evidence: string;
  sourceIds: string[];
}

export interface AdverseFinding {
  category: AdverseCategory;
  finding: string;
  confidence: number | null;
  evidence: string;
  sourcesChecked: number;
  lastChecked: string;
  matched: boolean;
  sourceIds: string[];
}

export interface ContentReviewFinding {
  category: ContentReviewCategory;
  finding: string;
  confidence: number | null;
  evidence: string;
  sourceIds: string[];
  matched: boolean;
}

export interface BreachRecord {
  name: string;
  date: string;
  description: string;
  exposed: string[];
  sourceIds: string[];
}

export interface IntelligenceReport {
  id: string;
  investigationId: string;
  person: PersonSummary;
  generatedAt: string;
  dataFreshness: string;
  sourcesChecked: number;
  identityConfidence: number;
  summary: string;
  identifiers: AttributedValue[];
  personal: {
    fullName: AttributedValue;
    knownNames: AttributedValue;
    location: AttributedValue;
    email: AttributedValue;
    username: AttributedValue;
  };
  professional: ProfessionalRole[];
  education: EducationRecord[];
  social: SocialProfile[];
  topContent: SocialPost[];
  recentActivity: SocialActivity[];
  behavior: BehaviorInsight[];
  discussionAreas: string[];
  carefulTopics: string[];
  communicationStyle: string[];
  adverse: AdverseFinding[];
  contentReview: ContentReviewFinding[];
  breaches: BreachRecord[];
  sources: SourceRecord[];
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  plan: PlanId;
  planLabel: string;
  creditsRemaining: number;
  creditsTotal: number;
  reportsCompleted: number;
  nextBillingAt: string;
  paymentMethod: string;
  role: "customer" | "admin" | "partner";
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number | null;
  priceLabel: string;
  reportsPerMonth: number | string;
  modules: string[];
  apiAccess: boolean;
  aiLevel: string;
  featured?: boolean;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "open" | "failed";
}

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  at: string;
  read: boolean;
  href?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: PlanId;
  status: UserStatus;
  reportsUsed: number;
  reportsRemaining: number;
  joinedAt: string;
  lastActiveAt: string;
  clickId: string | null;
  affiliateId: string | null;
  subscribedAt: string;
  cancelledAt: string | null;
}

export interface AdminReportRow {
  id: string;
  user: string;
  person: string;
  status: InvestigationStatus;
  sources: number;
  processingSeconds: number;
  apiCost: number;
  aiCost: number;
  totalCost: number;
  createdAt: string;
}

export interface Provider {
  id: string;
  name: string;
  status: "healthy" | "degraded" | "disabled";
  lastRequestAt: string;
  requestsToday: number;
  errorRate: number;
  monthlyCost: number;
  dailyLimit: number;
  monthlyBudget: number;
  alert: string | null;
}

export interface CostBreakdown {
  label: string;
  amount: number;
}

export interface AffiliateStats {
  clicks: number;
  signups: number;
  conversions: number;
  activeSubscribers: number;
  pending: number;
  approved: number;
  paid: number;
}

export interface Referral {
  id: string;
  customer: string;
  plan: string;
  status: string;
  signedUpAt: string;
  commission: number;
}

export interface Commission {
  id: string;
  referral: string;
  amount: number;
  status: CommissionStatus;
  period: string;
  clickId: string;
  affiliateId: string;
  reversalReason?: string | null;
}

export interface Payout {
  id: string;
  amount: number;
  status: "scheduled" | "paid";
  date: string;
  method: string;
}

export interface Campaign {
  id: string;
  name: string;
  code: string;
  clicks: number;
  conversions: number;
  active: boolean;
}

export type PartnerActivityPeriod = "today" | "yesterday" | "last2days" | "last7days" | "lastMonth";

export interface PartnerActivity {
  leads: number;
  conversations: number;
}

export interface PartnerClient {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  referralLink: string;
  landingPage: string;
  joinedAt: string;
  clicks: number;
  conversions: number;
  activity: Record<PartnerActivityPeriod, PartnerActivity>;
}

export type DeviceType = "Desktop" | "Mobile" | "Tablet";

export interface TrackedLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  device: DeviceType;
  browser: string;
  affiliateId: string | null;
  submittedAt: string;
}

export interface AuditLog {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
}

export interface SystemLog {
  id: string;
  at: string;
  level: "info" | "warn" | "error";
  provider?: string;
  message: string;
}
