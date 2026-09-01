/**
 * Scraper configuration, read from the environment.
 *
 * Port of the Django `settings` keys the fetchers relied on:
 *   APIFY_API_TOKEN, INSTAGRAM_TASK_ID, FACEBOOK_TASK_ID, TIKTOK_TASK_ID,
 *   GOOGLE_CLOUD_API_KEY, CONTENT_FETCHING = { MAX_DAYS_OLD, MAX_RESULTS }
 *
 * (The Python project used TIKTOK_ACTOR_ID against the raw-actor endpoint; here
 * TikTok is a saved Apify task like Instagram / Facebook.)
 *
 * See `src/lib/scrapers/README.md` for the variables to set.
 */

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const scraperConfig = {
  apifyApiToken: process.env.APIFY_API_TOKEN ?? "",
  instagramTaskId: process.env.INSTAGRAM_TASK_ID ?? "",
  facebookTaskId: process.env.FACEBOOK_TASK_ID ?? "",
  tiktokTaskId: process.env.TIKTOK_TASK_ID ?? "",
  googleCloudApiKey: process.env.GOOGLE_CLOUD_API_KEY ?? "",

  /** Mirror of `settings.CONTENT_FETCHING`. */
  contentFetching: {
    maxDaysOld: num(process.env.SCRAPER_MAX_DAYS_OLD, 30),
    maxResults: num(process.env.SCRAPER_MAX_RESULTS, 5),
  },
} as const;

export class ScraperConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScraperConfigError";
  }
}

/** Throw a clear error when a required credential is missing. */
export function requireConfig(key: keyof typeof scraperConfig): string {
  const value = scraperConfig[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new ScraperConfigError(
      `Missing scraper configuration: set the ${envVarFor(key)} environment variable.`,
    );
  }
  return value;
}

function envVarFor(key: keyof typeof scraperConfig): string {
  switch (key) {
    case "apifyApiToken":
      return "APIFY_API_TOKEN";
    case "instagramTaskId":
      return "INSTAGRAM_TASK_ID";
    case "facebookTaskId":
      return "FACEBOOK_TASK_ID";
    case "tiktokTaskId":
      return "TIKTOK_TASK_ID";
    case "googleCloudApiKey":
      return "GOOGLE_CLOUD_API_KEY";
    default:
      return String(key);
  }
}
