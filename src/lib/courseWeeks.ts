import { DEFAULT_COURSE_WEEK_COUNT } from './constants';
import { addDays, daysBetween, todayStr } from './date';

export function allCourseWeeks(count = DEFAULT_COURSE_WEEK_COUNT): number[] {
  const safeCount = Math.max(1, Math.floor(count || DEFAULT_COURSE_WEEK_COUNT));
  return Array.from({ length: safeCount }, (_, idx) => idx + 1);
}

export function normalizeCourseWeeks(
  weeks: unknown,
  count = DEFAULT_COURSE_WEEK_COUNT,
): number[] {
  if (!Array.isArray(weeks)) return allCourseWeeks(count);
  const normalized = [...new Set(weeks.map(Number))]
    .filter((week) => Number.isInteger(week) && week >= 1 && week <= count)
    .sort((a, b) => a - b);
  return normalized.length ? normalized : allCourseWeeks(count);
}

export function clampCourseWeek(week: number, count = DEFAULT_COURSE_WEEK_COUNT): number {
  const safeCount = Math.max(1, Math.floor(count || DEFAULT_COURSE_WEEK_COUNT));
  if (!Number.isFinite(week)) return 1;
  return Math.min(Math.max(1, Math.floor(week)), safeCount);
}

export function currentCourseWeek(
  termStartDate: string,
  today = todayStr(),
  count = DEFAULT_COURSE_WEEK_COUNT,
): number {
  return clampCourseWeek(Math.floor(daysBetween(termStartDate, today) / 7) + 1, count);
}

export function courseWeekStartDate(termStartDate: string, week: number): string {
  return addDays(termStartDate, (Math.max(1, week) - 1) * 7);
}

export function courseWeekDates(termStartDate: string, week: number): string[] {
  const start = courseWeekStartDate(termStartDate, week);
  return Array.from({ length: 7 }, (_, idx) => addDays(start, idx));
}

export function formatCourseWeeks(weeks: unknown, count = DEFAULT_COURSE_WEEK_COUNT): string {
  const normalized = normalizeCourseWeeks(weeks, count);
  if (normalized.length === count) return `第1-${count}周`;

  const groups: Array<[number, number]> = [];
  for (const week of normalized) {
    const last = groups.at(-1);
    if (last && week === last[1] + 1) last[1] = week;
    else groups.push([week, week]);
  }

  return groups
    .map(([start, end]) => (start === end ? `第${start}周` : `第${start}-${end}周`))
    .join('、');
}
