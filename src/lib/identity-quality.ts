export type MatchQualityLevel = "LOW" | "MEDIUM" | "HIGH";

export function matchQuality(fields: Record<string, string>) {
  const score =
    (fields.email ? 30 : 0) +
    (fields.city || fields.country ? 20 : 0) +
    (fields.linkedin || fields.instagram || fields.x || fields.other ? 25 : 0) +
    (fields.fullName || (fields.firstName && fields.lastName) ? 15 : 0) +
    (fields.company ? 10 : 0);
  const level: MatchQualityLevel = score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";
  return { level, score };
}
