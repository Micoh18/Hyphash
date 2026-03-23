import "server-only";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean expired entries every 60s to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 60_000);

interface RateLimitConfig {
  /** Max requests per window */
  limit: number;
  /** Window size in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Simple in-memory rate limiter keyed by IP + route.
 * For production, swap the Map store for Redis.
 */
export function checkRateLimit(
  ip: string,
  route: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${ip}:${route}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + config.windowSeconds * 1000 });
    return { allowed: true, remaining: config.limit - 1, resetAt: now + config.windowSeconds * 1000 };
  }

  entry.count++;
  const remaining = Math.max(0, config.limit - entry.count);

  if (entry.count > config.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining, resetAt: entry.resetAt };
}

/**
 * Extract client IP from request headers.
 * Checks x-forwarded-for (behind proxy/Vercel), falls back to x-real-ip.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
