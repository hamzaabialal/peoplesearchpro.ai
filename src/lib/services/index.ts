import {
  adminReports,
  adminUsers,
  affiliateStats,
  auditLogs,
  campaigns,
  commissions,
  costTotals,
  currentUser,
  investigations,
  invoices,
  notifications,
  payouts,
  perReportCosts,
  pipelineTemplate,
  plans,
  providers,
  referrals,
  reportsIndex,
  reportsOverTime,
  sampleReport,
  savedPeople,
  systemLogs,
} from "@/lib/data/mock";
import { matchQuality } from "@/lib/identity-quality";
import type {
  CurrentUser,
  IntelligenceReport,
  Investigation,
  PipelineStage,
} from "@/types";

function overlayReport(id: string): IntelligenceReport | undefined {
  if (id === sampleReport.id || id === "sample") return sampleReport;
  const row = reportsIndex.find((r) => r.id === id);
  if (!row) return undefined;
  const inv = investigations.find((i) => i.reportId === id);
  const person = inv?.person ?? sampleReport.person;
  return {
    ...sampleReport,
    id: row.id,
    investigationId: row.investigationId,
    generatedAt: row.generatedAt,
    identityConfidence: row.confidence,
    sourcesChecked: row.sources,
    person,
    personal: {
      ...sampleReport.personal,
      fullName: { ...sampleReport.personal.fullName, value: person.fullName },
      knownNames: {
        ...sampleReport.personal.knownNames,
        value: person.knownNames.length ? person.knownNames.join(" · ") : "—",
      },
      location: { ...sampleReport.personal.location, value: person.location },
      email: {
        ...sampleReport.personal.email,
        value: person.email ?? sampleReport.personal.email.value,
      },
      username: {
        ...sampleReport.personal.username,
        value: person.username ?? sampleReport.personal.username.value,
      },
    },
    identifiers: sampleReport.identifiers.map((item, i) => {
      if (i === 0) return { ...item, value: person.fullName };
      if (item.value.includes("Austin") || item.value.includes("Texas")) {
        return { ...item, value: person.location };
      }
      if (item.value.includes("Northline") && person.employer) {
        return { ...item, value: person.employer };
      }
      return item;
    }),
  };
}

const delay = (ms = 80) => new Promise((r) => setTimeout(r, ms));

export const authService = {
  async login(_email: string, _password: string) {
    await delay();
    return { user: currentUser, token: "demo_session" };
  },
  async signup(name: string, email: string, _password: string) {
    await delay();
    return { user: { ...currentUser, name, email }, token: "demo_session" };
  },
  async requestReset(_email: string) {
    await delay();
    return { ok: true };
  },
  async resetPassword(_token: string, _password: string) {
    await delay();
    return { ok: true };
  },
  async verifyEmail(_token: string) {
    await delay();
    return { ok: true };
  },
  async me(): Promise<CurrentUser> {
    await delay(20);
    return currentUser;
  },
};

export const userService = {
  async getCurrent() {
    return authService.me();
  },
  async listAdmin() {
    await delay();
    return adminUsers;
  },
};

export const investigationService = {
  async list() {
    await delay();
    return investigations;
  },
  async get(id: string): Promise<Investigation | undefined> {
    await delay();
    return investigations.find((i) => i.id === id);
  },
  async create(_payload: unknown) {
    await delay(120);
    return { id: "inv_live" };
  },
  async saveDraft(_payload: unknown) {
    await delay();
    return { ok: true };
  },
  pipeline(): PipelineStage[] {
    return pipelineTemplate.map((s) => ({ ...s }));
  },
};

export const reportService = {
  async list() {
    await delay();
    return reportsIndex;
  },
  async get(id: string): Promise<IntelligenceReport | undefined> {
    await delay();
    return overlayReport(id);
  },
};

export const identityService = {
  async matchQuality(fields: Record<string, string>) {
    await delay();
    return matchQuality(fields);
  },
};

export const providerService = {
  async list() {
    await delay();
    return providers;
  },
};

export const socialService = {
  async forReport(id: string) {
    const report = await reportService.get(id);
    return report?.social ?? [];
  },
};

export const breachService = {
  async forReport(id: string) {
    const report = await reportService.get(id);
    return report?.breaches ?? [];
  },
};

export const aiService = {
  async summarize(_investigationId: string) {
    await delay(200);
    return sampleReport.summary;
  },
};

export const stripeService = {
  async portalUrl() {
    await delay();
    return "/app/billing";
  },
  async invoices() {
    await delay();
    return invoices;
  },
  async plans() {
    await delay();
    return plans;
  },
};

export const affiliateService = {
  async stats() {
    await delay();
    return affiliateStats;
  },
  async referrals() {
    await delay();
    return referrals;
  },
  async commissions() {
    await delay();
    return commissions;
  },
  async payouts() {
    await delay();
    return payouts;
  },
  async campaigns() {
    await delay();
    return campaigns;
  },
};

export const notificationService = {
  async list() {
    await delay();
    return notifications;
  },
};

export const peopleService = {
  async list() {
    await delay();
    return savedPeople;
  },
};

export const adminOpsService = {
  async metrics() {
    await delay();
    return {
      totalUsers: 1842,
      activeSubscribers: 966,
      reportsToday: 38,
      reportsMonth: 428,
      apiSpend: 7040,
      aiSpend: 1180,
      avgReportCost: 2.31,
      mrr: 34100,
      series: reportsOverTime,
    };
  },
  async reports() {
    await delay();
    return adminReports;
  },
  async costs() {
    await delay();
    return { totals: costTotals, perReport: perReportCosts };
  },
  async logs() {
    await delay();
    return systemLogs;
  },
  async audit() {
    await delay();
    return auditLogs;
  },
};
