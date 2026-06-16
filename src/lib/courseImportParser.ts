import type { CourseWeekday } from './types';

export interface ParsedCourseMeeting {
  weekday: CourseWeekday;
  startSection: number;
  endSection: number;
}

export interface ParsedCourse {
  name: string;
  term: string;
  meetings: ParsedCourseMeeting[];
  keyTopics: string[];
  hidden: boolean;
  excludedFromReview: boolean;
  notes: string;
}

export interface CourseConflict {
  weekday: CourseWeekday;
  startSection: number;
  endSection: number;
  courseNames: string[];
}

export const COURSE_WEEKDAY_LABEL: Record<CourseWeekday, string> = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  7: '周日',
};

const WEEKDAY_MAP: Record<string, CourseWeekday> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  日: 7,
  天: 7,
};

const MEETING_RE = /周([一二三四五六日天])\s*(\d{1,2})(?:\s*[-－—~～到至]\s*(\d{1,2}))?\s*节/g;
const TOPIC_RE = /^(?:重点章节|重点|章节|复习范围)\s*[:：]\s*(.+)$/;
const TERM_RE = /(20\d{2}\s*(?:春季?|秋季?|夏季?|冬季?|上学期|下学期|上|下))/;

function emptyCourse(name = '未命名课程'): ParsedCourse {
  return {
    name,
    term: '',
    meetings: [],
    keyTopics: [],
    hidden: false,
    excludedFromReview: false,
    notes: '',
  };
}

function normalizeTerm(term: string): string {
  return term.replace(/\s+/g, '');
}

function splitTopics(raw: string): string[] {
  return raw
    .split(/[\/、,，;；]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseCourseTitle(line: string): { name: string; term: string } {
  const term = line.match(TERM_RE)?.[1] ?? '';
  const name = line
    .replace(TERM_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { name: name || '未命名课程', term: normalizeTerm(term) };
}

function parseMeetings(line: string): ParsedCourseMeeting[] {
  return [...line.matchAll(MEETING_RE)].map((m) => {
    const start = Number(m[2]);
    const end = Number(m[3] ?? m[2]);
    return {
      weekday: WEEKDAY_MAP[m[1]],
      startSection: Math.min(start, end),
      endSection: Math.max(start, end),
    };
  });
}

function appendNote(course: ParsedCourse, note: string) {
  const cleaned = note.replace(/^（|）$/g, '').trim();
  if (!cleaned) return;
  course.notes = course.notes ? `${course.notes}；${cleaned}` : cleaned;
}

export function parseCourseImportText(text: string): ParsedCourse[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const courses: ParsedCourse[] = [];
  let current: ParsedCourse | null = null;

  for (const line of lines) {
    const meetings = parseMeetings(line);
    if (meetings.length > 0) {
      if (!current) {
        current = emptyCourse();
        courses.push(current);
      }
      current.meetings.push(...meetings);
      continue;
    }

    const topicMatch = line.match(TOPIC_RE);
    if (topicMatch) {
      if (!current) {
        current = emptyCourse();
        courses.push(current);
      }
      current.keyTopics.push(...splitTopics(topicMatch[1]));
      continue;
    }

    const isAnnotation = line.startsWith('（') || line.startsWith('(');
    const marksExcluded = /不需要纳入复习系统|不纳入复习系统|不纳入复习|不用复习/.test(line);
    const marksHidden = /可选隐藏|隐藏|未出现在/.test(line);
    if (isAnnotation || marksExcluded || marksHidden) {
      if (!current) {
        current = emptyCourse();
        courses.push(current);
      }
      current.excludedFromReview ||= marksExcluded;
      current.hidden ||= marksHidden;
      appendNote(current, line);
      continue;
    }

    const title = parseCourseTitle(line);
    current = emptyCourse(title.name);
    current.term = title.term;
    courses.push(current);
  }

  return courses.filter((course) => course.name.trim() || course.meetings.length > 0);
}

function overlaps(a: ParsedCourseMeeting, b: ParsedCourseMeeting): boolean {
  return a.weekday === b.weekday && a.startSection <= b.endSection && b.startSection <= a.endSection;
}

type ConflictCourse = Pick<ParsedCourse, 'name' | 'meetings' | 'hidden'>;

export function findCourseConflicts(courses: ConflictCourse[]): CourseConflict[] {
  const visibleCourses = courses.filter((course) => !course.hidden);
  const conflicts: CourseConflict[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < visibleCourses.length; i += 1) {
    for (let j = i + 1; j < visibleCourses.length; j += 1) {
      for (const a of visibleCourses[i].meetings) {
        for (const b of visibleCourses[j].meetings) {
          if (!overlaps(a, b)) continue;
          const startSection = Math.max(a.startSection, b.startSection);
          const endSection = Math.min(a.endSection, b.endSection);
          const courseNames = [visibleCourses[i].name, visibleCourses[j].name].sort();
          const key = `${a.weekday}:${startSection}:${endSection}:${courseNames.join('|')}`;
          if (seen.has(key)) continue;
          seen.add(key);
          conflicts.push({ weekday: a.weekday, startSection, endSection, courseNames });
        }
      }
    }
  }

  return conflicts.sort(
    (a, b) =>
      a.weekday - b.weekday ||
      a.startSection - b.startSection ||
      a.endSection - b.endSection ||
      a.courseNames.join('').localeCompare(b.courseNames.join('')),
  );
}

