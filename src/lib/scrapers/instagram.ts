/**
 * Port of `apps/influencer_hub/services/content_fetchers/instagram_content_scraper.py`
 * (`InstagramProfileFetcher`).
 *
 * Fetches profile details + recent posts through an Apify actor-task run, then
 * normalizes them into `ScrapedProfile`. The Python version also downloaded the
 * profile picture to disk and de-duplicated against previously saved posts; with
 * no datastore here we simply surface the picture URL and return every post the
 * actor gave back.
 */

import { requireConfig, scraperConfig } from "./config";
import {
  computeFetchedTotals,
  emptyStats,
  firstCount,
  firstStr,
  getArr,
  getNum,
  getStr,
  isRec,
  nowIso,
  resolveUsername,
  truncate,
  unique,
  type Rec,
} from "./common";
import { createLogger } from "./logger";
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

const logger = createLogger("instagram");

type ResultsType = "posts" | "details";

export class InstagramProfileFetcher implements ProfileFetcher {
  private readonly url: string;
  private readonly username: string;
  private readonly token: string;
  private readonly taskId: string;

  constructor(input: ProfileInput) {
    this.url = input.url;
    this.username = resolveUsername(input);
    this.token = requireConfig("apifyApiToken");
    this.taskId = requireConfig("instagramTaskId");
  }

