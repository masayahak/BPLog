import { Period } from './types';

export function getPeriod(time: string): Period {
  const hour = parseInt(time.split(':')[0], 10);
  return hour < 12 ? 'AM' : 'PM';
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export function getWeekday(dateStr: string): string {
  return WEEKDAYS[new Date(dateStr + 'T00:00:00').getDay()];
}

export function getWeekdayColor(w: string): string {
  if (w === '土') return '#4361ee';
  if (w === '日') return '#e63946';
  return '#555';
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const w = WEEKDAYS[d.getDay()];
  return `${m}月${day}日(${w})`;
}

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toTimeString(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function getWeekDates(baseDate: Date, weekOffset: number): string[] {
  const result: string[] = [];
  const start = new Date(baseDate);
  start.setDate(start.getDate() + weekOffset * 7);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(start);
    d.setDate(d.getDate() - i);
    result.push(toDateString(d));
  }
  return result;
}

export function isFuturePeriod(date: string, period: Period): boolean {
  const now = new Date();
  const todayStr = toDateString(now);
  if (date > todayStr) return true;
  if (date === todayStr && period === 'PM' && getPeriod(toTimeString(now)) === 'AM') return true;
  return false;
}

export function getMonthDates(year: number, month: number): string[] {
  const result: string[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const m = String(month).padStart(2, '0');
    const day = String(d).padStart(2, '0');
    result.push(`${year}-${m}-${day}`);
  }
  return result;
}
