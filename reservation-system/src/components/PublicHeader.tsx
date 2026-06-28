'use client';

import Link from 'next/link';
import { useRestaurant } from '@/lib/hooks';

// Lightweight header for the public reservation pages.
export function PublicHeader() {
  const { db } = useRestaurant();
  const branding = db?.settings.branding;

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            {branding?.logoText ?? 'CS'}
          </span>
          <span className="font-semibold text-stone-900">
            {branding?.restaurantName ?? 'The Copper Spoon'}
          </span>
        </Link>
        <Link
          href="/manager/dashboard"
          className="text-sm font-medium text-stone-500 hover:text-stone-800"
        >
          Manager →
        </Link>
      </div>
    </header>
  );
}