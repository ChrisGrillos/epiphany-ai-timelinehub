export const MEDIUM_HOSTS = ["medium.com"];

// Normalizes and safety-checks an external URL.
// - Trims whitespace
// - Adds https:// if the scheme is missing
// - Rejects non-http(s) protocols to avoid javascript: or data: execution
// - Optionally enforces a hostname allowlist (exact match or subdomain)
export function normalizeExternalUrl(rawUrl, { allowedHosts, allowHttp = true } = {}) {
  if (!rawUrl || typeof rawUrl !== "string") return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // Ensure we always have a scheme to satisfy URL parsing
  // RFC 3986 valid URI schemes: ALPHA *( ALPHA / DIGIT / "+" / "-" / "." ) followed by ":"
  const withScheme = /^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed.replace(/^\/\//, "")}`;

  try {
    const url = new URL(withScheme);
    const protocolAllowed = url.protocol === "https:" || (allowHttp && url.protocol === "http:");
    if (!protocolAllowed) return null;

    if (Array.isArray(allowedHosts) && allowedHosts.length > 0) {
      const matchesHost = allowedHosts.some(host => {
        return url.hostname === host || url.hostname.endsWith(`.${host}`);
      });
      if (!matchesHost) return null;
    }

    return url.href;
  } catch {
    return null;
  }
}
