/**
 * Port of `apps/influencer_hub/services/content_fetchers/youtube_content_fetcher.py`
 * (`YouTubeProfileFetcher`).
 *
 * Uses the YouTube Data API v3: resolve the channel id, walk the channel's
 * "uploads" playlist, then hydrate each item with contentDetails. Videos older
 * than `SCRAPER_MAX_DAYS_OLD` are dropped, exactly like the Python cutoff.
 *
 * Channel-id resolution can itself hit the API, so (unlike the Python
 * constructor) it happens inside `fetchProfile()`.
 */

import { requireConfig, scraperConfig } from "./config";
import {
  computeFetchedTotals,
  emptyStats,
  firstCount,
  firstStr,
  getArr,
  getBool,
  getObj,
  getStr,
  isRec,
  iso8601DurationToSeconds,
  resolveUsername,
} from "./common";
import { createLogger } from "./logger";
import { requestJson } from "./http";
import type {
  ContentType,
  ProfileFetcher,
  ProfileInput,
  ScrapedMedia,
  ScrapedPost,
  ScrapedProfile,
} from "./types";
import { ContentTypeChoices } from "./types";

const logger = createLogger("youtube");

const BASE_API_URL = "https://www.googleapis.com/youtube/v3";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

export class YouTubeProfileFetcher implements ProfileFetcher {
  private readonly profileUrl: string;
  private readonly username: string;
  private readonly apiKey: string;
  private channelId = "";

  constructor(input: ProfileInput) {
    this.profileUrl = input.url;
    // `username` is only used as a fallback label; channel id drives everything.
    this.username = input.username?.trim() || safeUsername(input.url);
    this.apiKey = requireConfig("googleCloudApiKey");
  }

