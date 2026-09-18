import { NextResponse } from "next/server";

/**
 * Request throttling for abuse-prone endpoints.
 *
 * A fixed-window counter per client and scope. The store is in-memory, so a
 * fleet of servers would enforce the limit per instance rather than globally;
 * that trade-off is deliberate for now — it needs no extra infrastructure and
 * still defeats casual abuse and retry storms from a single client.
 */

export type RateLimit = { limit: number; windowMs: number };

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimitKey(request: Request, scope: string): string {
  return `${scope}:${clientIp(request)}`;
}

export function checkRateLimit(key: string, { limit, windowMs }: RateLimit, now = Date.now()) {
  const current = buckets.get(key);
  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 5000) {
      for (const [candidate, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(candidate);
      }
    }
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }
  if (current.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: current.resetAt - now };
  }
  current.count += 1;
  return { allowed: true, remaining: limit - current.count, retryAfterMs: 0 };
}

export function rateLimitedResponse(retryAfterMs: number) {
  const seconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return NextResponse.json(
    { status: "error", code: "rate_limited", message: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(seconds) } },
  );
}

/** Test-only escape hatch so suites never leak buckets into each other. */
export function __clearRateLimits() {
  buckets.clear();
}
