import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <span className="text-5xl">🍽️</span>
      <h1 className="mt-4 text-3xl font-bold text-stone-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-stone-500">
        The page you’re looking for doesn’t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-700"
      >
        Back to home
      </Link>
    </div>
  );
}