import { todayStr, toDateStr, nowTimeStr, toTimeStr } from '@/lib/helpers/datetime';

// =============================================================================
// Tiny, structured natural-language parsing for the WhatsApp agent. Deliberately
// simple and isolated so it can later be swapped for a real NLU service without
// touching the conversation handler.
// =============================================================================

// Spelled-out party sizes. NOTE: "a"/"an" are deliberately NOT here — treating
// "a table" as 2 guests was a major misdetection source. "couple"/"few" only
// count when they clearly describe the party (handled below), not in passing.
const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
};

/** Extract a party size from text like "table for 4", "four people", "6". */
export function parsePartySize(text: string): number | null {
  const t = text.toLowerCase();

  // A number tied to party wording is the strongest signal: "for 4",
  // "party of 6", "table of 2", "5 people/guests/pax/adults/persons".
  const contextual = t.match(
    /\b(?:for|of|party of|table of|group of)\s+(\d{1,2})\b/,
  ) || t.match(/\b(\d{1,2})\s*(?:people|persons?|guests?|pax|adults?|heads?|of us)\b/);
  if (contextual) {
    const n = parseInt(contextual[1], 10);
    if (n >= 1 && n <= 30) return n;
  }

  // "couple" / "a couple" → 2, "a few" → 3 (only as standalone party descriptors).
  if (/\b(?:a\s+)?couple\b/.test(t)) return 2;
  if (/\ba few\b/.test(t)) return 3;

  const digit = t.match(/\b(\d{1,2})\b/);
  if (digit) {
    const n = parseInt(digit[1], 10);
    if (n >= 1 && n <= 30) return n;
  }
  for (const [word, n] of Object.entries(NUMBER_WORDS)) {
    if (new RegExp(`\\b${word}\\b`).test(t)) return n;
  }
  return null;
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/** Resolve a relative date phrase to YYYY-MM-DD. */
export function parseDate(text: string): string | null {
  const t = text.toLowerCase();
  if (/\b(today|tonight|now)\b/.test(t)) return todayStr();
  // "in 20 minutes", "asap", "right away" all imply today.
  if (/\b(asap|right away|right now)\b/.test(t)) return todayStr();
  if (parseRelativeMinutes(t) !== null) return todayStr();
  if (/\btomorrow\b/.test(t)) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toDateStr(d);
  }
  for (let i = 0; i < WEEKDAYS.length; i++) {
    if (new RegExp(`\\b${WEEKDAYS[i].slice(0, 3)}`).test(t)) {
      const d = new Date();
      const diff = (i - d.getDay() + 7) % 7 || 7; // next occurrence
      d.setDate(d.getDate() + diff);
      return toDateStr(d);
    }
  }
  return null;
}

/** Resolve a time phrase like "8pm", "at 9", "20:30", "tonight" to HH:mm. */
export function parseTime(text: string): string | null {
  const t = text.toLowerCase();
  if (/\b(right now|right away|now)\b/.test(t)) return nowTimeStr();

  // Relative durations: "in 20 minutes", "half an hour", "in 2 hours".
  const rel = parseRelativeMinutes(t);
  if (rel !== null) return toTimeStr(new Date(Date.now() + rel * 60_000));

  // 24h "20:30" or "20.30"
  const hhmm = t.match(/\b(\d{1,2})[:.](\d{2})\b/);
  if (hhmm) {
    const h = parseInt(hhmm[1], 10);
    const m = parseInt(hhmm[2], 10);
    if (h < 24 && m < 60) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  // "8pm", "8 pm", "8am"
  const ampm = t.match(/\b(\d{1,2})\s*(am|pm)\b/);
  if (ampm) {
    let h = parseInt(ampm[1], 10) % 12;
    if (ampm[2] === 'pm') h += 12;
    return `${String(h).padStart(2, '0')}:00`;
  }

  // bare "at 8" / "8 o'clock" — assume dinner (pm) for 1-11
  const bare = t.match(/\bat\s*(\d{1,2})\b/) || t.match(/\b(\d{1,2})\s*o'?clock\b/);
  if (bare) {
    let h = parseInt(bare[1], 10);
    if (h >= 1 && h <= 11) h += 12; // 8 -> 20:00
    if (h < 24) return `${String(h).padStart(2, '0')}:00`;
  }

  if (/\btonight\b/.test(t)) return '20:00';
  return null;
}

/**
 * Parse an explicit duration into minutes: "20 minutes", "20 mins", "half an
 * hour", "in an hour", "2 hours". Returns null if no duration is present.
 */
export function parseRelativeMinutes(text: string): number | null {
  const t = text.toLowerCase();
  if (/half an hour|half hour/.test(t)) return 30;

  const hours = t.match(/\b(an|one|1|two|2|three|3|couple)\s*hours?\b/);
  if (hours) {
    const map: Record<string, number> = { an: 1, one: 1, '1': 1, two: 2, '2': 2, three: 3, '3': 3, couple: 2 };
    return (map[hours[1]] ?? 1) * 60;
  }

  const mins = t.match(/\b(\d{1,3})\s*(minutes?|mins?|min)\b/);
  if (mins) return parseInt(mins[1], 10);

  return null;
}

/**
 * Parse a guest's "estimated time of arrival" reply into minutes-from-now.
 * Accepts "right now", "15 minutes", "half an hour", or a bare number ("15").
 */
export function parseEta(text: string): number | null {
  const t = text.toLowerCase().trim();
  if (/\b(right now|right away|now|asap|immediately)\b/.test(t)) return 0;
  const rel = parseRelativeMinutes(t);
  if (rel !== null) return rel;
  const bare = t.match(/^(\d{1,3})$/); // "15"
  if (bare) return parseInt(bare[1], 10);
  return null;
}

/** "asap" / "on my way" etc. — wants a table soon but gave no exact time. */
export function isAsap(text: string): boolean {
  return /\b(asap|as soon as possible|on my way|omw|coming now|be there soon)\b/i.test(text);
}

export function isAffirmative(text: string): boolean {
  return /\b(yes|yeah|yep|sure|ok|okay|confirm|y|please|haan|ji)\b/i.test(text.trim());
}

export function isNegative(text: string): boolean {
  return /\b(no|nope|nah|skip|n|cancel)\b/i.test(text.trim());
}