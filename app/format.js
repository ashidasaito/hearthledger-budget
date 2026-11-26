export function money(cents) {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return sign + '$' + (abs / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function moneyShort(cents) {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  if (abs >= 100000) return sign + '$' + (abs / 100000).toFixed(1).replace(/\.0$/, '') + 'k';
  return money(cents);
}

export function parseMoney(text) {
  const cleaned = String(text).replace(/[$,\s]/g, '');
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}

export function pct(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

export function monthName(year, month) {
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function dayLabel(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function daysUntil(dateStr, todayStr) {
  const a = new Date(todayStr + 'T12:00:00');
  const b = new Date(dateStr + 'T12:00:00');
  return Math.round((b - a) / 86400000);
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
