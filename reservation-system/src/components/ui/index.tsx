'use client';

import { clsx } from '@/lib/helpers/clsx';
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

// =============================================================================
// Friendly, oversized UI primitives. Designed for non-technical users on phones
// and tablets: large tap targets, clear labels, gentle motion. One file keeps
// imports tidy across the app.
// =============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-300 shadow-soft',
  secondary: 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50',
  ghost: 'bg-transparent text-stone-600 hover:bg-stone-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300 shadow-soft',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-2xl gap-2',
  lg: 'px-6 py-3.5 text-base rounded-2xl gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold transition-all focusable disabled:cursor-not-allowed active:scale-[0.98]',
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx('panel p-5 sm:p-6', className)}>{children}</div>;
}

/** Large, friendly page heading with optional icon + actions. */
export function PageHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-2xl">
            {icon}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold text-stone-900 sm:text-[28px]">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  step,
  done,
  action,
}: {
  title: string;
  subtitle?: string;
  step?: number;
  done?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {step !== undefined && (
          <span
            className={clsx(
              'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors',
              done ? 'bg-emerald-500 text-white' : 'bg-brand-600 text-white',
            )}
          >
            {done ? '✓' : step}
          </span>
        )}
        <div>
          <h2 className="text-base font-semibold text-stone-900 sm:text-lg">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/** Horizontal progress stepper to orient first-time users through a flow. */
export function Stepper({
  steps,
  current,
}: {
  steps: { label: string; done: boolean }[];
  current: number;
}) {
  return (
    <ol className="flex items-center gap-1.5 overflow-x-auto scroll-thin">
      {steps.map((s, i) => {
        const active = i === current;
        return (
          <li key={s.label} className="flex shrink-0 items-center gap-1.5">
            <span
              className={clsx(
                'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors',
                s.done
                  ? 'bg-emerald-500 text-white'
                  : active
                    ? 'bg-brand-600 text-white'
                    : 'bg-stone-200 text-stone-500',
              )}
            >
              {s.done ? '✓' : i + 1}
            </span>
            <span
              className={clsx(
                'whitespace-nowrap text-xs font-medium',
                active ? 'text-stone-900' : 'text-stone-400',
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && <span className="mx-1 h-px w-4 bg-stone-200 sm:w-6" />}
          </li>
        );
      })}
    </ol>
  );
}

export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-stone-700">
        {label}
        {required && <span className="text-brand-500">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-600">
          <span>⚠</span>
          {error}
        </span>
      ) : (
        hint && <span className="mt-1 block text-xs text-stone-400">{hint}</span>
      )}
    </label>
  );
}

const INPUT_BASE =
  'w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(INPUT_BASE, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(INPUT_BASE, 'min-h-[88px] resize-y', className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={clsx(INPUT_BASE, 'appearance-none', className)} {...props}>
      {children}
    </select>
  );
}

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Alert({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'success' | 'error' | 'warning';
  children: ReactNode;
}) {
  const tones = {
    info: 'bg-brand-50 text-brand-800 border-brand-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-rose-50 text-rose-800 border-rose-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
  };
  const icon = { info: 'ℹ️', success: '✅', error: '⚠️', warning: '⚠️' };
  return (
    <div
      className={clsx(
        'flex items-start gap-2 rounded-2xl border px-4 py-3 text-sm font-medium animate-fade-in',
        tones[tone],
      )}
    >
      <span className="shrink-0">{icon[tone]}</span>
      <span>{children}</span>
    </div>
  );
}

/** A small inline helper line (icon + text) to reassure non-technical users. */
export function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-stone-400">
      <span>💡</span>
      {children}
    </p>
  );
}

/** Big, icon-led metric card for dashboards. */
export function StatCard({
  label,
  value,
  icon,
  accent = 'stone',
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  accent?: 'stone' | 'emerald' | 'rose' | 'amber' | 'brand' | 'violet';
}) {
  const accents: Record<string, { bg: string; text: string }> = {
    stone: { bg: 'bg-stone-100', text: 'text-stone-700' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    brand: { bg: 'bg-brand-100', text: 'text-brand-600' },
    violet: { bg: 'bg-violet-100', text: 'text-violet-600' },
  };
  const a = accents[accent];
  return (
    <div className="panel flex items-center gap-3 p-4">
      <span className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl', a.bg)}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className={clsx('text-2xl font-bold leading-tight', a.text)}>{value}</p>
        <p className="truncate text-xs font-medium text-stone-500">{label}</p>
      </div>
    </div>
  );
}

export function EmptyState({ title, hint, icon }: { title: string; hint?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 px-6 py-12 text-center">
      <span className="mb-2 text-3xl">{icon ?? '🍽️'}</span>
      <p className="text-sm font-semibold text-stone-600">{title}</p>
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-stone-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-200 border-t-brand-500" />
      {label ?? 'Loading…'}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'md' | 'lg';
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-stone-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className={clsx(
          'panel w-full animate-slide-up rounded-b-none p-6 sm:my-8 sm:rounded-3xl',
          size === 'lg' ? 'max-w-2xl' : 'max-w-md',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}