export interface ParsedChapter {
  title: string;
  isImportant: boolean;
}

export interface ParsedSubject {
  name: string;
  examDate: string | null;
  examTime: string;
  chapters: ParsedChapter[];
}

function buildDate(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function extractDate(line: string): string | null {
  const year = new Date().getFullYear();
  let match = line.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (match) return buildDate(Number(match[1]), Number(match[2]), Number(match[3]));
  match = line.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日?/);
  if (match) return buildDate(year, Number(match[1]), Number(match[2]));
  match = line.match(/(?<!\d)(\d{1,2})[-/.](\d{1,2})(?!\d)/);
  return match ? buildDate(year, Number(match[1]), Number(match[2])) : null;
}

export function extractExamTime(line: string): string {
  const match = line.match(/(\d{1,2}):(\d{2})/);
  if (match) return `${String(Math.min(23, Number(match[1]))).padStart(2, '0')}:${match[2]}`;
  if (/下午/.test(line)) return '14:00';
  if (/晚上|晚间/.test(line)) return '19:00';
  if (/中午/.test(line)) return '12:00';
  return '09:00';
}

function cleanSubjectName(line: string): string {
  return line
    .replace(/^课程\s*[：:]/, '')
    .replace(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/g, ' ')
    .replace(/(\d{1,2})\s*月\s*(\d{1,2})\s*日?/g, ' ')
    .replace(/(?<!\d)(\d{1,2})[-/.](\d{1,2})(?!\d)/g, ' ')
    .replace(/(\d{1,2}):(\d{2})/g, ' ')
    .replace(/考试日期\s*[：:]?|考试时间\s*[：:]?|考试|上午|下午|晚上|晚间|中午/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanChapterTitle(line: string): string {
  return line
    .replace(/^[-*•·]\s*/, '')
    .replace(/^\d+[、)]\s*/, '')
    .replace(/\s*(?:\d+(?:\.\d+)?)\s*(?:小时|时|h)\b/gi, ' ')
    .replace(/\s*(?:重点|重要|必考)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function addPoint(subject: ParsedSubject, raw: string, forceImportant = false) {
  const title = cleanChapterTitle(raw);
  if (!title) return;
  subject.chapters.push({
    title,
    isImportant: forceImportant || /重点|重要|必考/.test(raw),
  });
}

export function parseImportText(text: string): ParsedSubject[] {
  const subjects: ParsedSubject[] = [];
  let current: ParsedSubject | null = null;
  let atBlockStart = true;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      atBlockStart = true;
      continue;
    }

    const date = extractDate(line);
    const explicitSubject = /^课程\s*[：:]/.test(line);
    const examLine = /考试/.test(line) || date !== null;
    if (current && /^考试(?:日期|时间)?\s*[：:]?/.test(line)) {
      current.examDate = date;
      current.examTime = date ? extractExamTime(line) : current.examTime;
      atBlockStart = false;
      continue;
    }
    if (!current || atBlockStart || explicitSubject || examLine) {
      current = {
        name: cleanSubjectName(line) || '未命名课程',
        examDate: date,
        examTime: date ? extractExamTime(line) : '',
        chapters: [],
      };
      subjects.push(current);
      atBlockStart = false;
      continue;
    }

    const topicMatch = line.match(/^(?:重点)?(?:章节|知识点)\s*[：:]\s*(.+)$/);
    if (topicMatch) {
      const important = line.startsWith('重点');
      for (const topic of topicMatch[1].split(/\s*[\/／、，,；;]\s*/)) addPoint(current, topic, important);
    } else {
      addPoint(current, line);
    }
    atBlockStart = false;
  }

  return subjects.filter((subject) => subject.name || subject.chapters.length > 0);
}
