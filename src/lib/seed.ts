// 示例数据 —— 首次打开自动注入，考期相对「今天」生成，任何时候打开都能看到合理计划
import type { AppState, Chapter, ChapterKind, Course, DailyAvailability, Level, Subject } from './types';
import {
  DEFAULT_COURSE_TERM_START_DATE,
  DEFAULT_COURSE_WEEK_COUNT,
  DEFAULT_DAILY_HOURS,
  DEFAULT_USER_NAME,
  STATE_VERSION,
} from './constants';
import { allCourseWeeks } from './courseWeeks';
import { addDays, todayStr } from './date';
import { generateSchedule } from './schedule';
import { uid } from './id';

export function buildSeedState(): AppState {
  const today = todayStr();
  // 三场考试：今天 +2 / +4 / +6 天
  const sEng = uid('sub');
  const sCal = uid('sub');
  const sLin = uid('sub');

  const subjects: Subject[] = [
    { id: sEng, name: '大学英语', examDate: addDays(today, 2), examTime: '09:00', difficulty: 'mid', priority: 'mid', notes: '作文模板要背熟' },
    { id: sCal, name: '微积分', examDate: addDays(today, 4), examTime: '14:00', difficulty: 'high', priority: 'high', notes: '重点在多元积分' },
    { id: sLin, name: '线性代数', examDate: addDays(today, 6), examTime: '09:00', difficulty: 'high', priority: 'high', notes: '' },
  ];

  const ch = (
    subjectId: string,
    title: string,
    estimatedHours: number,
    difficulty: Level,
    isImportant: boolean,
    kind: ChapterKind,
  ): Chapter => ({
    id: uid('ch'),
    subjectId,
    title,
    estimatedHours,
    completedHours: 0,
    difficulty,
    isImportant,
    kind,
  });

  const chapters: Chapter[] = [
    // 大学英语
    ch(sEng, '作文模板', 1.5, 'mid', true, 'study'),
    ch(sEng, '真题阅读', 2, 'high', false, 'study'),
    ch(sEng, '模拟卷', 2, 'mid', false, 'review'),
    // 微积分
    ch(sCal, '15.1 二重积分', 2, 'high', true, 'study'),
    ch(sCal, '15.2 三重积分', 2, 'mid', false, 'study'),
    ch(sCal, '16.1 曲线积分', 3, 'high', true, 'study'),
    ch(sCal, '16.2 曲面积分', 4, 'high', true, 'study'),
    ch(sCal, '错题整理', 2, 'high', false, 'review'),
    ch(sCal, '模拟卷', 3, 'high', false, 'review'),
    // 线性代数
    ch(sLin, '特征值与特征向量', 2, 'high', true, 'study'),
    ch(sLin, '二次型', 2, 'mid', false, 'study'),
    ch(sLin, '错题整理', 1, 'mid', false, 'review'),
    ch(sLin, '模拟卷', 2, 'high', false, 'review'),
  ];

  const availability: DailyAvailability[] = [
    { date: addDays(today, 1), availableHours: 6 },
    { date: addDays(today, 2), availableHours: 4 },
    { date: addDays(today, 3), availableHours: 8 },
  ];

  const meet = (weekday: Course['meetings'][number]['weekday'], startSection: number, endSection: number) => ({
    id: uid('meet'),
    weekday,
    startSection,
    endSection,
    weeks: allCourseWeeks(DEFAULT_COURSE_WEEK_COUNT),
  });

  const courses: Course[] = [
    {
      id: uid('course'),
      name: '微积分（2）',
      term: '2026春',
      meetings: [
        meet(1, 1, 2),
        meet(3, 1, 2),
        meet(5, 3, 4),
      ],
      keyTopics: ['15.1 二重积分', '15.2 三重积分', '16.1 曲线积分'],
      hidden: false,
      excludedFromReview: false,
      notes: '',
    },
    {
      id: uid('course'),
      name: '英语科技文献阅读',
      term: '2026春',
      meetings: [
        meet(2, 1, 2),
        meet(5, 1, 2),
      ],
      keyTopics: [],
      hidden: false,
      excludedFromReview: true,
      notes: '不需要纳入复习系统',
    },
  ];

  const base: AppState = {
    version: STATE_VERSION,
    userName: DEFAULT_USER_NAME,
    subjects,
    chapters,
    courses,
    availability,
    courseTermStartDate: DEFAULT_COURSE_TERM_START_DATE,
    courseWeekCount: DEFAULT_COURSE_WEEK_COUNT,
    defaultDailyHours: DEFAULT_DAILY_HOURS,
    tasks: [],
    reviews: [],
  };
  base.tasks = generateSchedule(base, today);
  return base;
}

export function emptyState(): AppState {
  return {
    version: STATE_VERSION,
    userName: DEFAULT_USER_NAME,
    subjects: [],
    chapters: [],
    courses: [],
    availability: [],
    courseTermStartDate: DEFAULT_COURSE_TERM_START_DATE,
    courseWeekCount: DEFAULT_COURSE_WEEK_COUNT,
    defaultDailyHours: DEFAULT_DAILY_HOURS,
    tasks: [],
    reviews: [],
  };
}
