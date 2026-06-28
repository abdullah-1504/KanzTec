import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'TableKit — Restaurant Reservations',
    template: '%s · TableKit',
  },
  description:
    'B2B restaurant reservation & table management platform: live availability, deposits, WhatsApp booking agent and a Guest CRM.',
  applicationName: 'TableKit',
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    title: 'TableKit — Restaurant Reservations',
    description:
      'Fill every table, cut no-shows and own your guests — web, widget & WhatsApp bookings with deposits and an ROI dashboard.',
    url: appUrl,
    siteName: 'TableKit',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TableKit — Restaurant Reservations',
    description: 'Live table reservations with deposits, a guest CRM and a WhatsApp booking agent.',
  },
};

export const viewport: Viewport = {
  themeColor: '#ea580c',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}