# Social content scrapers

TypeScript port of the Python project
`social-media-influencer-assessment/apps/influencer_hub/services/content_fetchers/`.

Same platforms, same upstream services, same field mapping. The one behavioural
change: this project has no database, so each fetcher returns a normalized
`ScrapedProfile` (JSON) instead of writing Django `ContentPost` / `ContentMedia`
rows. Callers decide what to persist.

| Platform  | Source file      | Upstream service                                   | Python original                 |
| --------- | ---------------- | ------------------------------------------------- | ------------------------------- |
| Instagram | `instagram.ts`   | Apify **actor-task** run (`INSTAGRAM_TASK_ID`)     | `InstagramProfileFetcher`       |
| Facebook  | `facebook.ts`    | Apify **actor-task** run (`FACEBOOK_TASK_ID`)      | `FacebookProfileFetcher`        |
| TikTok    | `tiktok.ts`      | Apify **actor-task** `run-sync-get-dataset-items` (`TIKTOK_TASK_ID`) | `TikTokProfileFetcher` |
| YouTube   | `youtube.ts`     | YouTube Data API v3 (`GOOGLE_CLOUD_API_KEY`)       | `YouTubeProfileFetcher`         |

> LinkedIn and Twitter are **not** included — the Python project never had
> scrapers for them, so there was nothing to port.

## Usage

Server-side only (needs credentials). From a route handler, server action, or
script:

```ts
import { fetchSocialProfile, fetchSocialProfiles } from "@/lib/scrapers";

// Single profile — platform inferred from the URL host:
const profile = await fetchSocialProfile({
  url: "https://www.instagram.com/nasa/",
});

// Or be explicit and pass a handle:
const yt = await fetchSocialProfile({
  platform: "youtube",
  url: "https://www.youtube.com/@NASA",
});

// Several at once (per-entry error capture, never throws):
const results = await fetchSocialProfiles([
  { url: "https://www.instagram.com/nasa/" },
  { url: "https://www.facebook.com/NASA" },
  { url: "https://www.tiktok.com/@nasa" },
  { url: "https://www.youtube.com/@NASA" },
]);
```

`ScrapedProfile`:

```ts
{
  platform: "instagram" | "facebook" | "tiktok" | "youtube";
  username: string;
  url: string;
  profilePictureUrl: string | null;
  stats: {                       // account-level, from profile metadata
    followers: number | null;    // followers / subscribers / fans
    following: number | null;    // accounts this profile follows
    totalPosts: number | null;   // lifetime post / video count on the account
    totalLikes: number | null;   // lifetime likes received (TikTok only)
    totalViews: number | null;   // lifetime views (YouTube; Instagram where given)
  };
  totals: {                      // summed over the `posts` in THIS fetch
    posts: number;
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  posts: ScrapedPost[];
}
```

`ScrapedPost` mirrors the Django `ContentPost` fields
(`postType`, `captionText`, `postUrl`, `likesCount`, `commentsCount`,
`sharesCount`, `viewsCount`, `publishedAt`, `platformSpecificData`) with a nested
`media: ScrapedMedia[]` (the old `ContentMedia` rows).

### Which `stats` each platform provides

| Field | Instagram | Facebook | TikTok | YouTube |
| ----- | --------- | -------- | ------ | ------- |
| `followers`  | `followersCount` | — *(actor omits it)* | `authorMeta.fans` | `statistics.subscriberCount` |
| `following`  | `followsCount`   | — | `authorMeta.following` | — |
| `totalPosts` | `postsCount`     | — | `authorMeta.video` | `statistics.videoCount` |
| `totalLikes` | — | — | `authorMeta.heart` (lifetime) | — |
| `totalViews` | — | — | — | `statistics.viewCount` |

`totals` is always computed by summing the fetched `posts`, so it reflects only
the last `SCRAPER_MAX_RESULTS` items, not the account lifetime.

## Environment variables

Mirror of the Django `settings` keys the fetchers relied on. Set these in
`.env.local` (git-ignored):

```bash
APIFY_API_TOKEN=          # Apify — required for Instagram, Facebook, TikTok
INSTAGRAM_TASK_ID=        # Apify task id — task built on apify/instagram-scraper
FACEBOOK_TASK_ID=         # Apify task id — task built on apify/facebook-posts-scraper
TIKTOK_TASK_ID=           # Apify task id — task built on clockworks/tiktok-scraper
GOOGLE_CLOUD_API_KEY=     # Google Cloud API key with YouTube Data API v3 enabled

# Optional — port of settings.CONTENT_FETCHING (defaults shown)
SCRAPER_MAX_RESULTS=5     # posts / videos to pull per profile
SCRAPER_MAX_DAYS_OLD=30   # YouTube: drop videos older than this many days
SCRAPER_DEBUG=            # set to 1 to emit debug-level logs
```

A fetcher throws `ScraperConfigError` when a credential it needs is missing.

## Parity notes

- **No de-duplication.** The Python code skipped posts already in the DB
  (`ContentPost.objects.filter(...).exists()`). With no datastore, every post the
  upstream returns is included; callers dedupe if needed.
- **Profile pictures** are returned as URLs, not downloaded to disk.
- **Timestamps** are normalized to ISO-8601 UTC strings (Python used
  timezone-aware `datetime`s).
- Retry counts / delays, payload shapes, URL formats, field fallbacks
  (`likes or likesCount`, the Instagram profile-pic key list, the YouTube
  channel-id resolution chain, Facebook's `_determine_post_type` /
  `_clean_url`, the 500-char FB URL cap, the 200/5000-char field caps) are
  ported verbatim.
- `YouTubeProfileFetcher.determineContentType` returns `VIDEO` for both branches,
  exactly as the original does.
