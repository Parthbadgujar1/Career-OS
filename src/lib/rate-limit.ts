import "server-only";

/**
 * In-memory sliding-window rate limiter.
 * Suitable for the single-instance Node.js deployment target (Hostinger
 * Node.js Web App). For multi-instance deployments swap the store for
 * Upstash Redis — the public API stays identical.
 */

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

// Periodically purge stale buckets so the map does not grow unbounded.
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
    if (bucket.hits.length === 0) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  cleanup(opts.windowMs);

  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < opts.windowMs);

  if (bucket.hits.length >= opts.limit) {
    const oldest = bucket.hits[0] ?? now;
    buckets.set(key, bucket);
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil((opts.windowMs - (now - oldest)) / 1000),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return { ok: true, remaining: opts.limit - bucket.hits.length, retryAfterSec: 0 };
}

/** Extract a best-effort client IP from proxy headers. */
export function clientIpFrom(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

// Preset policies
export const RATE_POLICIES = {
  login: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts / 15 min
  register: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 accounts / hour per IP
  passwordReset: { limit: 3, windowMs: 60 * 60 * 1000 },
  ai: { limit: 30, windowMs: 60 * 60 * 1000 }, // 30 AI calls / hour per user
  feedback: { limit: 20, windowMs: 60 * 60 * 1000 },
} as const;
