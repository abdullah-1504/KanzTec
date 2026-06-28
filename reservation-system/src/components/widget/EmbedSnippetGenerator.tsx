'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Branding } from '@/lib/types';
import { Button } from '@/components/ui';

// Generates the copy-paste embed snippet a restaurant pastes into its own site,
// plus a live preview of the themed widget.
export function EmbedSnippetGenerator({ branding }: { branding: Branding }) {
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const widgetUrl = useMemo(() => {
    const q = new URLSearchParams({
      primary: branding.primaryColor,
      name: branding.restaurantName,
      logo: branding.logoText,
    });
    return `${origin}/widget?${q.toString()}`;
  }, [origin, branding]);

  const snippet = `<iframe
  src="${widgetUrl}"
  title="Book a table at ${branding.restaurantName}"
  style="width:100%;max-width:480px;height:980px;border:0;border-radius:16px"
  loading="lazy">
</iframe>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — user can still select manually */
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-3">
        <p className="text-sm text-stone-500">
          Paste this snippet into your website to take commission-free bookings directly. It
          inherits your brand colour and name automatically.
        </p>
        <pre className="scroll-thin overflow-x-auto rounded-xl bg-stone-900 p-4 text-xs leading-relaxed text-stone-100">
          {snippet}
        </pre>
        <Button onClick={copy} variant={copied ? 'success' : 'primary'}>
          {copied ? 'Copied!' : 'Copy embed code'}
        </Button>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
          Live preview
        </p>
        <div className="overflow-hidden rounded-xl border border-stone-200">
          {origin ? (
            <iframe
              src={widgetUrl}
              title="Widget preview"
              className="h-[520px] w-full"
            />
          ) : (
            <div className="h-[520px] animate-pulse bg-stone-100" />
          )}
        </div>
      </div>
    </div>
  );
}