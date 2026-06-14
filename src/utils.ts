import { Period } from './types';

export function getPeriod(time: string): Period {
  const hour = parseInt(time.split(':')[0], 10);
  return hour < 12 ? 'AM' : 'PM';
}

const WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'];
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getWeekdayIndex(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00').getDay();
}

export function getWeekdayLabel(dateStr: string, locale: string): string {
  const idx = getWeekdayIndex(dateStr);
  return locale === 'ja' ? WEEKDAYS_JA[idx] : WEEKDAYS_EN[idx];
}

// dayIndex: 0=Sun(red), 6=Sat(blue), else gray
export function getWeekdayColor(dayIndex: number): string {
  if (dayIndex === 6) return '#4361ee';
  if (dayIndex === 0) return '#e63946';
  return '#555';
}

export function getDateParts(dateStr: string, locale: string): { prefix: string; weekday: string; suffix: string } {
  const d = new Date(dateStr + 'T00:00:00');
  const idx = d.getDay();
  const weekday = locale === 'ja' ? WEEKDAYS_JA[idx] : WEEKDAYS_EN[idx];
  if (locale === 'ja') {
    return { prefix: `${d.getMonth() + 1}月${d.getDate()}日(`, weekday, suffix: ')' };
  }
  return { prefix: `${MONTHS_EN[d.getMonth()]} ${d.getDate()} (`, weekday, suffix: ')' };
}

export function formatMonthHeader(year: number, month: number, locale: string): string {
  if (locale === 'ja') return `${year}年 ${month}月`;
  return `${MONTHS_EN[month - 1]} ${year}`;
}

export function formatGraphLabel(day: number, period: Period, locale: string): string {
  if (locale === 'ja') return `${day}${period === 'AM' ? '午前' : '午後'}`;
  return `${day} ${period}`;
}

export function formatLegendDay(day: number, locale: string): string {
  return locale === 'ja' ? `${day}日` : `${day}`;
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
