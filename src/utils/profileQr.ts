export function parseProfileQr(value: string, origin: string): string | null {
  try {
    const url = new URL(value);
    if (url.origin !== origin || url.search || url.hash) return null;
    const match = /^\/profile\/([^/]+)\/?$/.exec(url.pathname);
    if (!match) return null;
    const username = decodeURIComponent(match[1]);
    if (username.length < 3 || username.length > 50 || /[\x00-\x1f/\\]/.test(username)) return null;
    return username;
  } catch {
    return null;
  }
}
