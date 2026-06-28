'use client';

import type { GuestTag } from '@/lib/types';
import { Badge } from '@/components/ui';

const TAG_STYLE: Record<GuestTag, string> = {
  VIP: 'bg-amber-100 text-amber-700',
  regular: 'bg-brand-50 text-brand-700',
  'repeat-no-show': 'bg-rose-100 text-rose-700',
  new: 'bg-stone-100 text-stone-500',
};

export function GuestTags({ tags }: { tags: GuestTag[] }) {
  if (!tags.length) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <Badge key={t} className={TAG_STYLE[t]}>
          {t === 'VIP' ? '🌟 VIP' : t}
        </Badge>
      ))}
    </span>
  );
}