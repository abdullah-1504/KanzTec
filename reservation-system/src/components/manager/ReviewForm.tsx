'use client';

import { useState } from 'react';
import { addReview } from '@/lib/store';
import { Button, Textarea } from '@/components/ui';
import { clsx } from '@/lib/helpers/clsx';

// Capture a post-visit rating (1-5) + optional comment against a reservation.
export function ReviewForm({
  guestId,
  reservationId,
  onDone,
}: {
  guestId: string;
  reservationId: string;
  onDone?: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [saved, setSaved] = useState(false);

  const submit = () => {
    if (rating === 0) return;
    addReview({ guestId, reservationId, rating, comment: comment.trim() || undefined });
    setSaved(true);
    onDone?.();
  };

  if (saved) {
    return <p className="text-sm font-medium text-emerald-600">Thanks — review saved. ✅</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className={clsx(
              'text-2xl transition-transform hover:scale-110',
              (hover || rating) >= n ? 'text-amber-400' : 'text-stone-300',
            )}
            aria-label={`${n} star`}
          >
            ★
          </button>
        ))}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comment about the visit…"
        className="min-h-[60px]"
      />
      <Button onClick={submit} disabled={rating === 0} className="px-3 py-1.5 text-xs">
        Save review
      </Button>
    </div>
  );
}