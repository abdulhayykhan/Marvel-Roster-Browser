export function getProxiedImageUrl(originalUrl: string | undefined): string | undefined {
  if (!originalUrl) return undefined;
  // On static hosts (Vercel, Netlify), images load directly from Fandom.
  // On Replit dev, we proxy through the API server to avoid referer blocks.
  const proxyUrl = import.meta.env.VITE_IMAGE_PROXY_URL;
  if (proxyUrl) {
    return `${proxyUrl}/api/proxy/image?url=${encodeURIComponent(originalUrl)}`;
  }
  return originalUrl;
}
