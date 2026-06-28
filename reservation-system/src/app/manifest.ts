import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TableKit — Restaurant Reservations',
    short_name: 'TableKit',
    description:
      'Live table reservations with deposits, a guest CRM and a WhatsApp booking agent.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf8f5',
    theme_color: '#ea580c',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}