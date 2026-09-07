// ── Site ────────────────────────────────────────────────────────────────────
// Single source of truth for the canonical site origin (no trailing slash).
// Used by email links, sitemap, robots and metadata so every absolute URL
// points at the same host regardless of which env var is set.
export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}