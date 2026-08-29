import { describe, expect, it } from 'vitest';
import { normalizeState } from './storage';

describe('v3 数据迁移', () => {
  it('保留课程和知识点，移除课程表与任务数据', () => {
    const state = normalizeState({
      version: 3,
      userName: '小刘',
      subjects: [
        { id: 'sub_1', name: '微积分', examDate: '2026-12-24', examTime: '09:00', notes: '' },
      ],
      chapters: [
        {
          id: 'ch_1',
          subjectId: 'sub_1',
          title: '二重积分',
          estimatedHours: 2,
          completedHours: 2,
          isImportant: true,
        },
        {
          id: 'ch_2',
          subjectId: 'sub_1',
          title: '三重积分',
          estimatedHours: 2,
          completedHours: 1,
          isImportant: false,
        },
      ],
      courses: [{ id: 'course_1', name: '旧课程表' }],
      tasks: [{ id: 'task_1' }],
    });

    expect(state).toMatchObject({ version: 4, userName: '小刘' });
    expect(state?.chapters).toEqual([
      { id: 'ch_1', subjectId: 'sub_1', title: '二重积分', completed: true, isImportant: true },
      { id: 'ch_2', subjectId: 'sub_1', title: '三重积分', completed: false, isImportant: false },
    ]);
    expect(state).not.toHaveProperty('courses');
    expect(state).not.toHaveProperty('tasks');
  });

  it('允许没有考试日期的课程', () => {
    const state = normalizeState({
      subjects: [{ id: 'sub_1', name: '大学物理 B' }],
      chapters: [],
    });
    expect(state?.subjects[0]).toMatchObject({ examDate: '', examTime: '' });
  });
});
