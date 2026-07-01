'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRestaurant } from '@/lib/hooks';
import { resetDemo } from '@/lib/store';
import { clsx } from '@/lib/helpers/clsx';

const NAV = [
  { href: '/manager/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/manager/reservations', label: 'Reservations', icon: '📅' },
  { href: '/manager/guests', label: 'Guests', icon: '👥' },
  { href: '/manager/whatsapp', label: 'WhatsApp', icon: '💬' },
  { href: '/manager/settings', label: 'Settings', icon: '⚙️' },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { db } = useRestaurant();
  const branding = db?.settings.branding;

  return (
    <div className="min-h-screen lg:flex">
      {/* Sidebar */}
      <aside className="border-b border-stone-200 bg-white lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-4 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-base font-bold text-white shadow-soft">
            {branding?.logoText ?? 'CS'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-stone-900">
              {branding?.restaurantName ?? 'TableKit'}
            </p>
            <p className="text-xs text-stone-400">Manager console</p>
          </div>
          {/* On mobile the footer controls are hidden, so surface Sign out here. */}
          <button
            onClick={async () => {
              await fetch('/api/manager/logout', { method: 'POST' });
              window.location.assign('/login');
            }}
            className="shrink-0 rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-500 hover:bg-stone-50 lg:hidden"
          >
            Sign out
          </button>
        </div>

        <nav className="flex gap-1.5 overflow-x-auto px-2 pb-2 lg:flex-1 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex shrink-0 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-brand-50 text-brand-700 shadow-soft'
                    : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800',
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden px-3 py-4 lg:block">
          <button
            onClick={() => {
              if (confirm('Reset all demo data back to the sample? This clears any bookings you’ve made.')) resetDemo();
            }}
            className="w-full rounded-2xl border border-stone-200 px-3 py-2.5 text-xs font-semibold text-stone-500 transition-colors hover:bg-stone-50"
          >
            ↺ Reset demo data
          </button>
          <Link
            href="/reservations"
            className="mt-2 block rounded-2xl px-3 py-2 text-center text-xs font-medium text-stone-400 hover:text-stone-700"
          >
            View guest booking page →
          </Link>
          <button
            onClick={async () => {
              await fetch('/api/manager/logout', { method: 'POST' });
              window.location.assign('/login');
            }}
            className="mt-1 w-full rounded-2xl px-3 py-2 text-center text-xs font-medium text-stone-400 hover:text-rose-600"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl space-y-6">{children}</div>
      </main>
    </div>
  );
}