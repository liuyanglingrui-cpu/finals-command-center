// 纯数据常量（不含 React / 图标导入，可在任意环境引用）
import type { Level, ChapterStatus, ChapterKind } from './types';

export const STORAGE_KEY = 'fcc:data:v1';
export const STATE_VERSION = 1;
export const DEFAULT_DAILY_HOURS = 5;

export const LEVELS: Level[] = ['low', 'mid', 'high'];
export const LEVEL_LABEL: Record<Level, string> = { low: '低', mid: '中', high: '高' };
export const LEVEL_WEIGHT: Record<Level, number> = { low: 1, mid: 2, high: 3 };

export const STATUS_LABEL: Record<ChapterStatus, string> = {
  todo: '未开始',
  doing: '进行中',
  done: '已完成',
};

export const KIND_LABEL: Record<ChapterKind, string> = {
  study: '普通章节',
  review: '复盘 / 错题 / 模拟卷',
};

// Badge 配色（Tailwind 主题 token + 透明度修饰）—— 静态字符串，便于被 Tailwind 扫描
export const LEVEL_BADGE: Record<Level, string> = {
  low: 'bg-success/15 text-success border-success/30',
  mid: 'bg-warning/15 text-warning border-warning/30',
  high: 'bg-danger/15 text-danger border-danger/30',
};

export const STATUS_BADGE: Record<ChapterStatus, string> = {
  todo: 'bg-muted/15 text-muted border-muted/30',
  doing: 'bg-primary/15 text-primary border-primary/30',
  done: 'bg-success/15 text-success border-success/30',
};

// 压力指数阈值（剩余/可用 比值）
export const PRESSURE = {
  comfortable: 0.8, // <= 0.8 绿
  tight: 1.0, // 0.8~1.0 黄，>1.0 红
} as const;
