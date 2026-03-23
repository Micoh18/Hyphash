import "server-only";

import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "./rate-limit";

interface GuardConfig {
  /** Rate limit: max requests per window */
  limit: number;
  /** Rate limit: window size in seconds */
  windowSeconds: number;
  /** Route name for rate limit key */
  route: string;
}

type GuardResult = {
  blocked: true;
  response: NextResponse;
} | {
  blocked: false;
  ip: string;
}

/**
 * Combined CSRF origin check + IP-based rate limiting.
 * Call at the top of every POST handler.
 */
export function apiGuard(request: Request, config: GuardConfig): GuardResult {
  // CSRF: verify Origin or Referer matches our host. Deny if neither is present.
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  if (!host) {
    return { blocked: true, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const sourceHost = origin ?? referer;
  if (!sourceHost) {
    // No Origin and no Referer: deny by default (blocks non-browser and some edge cases)
    return { blocked: true, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  try {
    const parsed = new URL(sourceHost);
    if (parsed.host !== host) {
      return { blocked: true, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
  } catch {
    return { blocked: true, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  // IP-based rate limit
  const ip = getClientIp(request);
  const result = checkRateLimit(ip, config.route, {
    limit: config.limit,
    windowSeconds: config.windowSeconds,
  });

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    return {
      blocked: true,
      response: NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(result.resetAt),
          },
        }
      ),
    };
  }

  return { blocked: false, ip };
}

/**
 * Additional user-based rate limit check. Call AFTER auth.
 * This prevents VPN/proxy bypass of IP-based limits.
 */
export function userRateLimit(
  userId: string,
  route: string,
  limit: number,
  windowSeconds: number
): GuardResult {
  const result = checkRateLimit(`user:${userId}`, route, { limit, windowSeconds });

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    return {
      blocked: true,
      response: NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        }
      ),
    };
  }

  return { blocked: false, ip: userId };
}
