// localStorage 读写（带 SSR 守卫与容错）
import { DEFAULT_DAILY_HOURS, STATE_VERSION, STORAGE_KEY } from './constants';
import type { AppState } from './types';

function normalizeState(raw: unknown): AppState | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Partial<AppState>;
  return {
    version: STATE_VERSION,
    subjects: Array.isArray(data.subjects) ? data.subjects : [],
    chapters: Array.isArray(data.chapters) ? data.chapters : [],
    courses: Array.isArray(data.courses) ? data.courses : [],
    availability: Array.isArray(data.availability) ? data.availability : [],
    defaultDailyHours:
      typeof data.defaultDailyHours === 'number' ? data.defaultDailyHours : DEFAULT_DAILY_HOURS,
    tasks: Array.isArray(data.tasks) ? data.tasks : [],
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
  };
}

export function loadState(): AppState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeState(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 忽略配额 / 隐私模式等写入错误
  }
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