  private makeApiRequest<T = unknown>(
    url: string,
    params: Record<string, string | number>,
  ): Promise<T | null> {
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)]),
    ).toString();
    logger.debug(`Making request to ${url} with params: ${qs}`);
    return requestJson<T>(`${url}?${qs}`, {
      retries: MAX_RETRIES,
      retryDelayMs: RETRY_DELAY_MS,
      logger,
    });
  }

  /** Extract a channel id from the various YouTube URL formats. */
  async extractChannelId(url: string): Promise<string> {
    if (url.includes("/channel/")) {
      return url.split("/channel/")[1].split("/")[0];
    }
    if (url.includes("/@")) {
      const handle = url.split("/@")[1].split("/")[0];
      return this.getChannelIdByUsername(handle);
    }
    if (url.includes("/user/")) {
      const user = url.split("/user/")[1].split("/")[0];
      return this.getChannelIdByUsername(user);
    }
    if (url.startsWith("UC") && url.length >= 22) {
      return url;
    }
    return this.extractChannelIdFromUnknownUrl(url);
  }

  private async extractChannelIdFromUnknownUrl(url: string): Promise<string> {
    try {
      const parts = url.split("/").filter(Boolean);
      const lastPart = parts[parts.length - 1] ?? "";

      if (!lastPart.startsWith("UC")) {
        return this.getChannelIdByUsername(lastPart);
      }

      const res = await this.makeApiRequest<Record<string, unknown>>(
        `${BASE_API_URL}/channels`,
        { id: lastPart, key: this.apiKey, part: "id" },
      );
      const items = getArr(res, "items");
      if (items.length && isRec(items[0])) return getStr(items[0], "id");
    } catch (error) {
      logger.error(`Failed to extract channel ID from URL ${url}: ${String(error)}`);
    }
    return "";
  }

  /** Resolve a channel id from a username / handle via the search endpoint. */
  async getChannelIdByUsername(username: string): Promise<string> {
    const res = await this.makeApiRequest<Record<string, unknown>>(
      `${BASE_API_URL}/search`,
      {
        q: username,
        type: "channel",
        part: "snippet,id",
        key: this.apiKey,
        maxResults: 1,
      },
    );
    if (!res) return "";
    const items = getArr(res, "items");
    if (items.length && isRec(items[0])) {
      const id = getObj(items[0], "id");
      const channelId = getStr(id, "channelId");
      if (channelId) return channelId;
    }
    return "";
  }

  /** Additional details for a single video. */
  async getVideoDetails(videoId: string): Promise<Record<string, unknown>> {
    const res = await this.makeApiRequest<Record<string, unknown>>(
      `${BASE_API_URL}/videos`,
      { id: videoId, key: this.apiKey, part: "contentDetails" },
    );
    const items = getArr(res, "items");
    return items.length && isRec(items[0]) ? items[0] : {};
  }

  private parsePublishedAt(timestamp: string): string {
    const parsed = Date.parse(timestamp);
    return Number.isNaN(parsed)
      ? new Date().toISOString()
      : new Date(parsed).toISOString();
  }

  /**
   * Faithful to the Python: both branches return VIDEO, but the ISO duration is
   * still parsed (and available should Shorts ever need their own type).
   */
  private determineContentType(durationIso: string): ContentType {
    const isShort = iso8601DurationToSeconds(durationIso) <= 60;
    // Faithful to the Python: Shorts and long-form both map to VIDEO.
    return isShort ? ContentTypeChoices.VIDEO : ContentTypeChoices.VIDEO;
  }

  private async buildPost(item: Record<string, unknown>): Promise<ScrapedPost | null> {
    try {
      const contentDetails = getObj(item, "contentDetails");
      const snippet = getObj(item, "snippet");

      const publishedAt = getStr(contentDetails, "videoPublishedAt");
      const videoId = getStr(contentDetails, "videoId");
      const title = getStr(snippet, "title");
      const description = getStr(snippet, "description");
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const thumbnails = getObj(snippet, "thumbnails");
      const highThumb = getStr(getObj(thumbnails, "high"), "url");

      const videoDetails = await this.getVideoDetails(videoId);
      const durationIso =
        getStr(getObj(videoDetails, "contentDetails"), "duration") || "PT0S";

      const post: ScrapedPost = {
        postType: this.determineContentType(durationIso),
        captionText: description || title,
        postUrl: videoUrl,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        viewsCount: null,
        publishedAt: this.parsePublishedAt(publishedAt),
        platformSpecificData: {
          thumbnail: highThumb,
          video_id: videoId,
          raw_snippet: snippet,
        },
        media: [],
      };

      for (const [, thumbData] of Object.entries(thumbnails)) {
        const thumbUrl = getStr(thumbData, "url");
        if (!thumbUrl) continue;
        const media: ScrapedMedia = {
          mediaType: ContentTypeChoices.IMAGE,
          fileUrl: thumbUrl,
          thumbnailUrl: thumbUrl,
          durationMs: null,
          fileSize: null,
        };
        post.media.push(media);
      }

      return post;
    } catch (error) {
      logger.error(`Failed to create post: ${String(error)}`);
      return null;
    }
  }

  async fetchProfile(): Promise<ScrapedProfile> {
    this.channelId = await this.extractChannelId(this.profileUrl);
    logger.info(`Starting YouTube fetch, channel ID: ${this.channelId}`);

    const maxDays = scraperConfig.contentFetching.maxDaysOld;
    const maxResults = scraperConfig.contentFetching.maxResults;

    const emptyProfile: ScrapedProfile = {
      platform: "youtube",
      username: this.username,
      url: this.profileUrl,
      profilePictureUrl: null,
      stats: emptyStats(),
      totals: computeFetchedTotals([]),
      posts: [],
    };

    // 1. Channel -> uploads playlist id + account statistics.
    const channelRes = await this.makeApiRequest<Record<string, unknown>>(
      `${BASE_API_URL}/channels`,
      {
        id: this.channelId,
        key: this.apiKey,
        part: "snippet,statistics,contentDetails",
      },
    );
    if (!channelRes) {
      logger.error("Channel details API request failed completely");
      return emptyProfile;
    }
    const channelItems = getArr(channelRes, "items");
    if (!channelItems.length) {
      logger.error("Channel details response contains no items");
      return emptyProfile;
    }

    const channel = isRec(channelItems[0]) ? channelItems[0] : {};
    const statistics = getObj(channel, "statistics");
    const stats = emptyStats();
    stats.followers = getBool(statistics, "hiddenSubscriberCount")
      ? null
      : firstCount(statistics, ["subscriberCount"]);
    stats.totalPosts = firstCount(statistics, ["videoCount"]);
    stats.totalViews = firstCount(statistics, ["viewCount"]);
    const profilePictureUrl =
      firstStr(
        getObj(getObj(getObj(channel, "snippet"), "thumbnails"), "high"),
        ["url"],
      ) ||
      firstStr(
        getObj(getObj(getObj(channel, "snippet"), "thumbnails"), "default"),
        ["url"],
      ) ||
      null;

    const uploadsId = getStr(
      getObj(getObj(channel, "contentDetails"), "relatedPlaylists"),
      "uploads",
    );
    if (!uploadsId) {
      logger.error("Could not find uploads playlist");
      return { ...emptyProfile, stats, profilePictureUrl };
    }

    // 2. Uploads playlist -> items.
    const playlistRes = await this.makeApiRequest<Record<string, unknown>>(
      `${BASE_API_URL}/playlistItems`,
      {
        playlistId: uploadsId,
        key: this.apiKey,
        part: "snippet,contentDetails",
        maxResults,
      },
    );
    if (!playlistRes) {
      logger.error("Playlist items API request failed completely");
      return { ...emptyProfile, stats, profilePictureUrl };
    }

    const items = getArr(playlistRes, "items");
    const cutoff = Date.now() - maxDays * 86400 * 1000;
    if (!items.length) {
      logger.warn("No items found in playlist response");
      return { ...emptyProfile, stats, profilePictureUrl };
    }
    logger.info(`Found ${items.length} potential videos to process`);

    const posts: ScrapedPost[] = [];
    for (const item of items) {
      try {
        if (!isRec(item)) continue;
        const publishedAt = getStr(getObj(item, "contentDetails"), "videoPublishedAt");
        const publishedTime = Date.parse(publishedAt);
        if (!Number.isNaN(publishedTime) && publishedTime < cutoff) {
          logger.debug(`Skipping video, older than cutoff (${publishedAt})`);
          continue;
        }
        const post = await this.buildPost(item);
        if (post) posts.push(post);
      } catch (error) {
        logger.error(`Skipping item due to error: ${String(error)}`);
      }
    }

    logger.info(`Parsed ${posts.length} YouTube videos`);
    return {
      ...emptyProfile,
      profilePictureUrl,
      stats,
      totals: computeFetchedTotals(posts),
      posts,
    };
  }
}

function safeUsername(url: string): string {
  try {
    return resolveUsername({ url });
  } catch {
    return "";
  }
}
