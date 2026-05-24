const DEFAULT_SITE_URL = "http://100.89.94.96:3000";
const ALLOWED_CALLBACK_PATHS = new Set(["/map", "/reset-password"]);

function getSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const browserOrigin = typeof window !== "undefined" ? window.location.origin : undefined;

  let origin = configured || browserOrigin || DEFAULT_SITE_URL;
  if (origin.includes("0.0.0.0")) {
    origin = origin.replace("0.0.0.0", "100.89.94.96");
  }

  return origin.replace(/\/$/, "");
}

export function getAuthCallbackUrl(next = "/map"): string {
  const safeNext = ALLOWED_CALLBACK_PATHS.has(next) ? next : "/map";
  return `${getSiteOrigin()}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}
