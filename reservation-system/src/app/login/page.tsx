'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, Button, Field, Input } from '@/components/ui';

function LoginForm() {
  const params = useSearchParams();
  const next = params.get('next') || '/manager/dashboard';

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const enterDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/manager/demo-login', { method: 'POST' });
      if (!res.ok) {
        setError('Demo is unavailable right now.');
        setLoading(false);
        return;
      }
      window.location.assign(next);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/manager/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }
      // Full navigation so the middleware re-reads the new cookie.
      window.location.assign(next);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="panel w-full max-w-sm p-7">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-base font-bold text-white shadow-soft">
          CS
        </span>
        <h1 className="mt-3 text-xl font-bold text-stone-900">Manager sign in</h1>
        <p className="mt-1 text-sm text-stone-500">Enter your password to open the console.</p>
      </div>

      {demoMode && (
        <div className="mb-5">
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={enterDemo}
            disabled={loading}
          >
            ✨ Explore the demo dashboard
          </Button>
          <div className="my-4 flex items-center gap-3 text-xs text-stone-400">
            <span className="h-px flex-1 bg-stone-200" />
            or sign in with a password
            <span className="h-px flex-1 bg-stone-200" />
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <Field label="Password" required error={error ?? undefined}>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus={!demoMode}
            autoComplete="current-password"
          />
        </Field>
        <Button type="submit" variant={demoMode ? 'secondary' : 'primary'} size="lg" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-stone-400">
        Protected area. Set the password with the <code className="rounded bg-stone-100 px-1">MANAGER_PASSWORD</code> env var.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Suspense fallback={<Alert tone="info">Loading…</Alert>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}