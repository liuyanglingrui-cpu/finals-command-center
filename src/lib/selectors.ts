import type { AppState, KnowledgePoint, Subject } from './types';
import { daysBetween, todayStr } from './date';

export function subjectChapters(state: AppState, subjectId: string): KnowledgePoint[] {
  return state.chapters.filter((item) => item.subjectId === subjectId);
}

export interface SubjectProgress {
  totalChapters: number;
  doneChapters: number;
  remainingChapters: number;
  pct: number;
}

export function subjectProgress(state: AppState, subjectId: string): SubjectProgress {
  const points = subjectChapters(state, subjectId);
  const done = points.filter((item) => item.completed).length;
  return {
    totalChapters: points.length,
    doneChapters: done,
    remainingChapters: points.length - done,
    pct: points.length > 0 ? done / points.length : 0,
  };
}

export function overallProgress(state: AppState) {
  const done = state.chapters.filter((item) => item.completed).length;
  return {
    totalChapters: state.chapters.length,
    doneChapters: done,
    remainingChapters: state.chapters.length - done,
    pct: state.chapters.length > 0 ? done / state.chapters.length : 0,
  };
}

export function futureSubjects(state: AppState, today = todayStr()): Subject[] {
  return state.subjects
    .filter((subject) => subject.examDate && daysBetween(today, subject.examDate) >= 0)
    .sort((a, b) => a.examDate.localeCompare(b.examDate) || a.examTime.localeCompare(b.examTime));
}

export function nextExam(state: AppState, today = todayStr()): Subject | null {
  return futureSubjects(state, today)[0] ?? null;
}