  /**
   * Run the Apify actor-task and return the dataset items.
   * `resultsType` is "posts" for posts or "details" for profile details.
   */
  async runActor(resultsType: ResultsType = "posts"): Promise<unknown[]> {
    const maxResults = scraperConfig.contentFetching.maxResults;
    const taskUrl = `https://api.apify.com/v2/actor-tasks/${this.taskId}/runs?token=${this.token}&waitForFinish=60`;

    const payload = {
      directUrls: [`https://www.instagram.com/${this.username}/`],
      resultsLimit: resultsType === "posts" ? maxResults : 1,
      resultsType,
    };

    try {
      const runResponse = await fetch(taskUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!runResponse.ok) {
        throw new Error(`HTTP ${runResponse.status} ${runResponse.statusText}`);
      }
      const runData = (await runResponse.json()) as Rec;
      const data = isRec(runData.data) ? runData.data : {};

      const status = getStr(data, "status");
      if (status !== "SUCCEEDED") {
        logger.error(
          `Actor did not succeed: ${status}. Full run_data: ${JSON.stringify(runData)}`,
        );
        return [];
      }

      const datasetId = getStr(data, "defaultDatasetId");
      if (!datasetId) {
        logger.debug("No dataset ID found.");
        return [];
      }

      const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${this.token}&format=json`;
      const itemsResponse = await fetch(datasetUrl);
      const items = (await itemsResponse.json()) as unknown;

      if (
        Array.isArray(items) &&
        items.length === 1 &&
        isRec(items[0]) &&
        "error" in items[0]
      ) {
        const errDesc =
          getStr(items[0], "errorDescription") ||
          getStr(items[0], "error") ||
          "Unknown error";
        logger.error(`Apify error: ${errDesc}`);
        return [];
      }

      const list = Array.isArray(items) ? items : [];
      logger.debug(`Retrieved ${resultsType} count: ${list.length}`);
      return list;
    } catch (error) {
      logger.error(`API request failed: ${String(error)}`);
      return [];
    }
  }

  /**
   * Fetch the profile-details record. The Python method only pulled the picture
   * URL out of this; we also read follower / following / post counts.
   */
  async fetchDetails(): Promise<{ pictureUrl: string | null; stats: ProfileStats }> {
    const stats = emptyStats();
    try {
      const profileData = await this.runActor("details");
      if (!profileData.length) {
        logger.warn(`No profile data found for ${this.username}`);
        return { pictureUrl: null, stats };
      }

      const info = profileData[0];
      const pictureUrl =
        firstStr(info, [
          "profilePicUrl",
          "profilePicture",
          "avatarUrl",
          "profile_pic_url",
          "profile_pic_url_hd",
        ]) || null;

      if (!pictureUrl) {
        logger.warn(`No profile picture URL found for ${this.username}`);
      }

      stats.followers = firstCount(info, ["followersCount", "followers"]);
      stats.following = firstCount(info, ["followsCount", "followingCount", "follows"]);
      stats.totalPosts = firstCount(info, ["postsCount"]);

      return { pictureUrl, stats };
    } catch (error) {
      logger.error(
        `Error fetching profile details for ${this.username}: ${String(error)}`,
      );
      return { pictureUrl: null, stats };
    }
  }

  /** Port of `save_to_db()` — returns the normalized posts instead of persisting. */
  async fetchPosts(): Promise<ScrapedPost[]> {
    const rawPosts = await this.runActor("posts");
    const saved: ScrapedPost[] = [];

    for (const raw of rawPosts) {
      try {
        if (!isRec(raw)) continue;

        const postId = raw.id;
        if (postId == null || postId === "") {
          logger.warn("Post missing ID, skipping");
          continue;
        }
        const truncatedId = truncate(String(postId), 200);

        let publishedAt = getStr(raw, "timestamp");
        publishedAt = publishedAt && !Number.isNaN(Date.parse(publishedAt))
          ? new Date(publishedAt).toISOString()
          : nowIso();

        // Use the Instagram post URL, not the CDN URL.
        const instagramPostUrl = `https://www.instagram.com/p/${getStr(raw, "shortCode")}/`;
        const postUrl = truncate(instagramPostUrl, 200);

        const post: ScrapedPost = {
          postType:
            getStr(raw, "type") === "Video"
              ? ContentTypeChoices.VIDEO
              : ContentTypeChoices.IMAGE,
          captionText: truncate(getStr(raw, "caption"), 5000),
          postUrl,
          likesCount: getNum(raw, "likesCount", 0),
          commentsCount: getNum(raw, "commentsCount", 0),
          sharesCount: 0,
          viewsCount: getNum(raw, "videoViewCount", 0),
          publishedAt,
          platformSpecificData: {
            post_id: truncatedId,
            ownerUsername: truncate(getStr(raw, "ownerUsername"), 100),
            locationName: truncate(getStr(raw, "locationName"), 200),
            hashtags: getArr(raw, "hashtags").slice(0, 50),
            mentions: getArr(raw, "mentions").slice(0, 50),
          },
          media: [],
        };

        // Collect media across album variants.
        const mediaItems: string[] = [];
        for (const image of getArr(raw, "images")) {
          if (typeof image === "string") mediaItems.push(image);
        }
        for (const child of getArr(raw, "childPosts")) {
          const displayUrl = getStr(child, "displayUrl");
          if (displayUrl) mediaItems.push(displayUrl);
        }
        for (const key of ["displayUrl", "thumbnailUrl", "videoUrl"]) {
          const value = getStr(raw, key);
          if (value) mediaItems.push(value);
        }

        const thumbnailUrl = getStr(raw, "thumbnailUrl");
        for (const mediaUrl of unique(mediaItems)) {
          if (!mediaUrl) continue;
          const lowered = mediaUrl.toLowerCase();
          const mediaType: ContentType =
            /\.(mp4|mov|avi)$/.test(lowered) || lowered.includes("video")
              ? ContentTypeChoices.VIDEO
              : ContentTypeChoices.IMAGE;
          const mediaEntry: ScrapedMedia = {
            mediaType,
            fileUrl: mediaUrl,
            thumbnailUrl,
            durationMs: null,
            fileSize: null,
          };
          post.media.push(mediaEntry);
        }

        saved.push(post);
        logger.info(`Parsed post ${truncatedId} for profile ${this.username}`);
      } catch (error) {
        logger.error(`Skipped post due to error: ${String(error)}`);
      }
    }

    logger.info(`Parsed ${saved.length} posts out of ${rawPosts.length} fetched`);
    return saved;
  }

  async fetchProfile(): Promise<ScrapedProfile> {
    // Sequential, matching the Python `save_to_db()` order (details run, then posts run).
    const { pictureUrl, stats } = await this.fetchDetails();
    const posts = await this.fetchPosts();
    return {
      platform: "instagram",
      username: this.username,
      url: this.url,
      profilePictureUrl: pictureUrl,
      stats,
      totals: computeFetchedTotals(posts),
      posts,
    };
  }
}
