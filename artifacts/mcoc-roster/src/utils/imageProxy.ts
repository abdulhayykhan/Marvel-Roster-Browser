export function getProxiedImageUrl(originalUrl: string | undefined): string | undefined {
  if (!originalUrl) return undefined;
  // Use the API server's image proxy to avoid referer issues with wikia CDN
  return `${import.meta.env.BASE_URL}api/proxy/image?url=${encodeURIComponent(originalUrl)}`;
}
