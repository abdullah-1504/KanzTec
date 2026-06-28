'use client';

import type { MenuItem, MenuCategory, PreOrderItem } from '@/lib/types';
import { makePreOrderItem, formatMoney, preOrderTotal } from '@/lib/helpers/pricing';
import { clsx } from '@/lib/helpers/clsx';

const CATEGORY_ORDER: MenuCategory[] = ['Starters', 'Main Course', 'Drinks', 'Desserts'];

// Optional pre-order menu with quantity steppers. Emits PreOrderItem lines.
export function PreOrderMenu({
  menu,
  items,
  onChange,
  currencySymbol,
}: {
  menu: MenuItem[];
  items: PreOrderItem[];
  onChange: (items: PreOrderItem[]) => void;
  currencySymbol: string;
}) {
  const qtyFor = (id: string) => items.find((i) => i.menuItemId === id)?.quantity ?? 0;

  const setQty = (menuItem: MenuItem, qty: number) => {
    const next = items.filter((i) => i.menuItemId !== menuItem.id);
    if (qty > 0) next.push(makePreOrderItem(menuItem, qty));
    onChange(next);
  };

  return (
    <div className="space-y-5">
      {CATEGORY_ORDER.map((category) => {
        const group = menu.filter((m) => m.category === category && m.available);
        if (!group.length) return null;
        return (
          <div key={category}>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-400">
              {category}
            </h4>
            <div className="space-y-2">
              {group.map((item) => {
                const qty = qtyFor(item.id);
                return (
                  <div
                    key={item.id}
                    className={clsx(
                      'flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors',
                      qty > 0 ? 'border-brand-200 bg-brand-50/50' : 'border-stone-200 bg-white',
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-800">{item.name}</p>
                      <p className="truncate text-xs text-stone-400">{item.description}</p>
                      <p className="mt-0.5 text-xs font-semibold text-stone-600">
                        {formatMoney(item.price, currencySymbol)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQty(item, qty - 1)}
                        disabled={qty === 0}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 text-stone-600 disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-bold">{qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(item, qty + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 text-stone-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {items.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-stone-900 px-4 py-3 text-white">
          <span className="text-sm font-medium">Pre-order total</span>
          <span className="text-lg font-bold">
            {formatMoney(preOrderTotal(items), currencySymbol)}
          </span>
        </div>
      )}
    </div>
  );
}