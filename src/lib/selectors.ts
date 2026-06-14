// 派生数据选择器（纯函数）
import type { AppState, Chapter, ChapterStatus, Subject } from './types';
import { daysBetween, todayStr } from './date';

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

/** 章节剩余时长 = 预计 - 已完成（下限 0） */
export function chapterRemaining(ch: Chapter): number {
  return Math.max(0, round1(ch.estimatedHours - ch.completedHours));
}

/** 由 completedHours 推导章节状态 */
export function chapterStatus(ch: Chapter): ChapterStatus {
  if (ch.estimatedHours > 0 && ch.completedHours >= ch.estimatedHours - 0.01) return 'done';
  if (ch.completedHours > 0) return 'doing';
  return 'todo';
}

/** 某天可用时间：优先取覆盖项，否则用默认 */
export function availabilityFor(state: AppState, date: string): number {
  const o = state.availability.find((a) => a.date === date);
  return o ? o.availableHours : state.defaultDailyHours;
}

export function subjectChapters(state: AppState, subjectId: string): Chapter[] {
  return state.chapters.filter((c) => c.subjectId === subjectId);
}

export interface SubjectProgress {
  totalChapters: number;
  doneChapters: number;
  totalHours: number;
  completedHours: number;
  remainingHours: number;
  pct: number; // 0..1（按时长）
}

export function subjectProgress(state: AppState, subjectId: string): SubjectProgress {
  const chs = subjectChapters(state, subjectId);
  const totalHours = sum(chs.map((c) => c.estimatedHours));
  const completedHours = sum(chs.map((c) => Math.min(c.completedHours, c.estimatedHours)));
  return {
    totalChapters: chs.length,
    doneChapters: chs.filter((c) => chapterStatus(c) === 'done').length,
    totalHours: round1(totalHours),
    completedHours: round1(completedHours),
    remainingHours: round1(Math.max(0, totalHours - completedHours)),
    pct: totalHours > 0 ? completedHours / totalHours : 0,
  };
}

export function overallProgress(state: AppState) {
  const totalHours = sum(state.chapters.map((c) => c.estimatedHours));
  const completedHours = sum(state.chapters.map((c) => Math.min(c.completedHours, c.estimatedHours)));
  const doneChapters = state.chapters.filter((c) => chapterStatus(c) === 'done').length;
  return {
    totalChapters: state.chapters.length,
    doneChapters,
    totalHours: round1(totalHours),
    completedHours: round1(completedHours),
    pct: totalHours > 0 ? completedHours / totalHours : 0,
  };
}

/** 考试日 >= 今天的科目（按考试时间升序） */
export function futureSubjects(state: AppState, today = todayStr()): Subject[] {
  return state.subjects
    .filter((s) => daysBetween(today, s.examDate) >= 0)
    .sort((a, b) => a.examDate.localeCompare(b.examDate) || a.examTime.localeCompare(b.examTime));
}

/** 最近一场未考的考试 */
export function nextExam(state: AppState, today = todayStr()): Subject | null {
  return futureSubjects(state, today)[0] ?? null;
}

export function subjectById(state: AppState, id: string): Subject | undefined {
  return state.subjects.find((s) => s.id === id);
}
