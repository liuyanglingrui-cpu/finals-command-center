import type { AppState, KnowledgePoint, Subject } from './types';
import { DEFAULT_USER_NAME, STATE_VERSION } from './constants';
import { addDays, todayStr } from './date';
import { uid } from './id';

export function buildSeedState(): AppState {
  const today = todayStr();
  const calculusId = uid('sub');
  const physicsId = uid('sub');
  const subjects: Subject[] = [
    {
      id: calculusId,
      name: '微积分（2）',
      examDate: addDays(today, 45),
      examTime: '09:00',
      notes: '考试日期可以随时修改',
    },
    {
      id: physicsId,
      name: '大学物理 B',
      examDate: '',
      examTime: '',
      notes: '考试时间尚未公布',
    },
  ];

  const point = (subjectId: string, title: string, isImportant = false, completed = false): KnowledgePoint => ({
    id: uid('point'),
    subjectId,
    title,
    completed,
    isImportant,
  });

  return {
    version: STATE_VERSION,
    userName: DEFAULT_USER_NAME,
    subjects,
    chapters: [
      point(calculusId, '15.1 二重积分', true, true),
      point(calculusId, '15.2 三重积分'),
      point(calculusId, '16.1 曲线积分', true),
      point(calculusId, '16.2 曲面积分', true),
      point(physicsId, '振动与波'),
      point(physicsId, '光学', true),
      point(physicsId, '电磁学基础'),
    ],
  };
}

export function emptyState(): AppState {
  return {
    version: STATE_VERSION,
    userName: DEFAULT_USER_NAME,
    subjects: [],
    chapters: [],
  };
}
