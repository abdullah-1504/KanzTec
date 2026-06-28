import Link from 'next/link';

// Simple landing / hub linking the two audiences: diners and the restaurant team.
export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        {/* Brand */}
        <div className="mb-12 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-soft">
            CS
          </span>
          <span className="font-display text-lg font-bold text-stone-900">TableKit</span>
        </div>

        {/* Hero */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
            🍽️ Restaurant Reservation Platform
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-stone-900 sm:text-6xl">
            Fill every table.
            <br />
            <span className="text-brand-600">Cut no-shows.</span> Own your guests.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-stone-500 sm:text-lg">
            Live reservations across your website, an embeddable widget and a WhatsApp booking agent —
            with deposits, a guest list and a dashboard that shows what it earns you.
          </p>
        </div>

        {/* Two doors */}
        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
          <Link
            href="/reservations"
            className="panel group p-7 transition-all hover:-translate-y-1 hover:shadow-lift"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-3xl">🍽️</div>
            <h2 className="mt-4 text-xl font-bold text-stone-900">I’m a guest</h2>
            <p className="mt-1 text-sm text-stone-500">
              See live availability, pick your table and reserve in under a minute.
            </p>
            <span className="mt-4 inline-block text-sm font-bold text-brand-600 group-hover:underline">
              Book a table →
            </span>
          </Link>

          <Link
            href="/manager/dashboard"
            className="panel group p-7 transition-all hover:-translate-y-1 hover:shadow-lift"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">📊</div>
            <h2 className="mt-4 text-xl font-bold text-stone-900">I run the restaurant</h2>
            <p className="mt-1 text-sm text-stone-500">
              Manage your floor, reservations, walk-ins, guests and earnings — all in real time.
            </p>
            <span className="mt-4 inline-block text-sm font-bold text-emerald-600 group-hover:underline">
              Open the dashboard →
            </span>
          </Link>
        </div>

        {/* Feature strip */}
        <div className="mx-auto mt-10 grid max-w-3xl gap-3 text-center sm:grid-cols-3">
          {[
            { icon: '💬', title: 'WhatsApp bookings', desc: 'Guests book by chatting' },
            { icon: '🔒', title: 'Deposits', desc: 'Secure peak & big tables' },
            { icon: '👥', title: 'Guest list', desc: 'Remember every regular' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl bg-white/60 p-4">
              <div className="text-2xl">{f.icon}</div>
              <p className="mt-1 text-sm font-bold text-stone-800">{f.title}</p>
              <p className="text-xs text-stone-500">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-stone-400">
          <Link href="/widget" className="hover:text-stone-700">Embeddable widget</Link>
          <Link href="/manager/whatsapp" className="hover:text-stone-700">WhatsApp agent</Link>
          <Link href="/manager/guests" className="hover:text-stone-700">Guest list</Link>
          <Link href="/manager/settings" className="hover:text-stone-700">Settings &amp; embed</Link>
        </div>
      </div>
    </div>
  );
}