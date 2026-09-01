/**
 * Social content scrapers — a TypeScript port of the Python project's
 * `apps/influencer_hub/services/content_fetchers/` package.
 *
 * Same four platforms (Instagram, Facebook, TikTok, YouTube), same upstream
 * services (Apify actor-tasks / actors, YouTube Data API v3), same field
 * mapping. The only behavioural difference: there is no datastore here, so the
 * fetchers return normalized JSON (`ScrapedProfile`) instead of writing Django
 * `ContentPost` / `ContentMedia` rows.
 *
 * Usage:
 *
 *   import { fetchSocialProfile } from "@/lib/scrapers";
 *
 *   const profile = await fetchSocialProfile({
 *     platform: "instagram",
 *     url: "https://www.instagram.com/nasa/",
 *   });
 *
 * Runs server-side only (needs API credentials — see README.md).
 */

import { createLogger } from "./logger";
import { FacebookProfileFetcher } from "./facebook";
import { InstagramProfileFetcher } from "./instagram";
import { TikTokProfileFetcher } from "./tiktok";
import { YouTubeProfileFetcher } from "./youtube";
import type { Platform, ProfileFetcher, ProfileInput, ScrapedProfile } from "./types";
import { PLATFORMS } from "./types";

export type { Platform, ProfileInput, ScrapedProfile } from "./types";
export type { ScrapedPost, ScrapedMedia, ContentType } from "./types";
export { PLATFORMS, ContentTypeChoices } from "./types";
export { ScraperConfigError } from "./config";
export { FacebookProfileFetcher } from "./facebook";
export { InstagramProfileFetcher } from "./instagram";
export { TikTokProfileFetcher } from "./tiktok";
export { YouTubeProfileFetcher } from "./youtube";

const logger = createLogger("dispatch");

/** Port of the Python `fetcher_map`. */
const fetcherMap: Record<Platform, new (input: ProfileInput) => ProfileFetcher> = {
  youtube: YouTubeProfileFetcher,
  tiktok: TikTokProfileFetcher,
  instagram: InstagramProfileFetcher,
  facebook: FacebookProfileFetcher,
};

export function isSupportedPlatform(value: string): value is Platform {
  return (PLATFORMS as readonly string[]).includes(value);
}

/** Map a pasted URL to its platform, or `null` if unrecognized. */
export function detectPlatform(url: string): Platform | null {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (host.includes("instagram.com")) return "instagram";
  if (host.includes("facebook.com") || host.includes("fb.com")) return "facebook";
  if (host.includes("tiktok.com")) return "tiktok";
  if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
  return null;
}

export interface FetchSocialProfileInput extends ProfileInput {
  /** When omitted, inferred from the URL host via `detectPlatform`. */
  platform?: Platform;
}

/**
 * Port of `tasks.fetch_social_profile_and_posts`: pick the fetcher for the
 * platform and run it. Throws if the platform is missing / unsupported or a
 * required credential is not configured.
 */
export async function fetchSocialProfile(
  input: FetchSocialProfileInput,
): Promise<ScrapedProfile> {
  const platform = input.platform ?? detectPlatform(input.url);
  if (!platform || !isSupportedPlatform(platform)) {
    throw new Error(
      `No fetcher defined for platform: ${String(platform)} (url: ${input.url})`,
    );
  }

  const FetcherClass = fetcherMap[platform];
  const fetcher = new FetcherClass({ url: input.url, username: input.username });

  logger.info(`Fetching ${platform} profile: ${input.url}`);
  const profile = await fetcher.fetchProfile();
  logger.info(
    `Fetched ${profile.posts.length} ${platform} posts for ${profile.username}`,
  );
  return profile;
}

/** Fetch several profiles; failures are captured per-entry, not thrown. */
export async function fetchSocialProfiles(
  inputs: FetchSocialProfileInput[],
): Promise<
  Array<
    | { ok: true; profile: ScrapedProfile }
    | { ok: false; input: FetchSocialProfileInput; error: string }
  >
> {
  return Promise.all(
    inputs.map(async (input) => {
      try {
        return { ok: true as const, profile: await fetchSocialProfile(input) };
      } catch (error) {
        logger.error(`Failed to fetch ${input.url}: ${String(error)}`);
        return { ok: false as const, input, error: String(error) };
      }
    }),
  );
}
