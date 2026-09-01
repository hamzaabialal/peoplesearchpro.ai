/**
 * Normalized output shapes for the social content scrapers.
 *
 * These mirror the Django models the Python project persisted to
 * (`ContentPost`, `ContentMedia`, `InfluencerSocialProfile`) but this project
 * has no datastore, so the fetchers return plain JSON and the caller decides
 * what to do with it.
 */

/** Mirror of `influencer_hub.utils.enums.PlatformChoices`. */
export const PLATFORMS = ["youtube", "instagram", "facebook", "tiktok"] as const;
export type Platform = (typeof PLATFORMS)[number];

/** Mirror of `influencer_hub.utils.enums.ContentTypeChoices`. */
export type ContentType = "image" | "video" | "text" | "carousel";

export const ContentTypeChoices = {
  IMAGE: "image",
  VIDEO: "video",
  TEXT: "text",
  CAROUSEL: "carousel",
} as const satisfies Record<string, ContentType>;

/** Mirror of a `ContentMedia` row. */
export interface ScrapedMedia {
  mediaType: ContentType;
  fileUrl: string;
  thumbnailUrl: string;
  /** Duration in milliseconds (Django used a `DurationField`). */
  durationMs: number | null;
  fileSize: number | null;
}

/** Mirror of a `ContentPost` row plus its related `ContentMedia`. */
export interface ScrapedPost {
  postType: ContentType;
  captionText: string;
  postUrl: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number | null;
  /** ISO-8601 UTC timestamp. */
  publishedAt: string;
  platformSpecificData: Record<string, unknown>;
  media: ScrapedMedia[];
}

/**
 * Account-level figures taken from the platform's profile metadata (not summed
 * from `posts`). `null` where the platform / actor does not expose the value.
 */
export interface ProfileStats {
  /** Followers / subscribers / fans. */
  followers: number | null;
  /** Accounts this profile follows. */
  following: number | null;
  /** Lifetime number of posts / videos on the account. */
  totalPosts: number | null;
  /** Lifetime likes received by the account (only TikTok exposes this). */
  totalLikes: number | null;
  /** Lifetime views on the account (Instagram / YouTube where available). */
  totalViews: number | null;
}

/** Sums computed across the posts actually fetched (the `posts` array). */
export interface FetchedTotals {
  posts: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

/** Mirror of the `InfluencerSocialProfile` fields the fetchers populate. */
export interface ScrapedProfile {
  platform: Platform;
  username: string;
  url: string;
  /** The Python code downloaded this to disk; here we just surface the URL. */
  profilePictureUrl: string | null;
  /** Account-level figures from profile metadata. */
  stats: ProfileStats;
  /** Sums over `posts` (this fetch only, not the account lifetime). */
  totals: FetchedTotals;
  posts: ScrapedPost[];
}

/** Input to a fetcher — the equivalent of an `InfluencerSocialProfile` instance. */
export interface ProfileInput {
  /** The public profile / channel URL the user pasted. */
  url: string;
  /**
   * Optional handle. When omitted it is derived from `url`, exactly like
   * `InfluencerSocialProfile.extract_username_from_url`.
   */
  username?: string;
}

export interface ProfileFetcher {
  fetchProfile(): Promise<ScrapedProfile>;
}
