import type { DepositRules, PreOrderItem } from '@/lib/types';
import { preOrderTotal } from '@/lib/helpers/pricing';
import { toDateTime } from '@/lib/helpers/datetime';

// =============================================================================
// Deposit rule engine (USP #2 — guaranteed covers via deposits).
// Given the restaurant's configurable rules + the booking, decide whether a
// deposit is required and how much. Used by every channel.
// =============================================================================

export interface DepositDecision {
  required: boolean;
  /** Deposit driven purely by the rules (large party / peak slot). */
  baseAmount: number;
  /** Advance taken against a pre-order, if any. */
  preOrderAdvance: number;
  /** Total amount due now = baseAmount + preOrderAdvance. */
  amount: number;
  reasons: string[];
}

export function evaluateDeposit(
  rules: DepositRules,
  params: {
    guests: number;
    date: string;
    time: string;
    preOrderItems?: PreOrderItem[];
  },
): DepositDecision {
  const reasons: string[] = [];
  let baseAmount = 0;

  if (rules.enabled) {
    // Large-party rule: per-guest deposit.
    if (params.guests >= rules.largePartyThreshold) {
      baseAmount = rules.perGuestAmount * params.guests;
      reasons.push(
        `Party of ${params.guests} (deposit applies for ${rules.largePartyThreshold}+).`,
      );
    }

    // Peak-slot rule: flat deposit on peak days at/after peak hour.
    const dt = toDateTime(params.date, params.time);
    const day = dt.getDay();
    const hour = dt.getHours();
    const isPeak = rules.peakDays.includes(day) && hour >= rules.peakStartHour;
    if (isPeak) {
      // Use the larger of the two base deposits rather than stacking.
      if (rules.peakDeposit > baseAmount) baseAmount = rules.peakDeposit;
      reasons.push('Peak day / time slot.');
    }
  }

  const items = params.preOrderItems ?? [];
  const preOrderAdvance = items.length
    ? Math.round(preOrderTotal(items) * rules.preOrderAdvanceRate)
    : 0;
  if (preOrderAdvance > 0) {
    reasons.push(
      `${Math.round(rules.preOrderAdvanceRate * 100)}% advance on pre-order.`,
    );
  }

  const amount = baseAmount + preOrderAdvance;
  return {
    required: amount > 0,
    baseAmount,
    preOrderAdvance,
    amount,
    reasons,
  };
}