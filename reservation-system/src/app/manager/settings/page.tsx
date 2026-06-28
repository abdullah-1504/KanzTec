'use client';

import { useEffect, useState } from 'react';
import type { Branding, DepositRules } from '@/lib/types';
import { useRestaurant } from '@/lib/hooks';
import { updateSettings } from '@/lib/store';
import { Button, Card, Field, Input, PageHeader, SectionTitle, Spinner, Alert } from '@/components/ui';
import { EmbedSnippetGenerator } from '@/components/widget/EmbedSnippetGenerator';

export default function SettingsPage() {
  const { db, loading } = useRestaurant();
  const [branding, setBranding] = useState<Branding | null>(null);
  const [deposit, setDeposit] = useState<DepositRules | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (db) {
      setBranding(db.settings.branding);
      setDeposit(db.settings.deposit);
    }
  }, [db]);

  if (loading || !db || !branding || !deposit) return <Spinner label="Loading settings…" />;

  const save = () => {
    updateSettings({ branding, deposit });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon="⚙️"
        title="Settings"
        subtitle="Branding, deposit rules and your embeddable widget."
      />

      {saved && <Alert tone="success">Settings saved.</Alert>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Branding */}
        <Card>
          <SectionTitle title="Branding" subtitle="Used across the booking page and widget." />
          <div className="space-y-4">
            <Field label="Restaurant name">
              <Input
                value={branding.restaurantName}
                onChange={(e) => setBranding({ ...branding, restaurantName: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Logo text" hint="1–2 letters">
                <Input
                  value={branding.logoText}
                  maxLength={2}
                  onChange={(e) => setBranding({ ...branding, logoText: e.target.value })}
                />
              </Field>
              <Field label="Primary color">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="h-10 w-12 rounded-lg border border-stone-300"
                  />
                  <Input
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                  />
                </div>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Currency code">
                <Input
                  value={branding.currency}
                  onChange={(e) => setBranding({ ...branding, currency: e.target.value })}
                />
              </Field>
              <Field label="Currency symbol">
                <Input
                  value={branding.currencySymbol}
                  onChange={(e) => setBranding({ ...branding, currencySymbol: e.target.value })}
                />
              </Field>
            </div>
          </div>
        </Card>

        {/* Deposit rules */}
        <Card>
          <SectionTitle title="Deposit rules" subtitle="Secure high-value bookings & cut no-shows." />
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <input
                type="checkbox"
                checked={deposit.enabled}
                onChange={(e) => setDeposit({ ...deposit, enabled: e.target.checked })}
                className="h-4 w-4 rounded border-stone-300"
              />
              Deposits enabled
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Large party from (guests)">
                <Input
                  type="number"
                  value={deposit.largePartyThreshold}
                  onChange={(e) => setDeposit({ ...deposit, largePartyThreshold: Number(e.target.value) })}
                />
              </Field>
              <Field label={`Per-guest deposit (${branding.currencySymbol})`}>
                <Input
                  type="number"
                  value={deposit.perGuestAmount}
                  onChange={(e) => setDeposit({ ...deposit, perGuestAmount: Number(e.target.value) })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Peak starts at (hour)" hint="24h, e.g. 18 = 6 PM">
                <Input
                  type="number"
                  value={deposit.peakStartHour}
                  onChange={(e) => setDeposit({ ...deposit, peakStartHour: Number(e.target.value) })}
                />
              </Field>
              <Field label={`Peak deposit (${branding.currencySymbol})`}>
                <Input
                  type="number"
                  value={deposit.peakDeposit}
                  onChange={(e) => setDeposit({ ...deposit, peakDeposit: Number(e.target.value) })}
                />
              </Field>
            </div>
            <Field label="Pre-order advance (%)" hint="Share of pre-order taken up-front">
              <Input
                type="number"
                value={Math.round(deposit.preOrderAdvanceRate * 100)}
                onChange={(e) =>
                  setDeposit({ ...deposit, preOrderAdvanceRate: Number(e.target.value) / 100 })
                }
              />
            </Field>
            <p className="text-xs text-stone-400">Peak days are Fri & Sat by default (configurable in code).</p>
          </div>
        </Card>
      </div>

      <Button onClick={save}>Save settings</Button>

      {/* Embed snippet */}
      <Card>
        <SectionTitle
          title="Embeddable booking widget"
          subtitle="Commission-free bookings directly from your own website."
        />
        <EmbedSnippetGenerator branding={branding} />
      </Card>
    </div>
  );
}