import type { MetadataRoute } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Only public, guest-facing pages belong in the sitemap.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/reservations', '/widget'];
  return routes.map((path) => ({
    url: `${appUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));
}