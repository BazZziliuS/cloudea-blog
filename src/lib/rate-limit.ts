interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
}

const buckets = new Map<string, Bucket>();

/** Upper bound on tracked keys so a flood of unique IPs can't exhaust memory. */
const MAX_BUCKETS = 10_000;

function sweepExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Fixed-window in-memory rate limiter.
 *
 * Note: state is per server instance. On serverless or multi-instance
 * deployments use a shared store (e.g. Redis) for strict limits.
 */
export function rateLimit(key: string, { windowMs = 60_000, max = 30 }: RateLimitOptions = {}): RateLimitResult {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_BUCKETS) sweepExpired(now);
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
  if (bucket.count >= max) {
    return { success: false, remaining: 0, retryAfter };
  }

  bucket.count++;
  return { success: true, remaining: max - bucket.count, retryAfter };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Clear all buckets. Intended for tests. */
export function resetRateLimits(): void {
  buckets.clear();
}

/**
 * Apply a per-IP rate limit for a route. Returns a 429 response when the limit
 * is exceeded, or null when the request may proceed.
 */
export function enforceRateLimit(request: Request, scope: string, options?: RateLimitOptions): Response | null {
  const result = rateLimit(`${scope}:${getClientIp(request)}`, options);
  if (result.success) return null;

  return Response.json(
    { error: "Too many requests" },
    { status: 429, headers: { "Retry-After": String(result.retryAfter) } },
  );
}
