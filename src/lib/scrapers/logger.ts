/**
 * Tiny logger shim standing in for Python's `logging.getLogger(__name__)`.
 * `debug` is silent unless `SCRAPER_DEBUG` is set, matching the Django default
 * where debug-level records were not emitted.
 */

const debugEnabled =
  process.env.SCRAPER_DEBUG === "1" || process.env.SCRAPER_DEBUG === "true";

export function createLogger(namespace: string) {
  const prefix = `[scrapers:${namespace}]`;
  return {
    debug(...args: unknown[]) {
      if (debugEnabled) console.debug(prefix, ...args);
    },
    info(...args: unknown[]) {
      console.info(prefix, ...args);
    },
    warn(...args: unknown[]) {
      console.warn(prefix, ...args);
    },
    error(...args: unknown[]) {
      console.error(prefix, ...args);
    },
  };
}

export type Logger = ReturnType<typeof createLogger>;
