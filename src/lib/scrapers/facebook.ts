/**
 * Port of `apps/influencer_hub/services/content_fetchers/facebook_content_scraper.py`
 * (`FacebookProfileFetcher`).
 *
 * Runs an Apify actor-task with retry logic, then normalizes the scraped posts.
 * URL cleaning, timestamp parsing and post-type detection are ported verbatim.
 * The Django existence check that skipped already-saved posts is dropped (no
 * datastore); the profile-picture download is reduced to surfacing the URL.
 */

import { requireConfig, scraperConfig } from "./config";
import {
  computeFetchedTotals,
  emptyStats,
  firstCount,
  firstNum,
  getArr,
  getBool,
  getObj,
  getStr,
  isRec,
  nowIso,
  resolveUsername,
  truncate,
  type Rec,
} from "./common";
import { createLogger } from "./logger";
import { requestJson } from "./http";
import type {
  ContentType,
  ProfileFetcher,
  ProfileInput,
  ProfileStats,
  ScrapedMedia,
  ScrapedPost,
  ScrapedProfile,
} from "./types";
import { ContentTypeChoices } from "./types";

const logger = createLogger("facebook");

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;
const MAX_URL_LENGTH = 500;

export class FacebookProfileFetcher implements ProfileFetcher {
  private readonly url: string;
  private readonly username: string;
  private readonly token: string;
  private readonly taskId: string;

  constructor(input: ProfileInput) {
    this.url = input.url;
    this.username = resolveUsername(input);
    this.token = requireConfig("apifyApiToken");
    this.taskId = requireConfig("facebookTaskId");
  }

  /** Clean and truncate URLs to a sane length (Facebook CDN URLs get huge). */
  private cleanUrl(url: string): string {
    if (!url) return "";
    if (url.length <= MAX_URL_LENGTH) return url;
    try {
      const parsed = new URL(url);
      const path =
        parsed.pathname.length > 100 ? parsed.pathname.slice(0, 100) : parsed.pathname;
      const query = parsed.search ? parsed.search.slice(1, 101) : "";
      const rebuilt = `${parsed.protocol}//${parsed.host}${path}${query ? `?${query}` : ""}`;
      return rebuilt.slice(0, MAX_URL_LENGTH);
    } catch {
      return url.slice(0, MAX_URL_LENGTH);
    }
  }

  private makeApiRequest<T = unknown>(
    url: string,
    method: "GET" | "POST" = "GET",
    payload?: unknown,
  ): Promise<T | null> {
    return requestJson<T>(url, {
      method,
      body: method === "POST" ? payload : undefined,
      retries: MAX_RETRIES,
      retryDelayMs: RETRY_DELAY_MS,
      logger,
    });
  }

