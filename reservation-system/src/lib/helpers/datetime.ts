// Small date/time utilities shared everywhere. Kept dependency-free so the same
// helpers run in the browser, the widget, and the WhatsApp handler.

/** YYYY-MM-DD for a Date in local time. */
export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** HH:mm for a Date in local time. */
export function toTimeStr(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function todayStr(): string {
  return toDateStr(new Date());
}

export function nowTimeStr(): string {
  return toTimeStr(new Date());
}

/** Combine a YYYY-MM-DD + HH:mm into a Date in local time. */
export function toDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

/** Round a Date up to the next 15-minute slot — used for default booking time. */
export function nextSlot(d = new Date()): Date {
  const out = new Date(d);
  out.setSeconds(0, 0);
  const r = out.getMinutes() % 15;
  if (r !== 0) out.setMinutes(out.getMinutes() + (15 - r));
  return out;
}

/** Human label like "Sat, 28 Jun · 8:00 PM". */
export function formatDateTimeLabel(date: string, time: string): string {
  const d = toDateTime(date, time);
  if (Number.isNaN(d.getTime())) return `${date} ${time}`;
  const datePart = d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const timePart = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${datePart} · ${timePart}`;
}

export function formatTimeLabel(time: string): string {
  const d = toDateTime(todayStr(), time);
  if (Number.isNaN(d.getTime())) return time;
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function isToday(date: string): boolean {
  return date === todayStr();
}

/** Generate selectable HH:mm slots for a day (e.g. 12:00–23:30 every 30 min). */
export function daySlots(startHour = 12, endHour = 23, stepMin = 30): string[] {
  const out: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += stepMin) {
      out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return out;
}