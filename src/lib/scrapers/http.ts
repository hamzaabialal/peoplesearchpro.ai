import type { Logger } from "./logger";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface RequestOptions {
  method?: "GET" | "POST";
  /** JSON body for POST requests. */
  body?: unknown;
  headers?: Record<string, string>;
  /** Number of attempts before giving up. Mirrors `MAX_RETRIES`. */
  retries?: number;
  /** Delay between attempts in ms. Mirrors `RETRY_DELAY`. */
  retryDelayMs?: number;
  logger?: Logger;
}

/**
 * Port of the Python `_make_api_request` helper (FB / TikTok / YouTube fetchers):
 * retry with a fixed delay, swallow network / non-2xx errors, and return `null`
 * (the equivalent of Python's `None`) once every attempt has failed.
 */
export async function requestJson<T = unknown>(
  url: string,
  options: RequestOptions = {},
): Promise<T | null> {
  const {
    method = "GET",
    body,
    headers = {},
    retries = 3,
    retryDelayMs = 2000,
    logger,
  } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const init: RequestInit = {
        method,
        headers: {
          Accept: "application/json",
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...headers,
        },
      };
      if (body !== undefined) init.body = JSON.stringify(body);

      const response = await fetch(url, init);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      logger?.warn(
        `API request failed (attempt ${attempt}/${retries}): ${String(error)}`,
      );
      if (attempt < retries) await sleep(retryDelayMs);
    }
  }

  logger?.error(`Failed to complete API request after ${retries} attempts`);
  return null;
}
