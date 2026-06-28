/** @type {import('next').NextConfig} */

// Security headers applied to every route. We deliberately do NOT set a global
// X-Frame-Options so the embeddable widget can still be iframed; clickjacking
// protection is applied to the manager console specifically below.
const baseSecurityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  // Self-contained server output — works on Vercel and in a Docker container.
  output: 'standalone',
  async headers() {
    return [
      {
        // Apply baseline hardening everywhere.
        source: '/:path*',
        headers: baseSecurityHeaders,
      },
      {
        // The manager console must never be framed by another site.
        source: '/manager/:path*',
        headers: [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }],
      },
      {
        // The widget is meant to be embedded on a restaurant's own website.
        // Production: restrict to the restaurant's verified domains.
        source: '/widget',
        headers: [{ key: 'Content-Security-Policy', value: 'frame-ancestors *;' }],
      },
    ];
  },
};

module.exports = nextConfig;