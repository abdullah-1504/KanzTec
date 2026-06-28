import type { MetadataRoute } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep the console, auth and APIs out of search results.
      disallow: ['/manager', '/login', '/api'],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}