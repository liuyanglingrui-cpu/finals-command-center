/** 学习作战室的本地数据结构。 */

export interface KnowledgePoint {
  id: string;
  subjectId: string;
  title: string;
  completed: boolean;
  isImportant: boolean;
}

export interface Subject {
  id: string;
  name: string;
  /** YYYY-MM-DD，空字符串表示考试时间尚未公布。 */
  examDate: string;
  /** HH:mm，仅在 examDate 存在时使用。 */
  examTime: string;
  notes: string;
}

export interface AppState {
  version: number;
  userName: string;
  subjects: Subject[];
  chapters: KnowledgePoint[];
}
