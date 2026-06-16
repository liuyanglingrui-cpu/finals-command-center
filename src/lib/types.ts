// 核心数据类型定义 —— 全部存于 localStorage

/** 难度 / 优先级：低 / 中 / 高 */
export type Level = 'low' | 'mid' | 'high';

/** 章节状态：未开始 / 进行中 / 已完成（由 completedHours 推导，见 status()） */
export type ChapterStatus = 'todo' | 'doing' | 'done';

/** 章节类型：普通学习章节 / 复盘·错题·模拟卷（review 类型会被排到考前） */
export type ChapterKind = 'study' | 'review';

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  /** 预计复习总时长（小时） */
  estimatedHours: number;
  /** 已完成时长（小时）—— 勾选任务时累计，用于推导状态与剩余 */
  completedHours: number;
  difficulty: Level;
  /** 是否为重点章节 */
  isImportant: boolean;
  kind: ChapterKind;
}

export interface Subject {
  id: string;
  name: string;
  /** 考试日期 YYYY-MM-DD */
  examDate: string;
  /** 考试时间 HH:mm */
  examTime: string;
  difficulty: Level;
  priority: Level;
  notes: string;
}

/** 某一天的可用复习时间覆盖项；未设置的日期使用 defaultDailyHours */
export interface DailyAvailability {
  date: string; // YYYY-MM-DD
  availableHours: number;
}

/** 排程产生的一个任务条目（一个章节可被拆成多天的多个 slice） */
export interface ScheduleTask {
  id: string;
  date: string; // YYYY-MM-DD
  subjectId: string;
  chapterId: string;
  title: string;
  /** 该 slice 分配的时长（可小于章节总时长） */
  hours: number;
  completed: boolean;
  kind: ChapterKind;
  /** 因容量不足、考前排不下而溢出的标记 */
  shortfall?: boolean;
}

export interface ReviewLog {
  id: string;
  date: string; // YYYY-MM-DD
  plannedHours: number;
  actualHours: number;
  /** 完成情况 */
  summary: string;
  /** 未完成原因 */
  problems: string;
  /** 明天调整建议 */
  adjustment: string;
}

/** 周几：1=周一 ... 7=周日 */
export type CourseWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface CourseMeeting {
  id: string;
  weekday: CourseWeekday;
  startSection: number;
  endSection: number;
}

export interface Course {
  id: string;
  name: string;
  term: string;
  meetings: CourseMeeting[];
  keyTopics: string[];
  hidden: boolean;
  excludedFromReview: boolean;
  notes: string;
}

export interface AppState {
  version: number;
  subjects: Subject[];
  chapters: Chapter[];
  courses: Course[];
  availability: DailyAvailability[];
  /** 默认每日可用时间（小时），默认为 5 */
  defaultDailyHours: number;
  tasks: ScheduleTask[];
  reviews: ReviewLog[];
}