  /** Execute the Apify actor-task and return the dataset items. */
  async runActor(): Promise<unknown[]> {
    const maxResults = scraperConfig.contentFetching.maxResults;
    const taskUrl = `https://api.apify.com/v2/actor-tasks/${this.taskId}/runs?token=${this.token}&waitForFinish=60`;

    const payload = {
      startUrls: [{ url: `https://www.facebook.com/${this.username}` }],
      resultsLimit: maxResults,
    };

    const runData = await this.makeApiRequest<Rec>(taskUrl, "POST", payload);
    if (!runData) {
      logger.error("Failed to start Facebook scraper actor");
      return [];
    }

    const data = getObj(runData, "data");
    if (getStr(data, "status") !== "SUCCEEDED") {
      logger.error(`FB Actor failed: ${getStr(data, "status")}`);
      return [];
    }

    const datasetId = getStr(data, "defaultDatasetId");
    if (!datasetId) {
      logger.error("No dataset ID for Facebook task");
      return [];
    }

    const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${this.token}&format=json`;
    const items = await this.makeApiRequest<unknown[]>(datasetUrl);

    if (!items) {
      logger.error("Failed to retrieve dataset from Apify");
      return [];
    }
    if (
      Array.isArray(items) &&
      items.length === 1 &&
      isRec(items[0]) &&
      "error" in items[0]
    ) {
      logger.error(
        `FB Apify error: ${getStr(items[0], "errorDescription") || "Unknown error"}`,
      );
      return [];
    }

    const list = Array.isArray(items) ? items : [];
    logger.info(`Retrieved ${list.length} Facebook posts`);
    return list;
  }

  /** Parse the various timestamp formats Facebook returns into an ISO string. */
  private parseTimestamp(timestamp: unknown): string {
    if (typeof timestamp === "number") {
      return new Date(timestamp * 1000).toISOString();
    }
    if (typeof timestamp === "string" && timestamp) {
      const parsed = Date.parse(timestamp.replace("Z", "+00:00"));
      if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
      const fallback = Date.parse(timestamp);
      if (!Number.isNaN(fallback)) return new Date(fallback).toISOString();
      logger.warn(`Unrecognized timestamp format: ${timestamp}`);
      return nowIso();
    }
    logger.warn("No valid timestamp found, using current time");
    return nowIso();
  }

  private determinePostType(post: Rec): ContentType {
    const url = getStr(post, "url").toLowerCase();
    const media = getArr(post, "media");

    const isVideo =
      getBool(post, "isVideo") ||
      url.includes("videos/") ||
      getStr(post, "mediaType") === "video" ||
      media.some((m) => getStr(m, "type") === "video") ||
      (isRec(post) && post.video != null);
    if (isVideo) return ContentTypeChoices.VIDEO;

    const hasMedia = media.length > 0;
    const isImage =
      getBool(post, "hasImage") ||
      url.includes("images/") ||
      (hasMedia &&
        media.some(
          (m) =>
            getStr(m, "type") === "image" ||
            (isRec(m) && m.image != null) ||
            (isRec(m) && m.thumbnail != null),
        )) ||
      post.imageUrl != null;
    if (isImage) return ContentTypeChoices.IMAGE;

    return ContentTypeChoices.TEXT;
  }

  private extractMediaUrls(post: Rec): string[] {
    const urls: string[] = [];
    for (const media of getArr(post, "media")) {
      const thumbnail = getStr(media, "thumbnail");
      const mediaUrl = getStr(media, "url");
      const imageUri = getStr(getObj(media, "image"), "uri");
      if (thumbnail) urls.push(this.cleanUrl(thumbnail));
      else if (mediaUrl) urls.push(this.cleanUrl(mediaUrl));
      else if (imageUri) urls.push(this.cleanUrl(imageUri));
    }
    if (urls.length === 0) {
      const imageUrl = getStr(post, "imageUrl");
      if (imageUrl) urls.push(this.cleanUrl(imageUrl));
    }
    return urls;
  }

  private buildPost(post: Rec): ScrapedPost | null {
    try {
      const rawId = isRec(post) ? (post.postId ?? post.id) : undefined;
      const postId = truncate(rawId == null ? "" : String(rawId), 200);
      if (!postId) {
        logger.warn("Post missing ID, skipping");
        return null;
      }

      const publishedAt = this.parseTimestamp(
        isRec(post) ? (post.timestamp ?? post.time) : undefined,
      );
      const postType = this.determinePostType(post);
      const postUrl = this.cleanUrl(getStr(post, "url"));

      const content: ScrapedPost = {
        postType,
        captionText: truncate(getStr(post, "text"), 5000),
        postUrl,
        likesCount: firstNum(post, ["likes", "likesCount"], 0),
        commentsCount: firstNum(post, ["comments", "commentsCount"], 0),
        sharesCount: firstNum(post, ["shares", "sharesCount"], 0),
        viewsCount: firstNum(post, ["viewsCount", "videoViewCount"], 0),
        publishedAt,
        platformSpecificData: {
          post_id: postId,
          facebook_id: truncate(getStr(post, "facebookId"), 200),
          top_level_url: this.cleanUrl(getStr(post, "topLevelUrl")),
          feedback_id: truncate(getStr(post, "feedbackId"), 200),
          hashtags: getArr(post, "textReferences").slice(0, 50),
          mentions: [],
        },
        media: [],
      };

      const durationMs =
        typeof post.playable_duration_in_ms === "number"
          ? post.playable_duration_in_ms
          : null;

      for (const mediaUrl of this.extractMediaUrls(post)) {
        const entry: ScrapedMedia = {
          mediaType: postType,
          fileUrl: mediaUrl,
          thumbnailUrl: mediaUrl,
          durationMs,
          fileSize: null,
        };
        content.media.push(entry);
      }

      return content;
    } catch (error) {
      logger.error(`Failed to create post: ${String(error)}`);
      return null;
    }
  }

  /**
   * Pull account-level counts out of a scraped post. The Facebook Posts Scraper
   * only sometimes carries page figures (`pageFollowers` / `pageLikes` for
   * Pages); personal profiles usually expose none, so these stay `null`.
   */
  private extractStats(post: Rec): ProfileStats {
    const stats = emptyStats();
    const user = getObj(post, "user");
    const pageInfo = getObj(post, "pageInfo");
    stats.followers =
      firstCount(post, ["pageFollowers", "followersCount", "followers"]) ??
      firstCount(pageInfo, ["followers", "followersCount"]) ??
      firstCount(user, ["followers", "followersCount"]);
    stats.following =
      firstCount(post, ["pageFollowing"]) ??
      firstCount(user, ["following", "followingCount"]);
    stats.totalPosts = firstCount(pageInfo, ["postsCount"]);
    return stats;
  }

  async fetchProfile(): Promise<ScrapedProfile> {
    const rawPosts = await this.runActor();
    const posts: ScrapedPost[] = [];
    let profilePictureUrl: string | null = null;
    let stats = emptyStats();

    if (rawPosts.length > 0 && isRec(rawPosts[0])) {
      const first = rawPosts[0];
      profilePictureUrl = getStr(getObj(first, "user"), "profilePic") || null;
      if (profilePictureUrl) {
        logger.info(`Found profile picture for ${this.username}`);
      }
      stats = this.extractStats(first);
      logger.debug(`First post keys: ${Object.keys(first).join(", ")}`);
    }

    for (const raw of rawPosts) {
      if (!isRec(raw)) continue;
      const built = this.buildPost(raw);
      if (built) posts.push(built);
    }

    logger.info(`Parsed ${posts.length}/${rawPosts.length} Facebook posts`);
    return {
      platform: "facebook",
      username: this.username,
      url: this.url,
      profilePictureUrl,
      stats,
      totals: computeFetchedTotals(posts),
      posts,
    };
  }
}
