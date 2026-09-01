import type {
  FetchedTotals,
  ProfileInput,
  ProfileStats,
  ScrapedPost,
} from "./types";

/** All-null profile stats — the starting point every fetcher fills in. */
export function emptyStats(): ProfileStats {
  return {
    followers: null,
    following: null,
    totalPosts: null,
    totalLikes: null,
    totalViews: null,
  };
}

/** First readable count across the given keys (numbers or numeric strings). */
export function firstCount(obj: unknown, keys: string[]): number | null {
  if (!isRec(obj)) return null;
  for (const key of keys) {
    const n = toCount(obj[key]);
    if (n != null) return n;
  }
  return null;
}

/** Coerce a count that may arrive as a number or a numeric string. */
export function toCount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(/,/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/** Sum likes / comments / shares / views across the posts that were fetched. */
export function computeFetchedTotals(posts: ScrapedPost[]): FetchedTotals {
  return posts.reduce<FetchedTotals>(
    (acc, post) => ({
      posts: acc.posts + 1,
      likes: acc.likes + (post.likesCount || 0),
      comments: acc.comments + (post.commentsCount || 0),
      shares: acc.shares + (post.sharesCount || 0),
      views: acc.views + (post.viewsCount || 0),
    }),
    { posts: 0, likes: 0, comments: 0, shares: 0, views: 0 },
  );
}

/** Loose shape for the JSON records the upstream APIs return. */
export type Rec = Record<string, unknown>;

export function isRec(value: unknown): value is Rec {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** `dict.get(key, "")` */
export function getStr(obj: unknown, key: string): string {
  if (!isRec(obj)) return "";
  const value = obj[key];
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

/** `dict.get(key, fallback)` for numeric fields. */
export function getNum(obj: unknown, key: string, fallback = 0): number {
  if (!isRec(obj)) return fallback;
  const value = obj[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return fallback;
}

/** `dict.get(key, [])` */
export function getArr(obj: unknown, key: string): unknown[] {
  if (!isRec(obj)) return [];
  const value = obj[key];
  return Array.isArray(value) ? value : [];
}

/** `dict.get(key, {})` */
export function getObj(obj: unknown, key: string): Rec {
  if (!isRec(obj)) return {};
  const value = obj[key];
  return isRec(value) ? value : {};
}

/** `dict.get(key, False)` */
export function getBool(obj: unknown, key: string): boolean {
  if (!isRec(obj)) return false;
  return obj[key] === true;
}

/** First truthy value across the given keys — the `a or b or c` idiom. */
export function firstStr(obj: unknown, keys: string[]): string {
  for (const key of keys) {
    const value = getStr(obj, key);
    if (value) return value;
  }
  return "";
}

/** First non-zero numeric value across the given keys — `a or b`. */
export function firstNum(obj: unknown, keys: string[], fallback = 0): number {
  for (const key of keys) {
    const value = getNum(obj, key, 0);
    if (value) return value;
  }
  return fallback;
}

/**
 * Port of `InfluencerSocialProfile.extract_username_from_url`.
 * Returns the trailing path segment, with the YouTube `@handle` special case.
 */
export function extractUsernameFromUrl(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/^\/+|\/+$/g, "");
    if (parsed.hostname.includes("youtube.com") && path.startsWith("@")) {
      return path.slice(1);
    }
    if (path) {
      return path.split("/").filter(Boolean).pop() ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Port of `InfluencerSocialProfile.save()` auto-fill: use the supplied handle,
 * otherwise derive it from the URL.
 */
export function resolveUsername(input: ProfileInput): string {
  const username = input.username?.trim() || extractUsernameFromUrl(input.url) || "";
  if (!username) {
    throw new Error(
      `Could not determine a username from "${input.url}". Pass { username } explicitly.`,
    );
  }
  return username;
}

/** Django truncated several string fields before saving; keep the same caps. */
export function truncate(value: string | null | undefined, max: number): string {
  if (!value) return "";
  return value.length > max ? value.slice(0, max) : value;
}

export function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Parse an ISO-8601 duration (e.g. `PT1M30S`) to seconds.
 * Stand-in for `isodate.parse_duration(...).total_seconds()` used by YouTube.
 */
export function iso8601DurationToSeconds(iso: string): number {
  const match = /^P(?:([\d.]+)D)?T(?:([\d.]+)H)?(?:([\d.]+)M)?(?:([\d.]+)S)?$/.exec(
    iso || "PT0S",
  );
  if (!match) return 0;
  const [, days, hours, minutes, seconds] = match;
  return (
    (Number(days) || 0) * 86400 +
    (Number(hours) || 0) * 3600 +
    (Number(minutes) || 0) * 60 +
    (Number(seconds) || 0)
  );
}
