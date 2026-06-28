import type { RestaurantSettings } from '@/lib/types';

// Default restaurant configuration. Editable at runtime in /manager/settings and
// persisted to the store. Currency defaults to PKR to match the local market
// (Raast / JazzCash / Easypaisa) but is fully configurable.
export const DEFAULT_SETTINGS: RestaurantSettings = {
  branding: {
    restaurantName: 'The Copper Spoon',
    primaryColor: '#326dff',
    logoText: 'CS',
    currency: 'PKR',
    currencySymbol: 'Rs',
  },
  deposit: {
    enabled: true,
    largePartyThreshold: 6,
    perGuestAmount: 500,
    peakDays: [5, 6], // Friday, Saturday
    peakStartHour: 18, // 6 PM
    peakDeposit: 1500,
    preOrderAdvanceRate: 0.2,
  },
  reservationDurationMinutes: 90,
};

export const DB_VERSION = 1;
export const STORAGE_KEY = 'tablekit.db.v1';