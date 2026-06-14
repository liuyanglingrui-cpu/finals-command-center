// 智能导入 —— 规则解析（无外部 AI，无 React/Next 依赖，可被 Vitest 直接测试）
//
// 对应需求里的 import_parser.py：
//   parseImportText / extractDate / extractExamTime / extractHours
//   inferDifficulty / inferImportance（外加 inferKind，桥接现有 review 调度）
import type { ChapterKind, Level } from './types';

export interface ParsedChapter {
  title: string;
  estimatedHours: number;
  difficulty: Level;
  isImportant: boolean;
  kind: ChapterKind;
}

export interface ParsedSubject {
  name: string;
  examDate: string | null; // YYYY-MM-DD，无法识别时为 null（提示用户补充）
  examTime: string; // HH:mm
  chapters: ParsedChapter[];
}

// 难度自动判高的关键词
const HIGH_DIFFICULTY_KEYWORDS = [
  '曲线积分', '曲面积分', '特征值', '相似', '正交', '二次型',
  'pKa', '机理', '证明', '级数', '傅里叶', '微分方程',
];
// 重点关键词
const IMPORTANT_KEYWORDS = ['重点', '重要', '必考', '错题', '模拟卷', '公式', '真题'];
// 复盘/卷子类（归为 review，调度时回填到考前）
const REVIEW_KEYWORDS = ['错题', '模拟卷', '模拟', '真题', '复盘', '复习', '套卷'];

/** 从一行中提取小时数：2h / 1.5h / 2小时 / 3时 */
export function extractHours(line: string): number | null {
  const m = line.match(/(\d+(?:\.\d+)?)\s*(?:小时|时|h|H)/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return Number.isFinite(n) ? n : null;
}

function buildDate(y: number, mo: number, d: number): string | null {
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** 提取考试日期，支持 2026-06-24 / 6月24日 / 6.24 / 06-24；无年份用当前年 */
export function extractDate(line: string): string | null {
  const year = new Date().getFullYear();

  // 1) 完整带年：2026-06-24 / 2026.6.24 / 2026/6/24
  let m = line.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return buildDate(Number(m[1]), Number(m[2]), Number(m[3]));

  // 2) 中文：6月24日 / 6月24
  m = line.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日?/);
  if (m) return buildDate(year, Number(m[1]), Number(m[2]));

  // 3) 简写：6.24 / 06-24 / 6/24（前后不接数字，避免误吃 15.1 这类章节号）
  m = line.match(/(?<!\d)(\d{1,2})[-/.](\d{1,2})(?!\d)/);
  if (m) return buildDate(year, Number(m[1]), Number(m[2]));

  return null;
}

/** 提取考试时间：9:00/14:00 原样；上午/下午/晚上/中午 映射；默认 09:00 */
export function extractExamTime(line: string): string {
  const m = line.match(/(\d{1,2}):(\d{2})/);
  if (m) {
    const h = Math.min(23, Number(m[1]));
    return `${String(h).padStart(2, '0')}:${m[2]}`;
  }
  if (line.includes('上午') || line.includes('早上') || line.includes('早晨')) return '09:00';
  if (line.includes('中午')) return '12:00';
  if (line.includes('下午')) return '14:00';
  if (line.includes('晚上') || line.includes('晚')) return '19:00';
  return '09:00';
}

/** 难度推断：命中高难度关键词 → high，否则默认 mid */
export function inferDifficulty(title: string): Level {
  return HIGH_DIFFICULTY_KEYWORDS.some((k) => title.includes(k)) ? 'high' : 'mid';
}

/** 重点推断 */
export function inferImportance(title: string): boolean {
  return IMPORTANT_KEYWORDS.some((k) => title.includes(k));
}

/** 类型推断：复盘/错题/模拟卷/真题 → review，否则 study */
export function inferKind(title: string): ChapterKind {
  return REVIEW_KEYWORDS.some((k) => title.includes(k)) ? 'review' : 'study';
}

/** 清洗章节标题：去掉时长 token 与纯标记词（重点/重要/必考），保留 错题/模拟卷 等名称 */
function cleanChapterTitle(line: string): string {
  return line
    .replace(/(\d+(?:\.\d+)?)\s*(?:小时|时|h|H)/g, ' ')
    .replace(/重点|重要|必考/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 清洗科目名：去掉日期、时间、上午/下午/晚上、「考试」 */
function cleanSubjectName(line: string): string {
  return line
    .replace(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/g, ' ')
    .replace(/(\d{1,2})\s*月\s*(\d{1,2})\s*日?/g, ' ')
    .replace(/(?<!\d)(\d{1,2})[-/.](\d{1,2})(?!\d)/g, ' ')
    .replace(/(\d{1,2}):(\d{2})/g, ' ')
    .replace(/上午|下午|晚上|中午|早上|早晨|晚/g, ' ')
    .replace(/考试/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 解析整段文本为科目列表。
 * 分类：含「考试」→ 科目行；否则含 h/小时/时 → 章节行（归属最近科目）；
 *       否则含日期 → 科目行；都没有 → 新科目（examDate=null）。
 */
export function parseImportText(text: string): ParsedSubject[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const subjects: ParsedSubject[] = [];
  let current: ParsedSubject | null = null;

  for (const line of lines) {
    const hasExam = line.includes('考试');
    const hours = extractHours(line);
    const isChapter = !hasExam && hours !== null;

    if (isChapter) {
      if (!current) {
        current = { name: '未命名科目', examDate: null, examTime: '09:00', chapters: [] };
        subjects.push(current);
      }
      current.chapters.push({
        title: cleanChapterTitle(line),
        estimatedHours: hours ?? 1,
        difficulty: inferDifficulty(line),
        isImportant: inferImportance(line),
        kind: inferKind(line),
      });
    } else {
      const name = cleanSubjectName(line);
      current = {
        name: name || '未命名科目',
        examDate: extractDate(line),
        examTime: extractExamTime(line),
        chapters: [],
      };
      subjects.push(current);
    }
  }

  return subjects;
}
