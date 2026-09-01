/**
 * Port of `apps/influencer_hub/services/content_fetchers/tiktok_content_fetcher.py`
 * (`TikTokProfileFetcher`).
 *
 * Calls `run-sync-get-dataset-items` and normalizes the returned videos. The
 * Python version ran the raw actor (`/v2/acts/{id}/...`); here TikTok is a saved
 * Apify task (`/v2/actor-tasks/{id}/...`) like Instagram and Facebook. The input
 * payload and output mapping are unchanged.
 */

import { requireConfig } from "./config";
import {
  computeFetchedTotals,
  emptyStats,
  firstCount,
  firstStr,
  getNum,
  getObj,
  getStr,
  isRec,
  nowIso,
  resolveUsername,
} from "./common";
import { createLogger } from "./logger";
import { requestJson } from "./http";
import type {
  ProfileFetcher,
  ProfileInput,
  ScrapedMedia,
  ScrapedPost,
  ScrapedProfile,
} from "./types";
import { ContentTypeChoices } from "./types";

const logger = createLogger("tiktok");

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

export class TikTokProfileFetcher implements ProfileFetcher {
  private readonly url: string;
  private readonly username: string;
  private readonly token: string;
  private readonly taskId: string;

  constructor(input: ProfileInput) {
    this.url = input.url;
    // Deviation from the Python: strip a leading "@" so the actor `profiles`
    // input and the built tiktok.com URL use the bare handle (the original
    // produced `.../@@handle/...`).
    this.username = resolveUsername(input).replace(/^@+/, "");
    this.token = requireConfig("apifyApiToken");
    this.taskId = requireConfig("tiktokTaskId");
  }

  /** Run the Apify task synchronously and return the dataset items. */
  async runActor(): Promise<unknown[]> {
    const url = `https://api.apify.com/v2/actor-tasks/${this.taskId}/run-sync-get-dataset-items?token=${this.token}`;

    const payload = {
      excludePinnedPosts: false,
      profiles: [this.username],
      proxyCountryCode: "None",
      resultsPerPage: 3,
      shouldDownloadVideos: false,
      profileScrapeSections: ["videos"],
      profileSorting: "latest",
      proxy: { useApifyProxy: true },
    };

    const data = await requestJson<unknown[]>(url, {
      method: "POST",
      body: payload,
      retries: MAX_RETRIES,
      retryDelayMs: RETRY_DELAY_MS,
      logger,
    });

    if (!data || !Array.isArray(data)) {
      logger.error("Failed to fetch TikTok content");
      return [];
    }

    logger.info(`Retrieved ${data.length} TikTok content`);
    return data;
  }

  private parseTimestamp(timestamp: string): string {
    const parsed = Date.parse((timestamp || "").replace("Z", "+00:00"));
    if (Number.isNaN(parsed)) {
      logger.warn(`Failed to parse timestamp ${timestamp}`);
      return nowIso();
    }
    return new Date(parsed).toISOString();
  }

  private buildPost(post: Record<string, unknown>): ScrapedPost | null {
    try {
      const videoId = getStr(post, "id");
      const videoUrl = `https://www.tiktok.com/@${this.username}/video/${videoId}`;
      const thumbnailUrl = getStr(post, "cover");

      const content: ScrapedPost = {
        postType: ContentTypeChoices.VIDEO,
        captionText: getStr(post, "text"),
        postUrl: videoUrl,
        likesCount: getNum(post, "diggCount", 0),
        commentsCount: getNum(post, "commentCount", 0),
        sharesCount: getNum(post, "shareCount", 0),
        viewsCount: getNum(post, "playCount", 0),
        publishedAt: this.parseTimestamp(getStr(post, "createTimeISO")),
        platformSpecificData: {
          thumbnail: thumbnailUrl,
          video_id: videoId,
          authorMeta: getObj(post, "authorMeta"),
          music: getObj(post, "musicMeta"),
        },
        media: [],
      };

      if (thumbnailUrl) {
        const media: ScrapedMedia = {
          mediaType: ContentTypeChoices.IMAGE,
          fileUrl: thumbnailUrl,
          thumbnailUrl,
          durationMs: null,
          fileSize: null,
        };
        content.media.push(media);
      }

      return content;
    } catch (error) {
      logger.error(`Failed to create post: ${String(error)}`);
      return null;
    }
  }

  async fetchProfile(): Promise<ScrapedProfile> {
    const rawPosts = await this.runActor();
    const posts: ScrapedPost[] = [];
    const stats = emptyStats();
    let profilePictureUrl: string | null = null;

    // Every video carries the same `authorMeta` block — read account stats off it.
    const authorMeta = rawPosts.length && isRec(rawPosts[0])
      ? getObj(rawPosts[0], "authorMeta")
      : {};
    if (Object.keys(authorMeta).length) {
      stats.followers = firstCount(authorMeta, ["fans", "followerCount", "followers"]);
      stats.following = firstCount(authorMeta, ["following", "followingCount"]);
      stats.totalPosts = firstCount(authorMeta, ["video", "videoCount"]);
      stats.totalLikes = firstCount(authorMeta, ["heart", "heartCount"]);
      profilePictureUrl =
        firstStr(authorMeta, ["avatar", "avatarLarger", "avatarMedium"]) || null;
    }

    for (const raw of rawPosts) {
      if (!isRec(raw)) continue;
      const built = this.buildPost(raw);
      if (built) posts.push(built);
    }

    logger.info(`Parsed ${posts.length}/${rawPosts.length} TikTok content`);
    return {
      platform: "tiktok",
      username: this.username,
      url: this.url,
      profilePictureUrl,
      stats,
      totals: computeFetchedTotals(posts),
      posts,
    };
  }
}
