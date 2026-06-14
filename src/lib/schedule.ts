// 自动排程算法（核心）
//
// 规则：
//  1. 考试越近的科目越优先   2. 优先级高的科目优先
//  3. 难度高 / 重点章节尽量提前（正向填充靠前）
//  4. 复盘 / 错题 / 模拟卷排到考前（逆向回填）
//  5. 每天任务总时长不超过当天可用时间   6. 排不下 -> shortfall 预警
//  7. 已完成章节不再安排   8. 章节可跨天拆分（分配的是「小时」）
import type { AppState, Chapter, ScheduleTask, Subject } from './types';
import { LEVEL_WEIGHT } from './constants';
import { addDays, dateRange, daysBetween, todayStr } from './date';
import { uid } from './id';
import { availabilityFor, chapterRemaining, futureSubjects } from './selectors';

const EPS = 0.01;
const round2 = (n: number) => Math.round(n * 100) / 100;

interface Unit {
  chapter: Chapter;
  subject: Subject;
  remaining: number;
}

export function generateSchedule(state: AppState, today = todayStr()): ScheduleTask[] {
  // 已完成任务原样保留（历史 + 占用其所在日期容量）
  const completed = state.tasks.filter((t) => t.completed);

  const fSubjects = futureSubjects(state, today);
  if (fSubjects.length === 0) return completed;

  // 时间轴：今天 .. 最晚考试的前一天
  const lastExam = fSubjects.reduce(
    (m, s) => (s.examDate > m ? s.examDate : m),
    fSubjects[0].examDate,
  );
  const days = dateRange(today, addDays(lastExam, -1));

  // 每日剩余容量
  const capacity: Record<string, number> = {};
  for (const d of days) capacity[d] = availabilityFor(state, d);
  for (const t of completed) {
    if (t.date in capacity) capacity[t.date] = Math.max(0, round2(capacity[t.date] - t.hours));
  }

  const subjById = new Map(fSubjects.map((s) => [s.id, s]));

  // 待排单元（剩余 > 0、属于未来科目）
  const units: Unit[] = [];
  for (const ch of state.chapters) {
    const subject = subjById.get(ch.subjectId);
    if (!subject) continue;
    const remaining = chapterRemaining(ch);
    if (remaining <= EPS) continue;
    units.push({ chapter: ch, subject, remaining });
  }

  const cmp = (a: Unit, b: Unit) => {
    // ① 考试越近越先
    if (a.subject.examDate !== b.subject.examDate) {
      return a.subject.examDate < b.subject.examDate ? -1 : 1;
    }
    // ② 优先级高的先
    const pa = LEVEL_WEIGHT[a.subject.priority];
    const pb = LEVEL_WEIGHT[b.subject.priority];
    if (pa !== pb) return pb - pa;
    // ③ 难度 + 重点 高的先
    const wa = LEVEL_WEIGHT[a.chapter.difficulty] + (a.chapter.isImportant ? 1.5 : 0);
    const wb = LEVEL_WEIGHT[b.chapter.difficulty] + (b.chapter.isImportant ? 1.5 : 0);
    return wb - wa;
  };

  const study = units.filter((u) => u.chapter.kind === 'study').sort(cmp);
  const review = units.filter((u) => u.chapter.kind === 'review').sort(cmp);

  const out: ScheduleTask[] = [...completed];

  // 某单元可排的日子：今天 .. 该科考前一天
  const eligible = (u: Unit) => days.filter((d) => daysBetween(d, u.subject.examDate) >= 1);

  // Phase A：普通章节正向填充（难/重点靠前 -> 落在更早的天）
  for (const u of study) allocate(u, eligible(u), 'forward', capacity, out, today);
  // Phase B：复盘/错题/模拟卷 逆向回填（贴近考试）
  for (const u of review) allocate(u, eligible(u), 'backward', capacity, out, today);

  return out;
}

function allocate(
  u: Unit,
  elig: string[],
  dir: 'forward' | 'backward',
  capacity: Record<string, number>,
  out: ScheduleTask[],
  today: string,
) {
  let remaining = u.remaining;
  const order = dir === 'forward' ? elig : [...elig].reverse();
  for (const d of order) {
    if (remaining <= EPS) break;
    const avail = capacity[d] ?? 0;
    if (avail <= EPS) continue;
    const take = round2(Math.min(avail, remaining));
    pushTask(out, u, d, take, false);
    capacity[d] = round2(avail - take);
    remaining = round2(remaining - take);
  }
  if (remaining > EPS) {
    // 时间不足：余量塞到考前最后一个可排日（无可排日则放今天），标 shortfall
    const fallback = elig.length ? elig[elig.length - 1] : today;
    pushTask(out, u, fallback, round2(remaining), true);
  }
}

function pushTask(out: ScheduleTask[], u: Unit, date: string, hours: number, shortfall: boolean) {
  out.push({
    id: uid('task'),
    date,
    subjectId: u.subject.id,
    chapterId: u.chapter.id,
    title: u.chapter.title,
    hours,
    completed: false,
    kind: u.chapter.kind,
    shortfall: shortfall || undefined,
  });
}
