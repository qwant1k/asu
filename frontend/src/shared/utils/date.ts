export function parseApiDate(value?: string | null): Date | null {
  if (!value) return null;
  const text = String(value).trim();
  const local = text.match(
    /^(\d{2})\.(\d{2})\.(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (local) {
    const [, day, month, year, hour = '0', minute = '0', second = '0'] = local;
    const parsed = new Date(
      Number(year), Number(month) - 1, Number(day),
      Number(hour), Number(minute), Number(second),
    );
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const iso = new Date(text.length === 10 ? `${text}T00:00:00` : text);
  return Number.isNaN(iso.getTime()) ? null : iso;
}

export function formatApiDate(value?: string | null, locale = 'ru-KZ'): string {
  const parsed = parseApiDate(value);
  return parsed ? parsed.toLocaleDateString(locale) : '—';
}

export function formatApiDateTime(value?: string | null, locale = 'ru-KZ'): string {
  const parsed = parseApiDate(value);
  return parsed ? parsed.toLocaleString(locale) : '—';
}

export function toLocalDateInputValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
