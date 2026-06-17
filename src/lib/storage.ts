// localStorage 读写（带 SSR 守卫与容错）
import {
  DEFAULT_COURSE_TERM_START_DATE,
  DEFAULT_COURSE_WEEK_COUNT,
  DEFAULT_DAILY_HOURS,
  DEFAULT_USER_NAME,
  STATE_VERSION,
  STORAGE_KEY,
} from './constants';
import { normalizeCourseWeeks } from './courseWeeks';
import type { AppState, Course, CourseMeeting } from './types';

function normalizeCourseMeeting(raw: unknown, courseWeekCount: number, idx: number): CourseMeeting | null {
  if (!raw || typeof raw !== 'object') return null;
  const meeting = raw as Partial<CourseMeeting>;
  const weekday = Number(meeting.weekday);
  const start = Number(meeting.startSection);
  const end = Number(meeting.endSection);
  if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) return null;
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return {
    id: typeof meeting.id === 'string' && meeting.id ? meeting.id : `meet_${idx}`,
    weekday: weekday as CourseMeeting['weekday'],
    startSection: Math.min(start, end),
    endSection: Math.max(start, end),
    weeks: normalizeCourseWeeks(meeting.weeks, courseWeekCount),
  };
}

function normalizeCourses(raw: unknown, courseWeekCount: number): Course[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Partial<Course> => Boolean(item) && typeof item === 'object')
    .map((course, courseIdx) => ({
      id: typeof course.id === 'string' && course.id ? course.id : `course_${courseIdx}`,
      name: typeof course.name === 'string' ? course.name : '未命名课程',
      term: typeof course.term === 'string' ? course.term : '',
      meetings: Array.isArray(course.meetings)
        ? course.meetings
            .map((meeting, idx) => normalizeCourseMeeting(meeting, courseWeekCount, idx))
            .filter((meeting): meeting is CourseMeeting => Boolean(meeting))
        : [],
      keyTopics: Array.isArray(course.keyTopics)
        ? course.keyTopics.filter((topic): topic is string => typeof topic === 'string')
        : [],
      hidden: Boolean(course.hidden),
      excludedFromReview: Boolean(course.excludedFromReview),
      notes: typeof course.notes === 'string' ? course.notes : '',
    }));
}

function normalizeState(raw: unknown): AppState | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Partial<AppState>;
  const courseWeekCount =
    typeof data.courseWeekCount === 'number' && data.courseWeekCount >= 1
      ? Math.floor(data.courseWeekCount)
      : DEFAULT_COURSE_WEEK_COUNT;
  return {
    version: STATE_VERSION,
    userName: typeof data.userName === 'string' && data.userName.trim() ? data.userName : DEFAULT_USER_NAME,
    subjects: Array.isArray(data.subjects) ? data.subjects : [],
    chapters: Array.isArray(data.chapters) ? data.chapters : [],
    courses: normalizeCourses(data.courses, courseWeekCount),
    availability: Array.isArray(data.availability) ? data.availability : [],
    courseTermStartDate:
      typeof data.courseTermStartDate === 'string' && data.courseTermStartDate
        ? data.courseTermStartDate
        : DEFAULT_COURSE_TERM_START_DATE,
    courseWeekCount,
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
