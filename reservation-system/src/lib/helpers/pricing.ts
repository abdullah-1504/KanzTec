import type { MenuItem, PreOrderItem } from '@/lib/types';

/** Build a PreOrderItem line from a menu item + quantity. */
export function makePreOrderItem(item: MenuItem, quantity: number): PreOrderItem {
  return {
    menuItemId: item.id,
    name: item.name,
    quantity,
    price: item.price,
    total: item.price * quantity,
  };
}

/** Sum of all pre-order line totals. */
export function preOrderTotal(items: PreOrderItem[]): number {
  return items.reduce((sum, i) => sum + i.total, 0);
}

export function preOrderItemCount(items: PreOrderItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

/** Format an amount with the restaurant's currency symbol, e.g. "Rs 1,200". */
export function formatMoney(amount: number, symbol = 'Rs'): string {
  return `${symbol} ${Math.round(amount).toLocaleString()}`;
}