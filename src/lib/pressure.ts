// 压力指数：剩余总复习时长 / 总可用时间
import type { AppState } from './types';
import { PRESSURE } from './constants';
import { addDays, dateRange, todayStr } from './date';
import { availabilityFor, chapterRemaining, futureSubjects, round1 } from './selectors';

export type PressureLevel = 'green' | 'yellow' | 'red';

export interface Pressure {
  remaining: number; // 剩余总复习时长
  available: number; // 总可用时间
  ratio: number; // remaining / available（available=0 时为 Infinity）
  level: PressureLevel;
  label: string;
}

export function computePressure(state: AppState, today = todayStr()): Pressure {
  const fs = futureSubjects(state, today);
  const subjIds = new Set(fs.map((s) => s.id));

  const remaining = round1(
    state.chapters
      .filter((c) => subjIds.has(c.subjectId))
      .reduce((acc, c) => acc + chapterRemaining(c), 0),
  );

  let available = 0;
  if (fs.length) {
    const lastExam = fs.reduce((m, s) => (s.examDate > m ? s.examDate : m), fs[0].examDate);
    for (const d of dateRange(today, addDays(lastExam, -1))) available += availabilityFor(state, d);
  }
  available = round1(available);

  const ratio = available > 0 ? remaining / available : remaining > 0 ? Infinity : 0;

  let level: PressureLevel = 'green';
  let label = '时间充足';
  if (ratio > PRESSURE.tight) {
    level = 'red';
    label = '时间不足';
  } else if (ratio > PRESSURE.comfortable) {
    level = 'yellow';
    label = '略紧张';
  }

  return { remaining, available, ratio, level, label };
}
