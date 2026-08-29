import { DEFAULT_USER_NAME, STATE_VERSION, STORAGE_KEY } from './constants';
import type { AppState, KnowledgePoint, Subject } from './types';

type LegacySubject = Partial<Subject> & { id?: unknown };
type LegacyPoint = Partial<KnowledgePoint> & {
  id?: unknown;
  subjectId?: unknown;
  estimatedHours?: unknown;
  completedHours?: unknown;
};

export function normalizeState(raw: unknown): AppState | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;

  const subjects = Array.isArray(data.subjects)
    ? data.subjects
        .filter((item): item is LegacySubject => Boolean(item) && typeof item === 'object')
        .map((item, index): Subject => ({
          id: typeof item.id === 'string' && item.id ? item.id : `subject_${index}`,
          name: typeof item.name === 'string' && item.name.trim() ? item.name.trim() : '未命名课程',
          examDate: typeof item.examDate === 'string' ? item.examDate : '',
          examTime: typeof item.examTime === 'string' ? item.examTime : '',
          notes: typeof item.notes === 'string' ? item.notes : '',
        }))
    : [];

  const subjectIds = new Set(subjects.map((subject) => subject.id));
  const chapters = Array.isArray(data.chapters)
    ? data.chapters
        .filter((item): item is LegacyPoint => Boolean(item) && typeof item === 'object')
        .map((item, index): KnowledgePoint | null => {
          if (typeof item.subjectId !== 'string' || !subjectIds.has(item.subjectId)) return null;
          const estimated = Number(item.estimatedHours);
          const completedHours = Number(item.completedHours);
          const completed =
            typeof item.completed === 'boolean'
              ? item.completed
              : Number.isFinite(estimated) && estimated > 0 && completedHours >= estimated - 0.01;
          return {
            id: typeof item.id === 'string' && item.id ? item.id : `point_${index}`,
            subjectId: item.subjectId,
            title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : '未命名知识点',
            completed,
            isImportant: Boolean(item.isImportant),
          };
        })
        .filter((item): item is KnowledgePoint => Boolean(item))
    : [];

  return {
    version: STATE_VERSION,
    userName:
      typeof data.userName === 'string' && data.userName.trim() ? data.userName.trim() : DEFAULT_USER_NAME,
    subjects,
    chapters,
  };
}

export function loadState(): AppState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Keep the app usable when storage is unavailable.
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
