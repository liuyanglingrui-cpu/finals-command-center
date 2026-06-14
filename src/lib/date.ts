// 日期工具 —— 全部以本地时区的 'YYYY-MM-DD' 字符串为基准，避免 UTC 解析造成的日期偏移

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

/** 把 Date 转为本地 YYYY-MM-DD */
export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** YYYY-MM-DD -> 本地午夜 Date */
export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 今天（本地）YYYY-MM-DD */
export function todayStr(): string {
  return toDateStr(new Date());
}

/** 在某日期上加 n 天，返回 YYYY-MM-DD */
export function addDays(s: string, n: number): string {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}

/** b - a 的整天数（可为负） */
export function daysBetween(a: string, b: string): number {
  const ms = parseDate(b).getTime() - parseDate(a).getTime();
  return Math.round(ms / 86400000);
}

/** 从今天到目标日期还有几天（负数表示已过） */
export function daysUntil(s: string): number {
  return daysBetween(todayStr(), s);
}

/** 闭区间内的所有日期 [start..end] */
export function dateRange(start: string, end: string): string[] {
  const out: string[] = [];
  if (daysBetween(start, end) < 0) return out;
  let cur = start;
  while (daysBetween(cur, end) >= 0) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

/** "6月16日" */
export function formatCN(s: string): string {
  const d = parseDate(s);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

/** "周一" */
export function weekdayCN(s: string): string {
  return WEEKDAYS[parseDate(s).getDay()];
}

/** "2026年6月13日 周五" */
export function formatFull(s: string): string {
  const d = parseDate(s);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[d.getDay()]}`;
}

/** 小时数美化："2h" / "1.5h" */
export function formatHours(h: number): string {
  const r = Math.round(h * 10) / 10;
  return `${r}h`;
}
