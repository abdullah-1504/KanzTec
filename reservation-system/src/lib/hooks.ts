'use client';

import { useEffect, useState } from 'react';
import type { DB } from '@/lib/types';
import { getSnapshot, subscribe } from '@/lib/store';

// =============================================================================
// React binding for the store. Components get live data and re-render whenever
// any channel writes a booking — including from another browser tab (the
// "real-time" manager dashboard effect).
//
// `db` is null during the very first (server / pre-mount) render, which lets
// components show clean loading states and avoids hydration mismatches.
// =============================================================================
export function useRestaurant(): { db: DB | null; loading: boolean } {
  const [db, setDb] = useState<DB | null>(null);

  useEffect(() => {
    setDb(getSnapshot());
    const unsub = subscribe(() => setDb(getSnapshot()));
    return unsub;
  }, []);

  return { db, loading: db === null };
}