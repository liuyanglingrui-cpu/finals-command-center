'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AppState, Chapter, ReviewLog, Subject } from './types';
import { buildSeedState, emptyState } from './seed';
import { generateSchedule } from './schedule';
import { clearState, loadState, saveState } from './storage';
import { round1 } from './selectors';
import { uid } from './id';

/** 数据变更后基于最新 state 重新排程（保留已完成任务） */
function withSchedule(s: AppState): AppState {
  return { ...s, tasks: generateSchedule(s) };
}

type NewSubject = Omit<Subject, 'id'>;
type NewChapter = Omit<Chapter, 'id' | 'completedHours'>;
type NewReview = Omit<ReviewLog, 'id'>;

/** 智能导入的一项：合并到已有科目（mergeIntoId）或新建科目（subject），并追加章节 */
type ImportChapter = Omit<Chapter, 'id' | 'completedHours' | 'subjectId'>;
export interface ImportItem {
  mergeIntoId: string | null;
  subject: NewSubject;
  chapters: ImportChapter[];
}

interface StoreValue {
  state: AppState;
  hydrated: boolean;

  addSubject: (data: NewSubject) => string;
  updateSubject: (id: string, patch: Partial<NewSubject>) => void;
  deleteSubject: (id: string) => void;

  addChapter: (data: NewChapter) => string;
  updateChapter: (id: string, patch: Partial<NewChapter>) => void;
  deleteChapter: (id: string) => void;

  setAvailability: (date: string, hours: number) => void;
  clearAvailability: (date: string) => void;
  setDefaultHours: (hours: number) => void;

  regenerate: () => void;
  toggleTask: (taskId: string) => void;

  upsertReview: (data: NewReview) => void;

  importSubjects: (items: ImportItem[]) => void;

  resetToSample: () => void;
  clearAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // 初始用空 state，保证 SSR 与首次客户端渲染一致；mount 后再载入/注入
  const [state, setState] = useState<AppState>(() => emptyState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    // The first render must match SSR; localStorage is only available after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loaded ?? buildSeedState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const addSubject = useCallback((data: NewSubject) => {
    const id = uid('sub');
    setState((prev) => withSchedule({ ...prev, subjects: [...prev.subjects, { ...data, id }] }));
    return id;
  }, []);

  const updateSubject = useCallback((id: string, patch: Partial<NewSubject>) => {
    setState((prev) =>
      withSchedule({
        ...prev,
        subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      }),
    );
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setState((prev) =>
      withSchedule({
        ...prev,
        subjects: prev.subjects.filter((s) => s.id !== id),
        chapters: prev.chapters.filter((c) => c.subjectId !== id),
        tasks: prev.tasks.filter((t) => t.subjectId !== id),
      }),
    );
  }, []);

  const addChapter = useCallback((data: NewChapter) => {
    const id = uid('ch');
    setState((prev) =>
      withSchedule({ ...prev, chapters: [...prev.chapters, { ...data, id, completedHours: 0 }] }),
    );
    return id;
  }, []);

  const updateChapter = useCallback((id: string, patch: Partial<NewChapter>) => {
    setState((prev) =>
      withSchedule({
        ...prev,
        chapters: prev.chapters.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }),
    );
  }, []);

  const deleteChapter = useCallback((id: string) => {
    setState((prev) =>
      withSchedule({
        ...prev,
        chapters: prev.chapters.filter((c) => c.id !== id),
        tasks: prev.tasks.filter((t) => t.chapterId !== id),
      }),
    );
  }, []);

  const setAvailability = useCallback((date: string, hours: number) => {
    setState((prev) => {
      const availability = [
        ...prev.availability.filter((a) => a.date !== date),
        { date, availableHours: hours },
      ].sort((a, b) => a.date.localeCompare(b.date));
      return withSchedule({ ...prev, availability });
    });
  }, []);

  const clearAvailability = useCallback((date: string) => {
    setState((prev) =>
      withSchedule({ ...prev, availability: prev.availability.filter((a) => a.date !== date) }),
    );
  }, []);

  const setDefaultHours = useCallback((hours: number) => {
    setState((prev) => withSchedule({ ...prev, defaultDailyHours: hours }));
  }, []);

  const regenerate = useCallback(() => {
    setState((prev) => withSchedule(prev));
  }, []);

  // 勾选任务：仅更新完成状态与对应章节 completedHours，不重排（避免计划在脚下被打乱）
  const toggleTask = useCallback((taskId: string) => {
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task) return prev;
      const nowCompleted = !task.completed;
      const delta = nowCompleted ? task.hours : -task.hours;
      return {
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, completed: nowCompleted } : t)),
        chapters: prev.chapters.map((c) =>
          c.id === task.chapterId
            ? { ...c, completedHours: Math.max(0, round1(c.completedHours + delta)) }
            : c,
        ),
      };
    });
  }, []);

  const upsertReview = useCallback((data: NewReview) => {
    setState((prev) => {
      const exists = prev.reviews.some((r) => r.date === data.date);
      return {
        ...prev,
        reviews: exists
          ? prev.reviews.map((r) => (r.date === data.date ? { ...r, ...data } : r))
          : [...prev.reviews, { ...data, id: uid('rev') }],
      };
    });
  }, []);

  // 批量导入：按选择合并到已有科目或新建科目，结尾一次性重排
  const importSubjects = useCallback((items: ImportItem[]) => {
    setState((prev) => {
      const subjects = [...prev.subjects];
      const chapters = [...prev.chapters];
      for (const item of items) {
        let subjectId: string;
        if (item.mergeIntoId) {
          subjectId = item.mergeIntoId;
        } else {
          subjectId = uid('sub');
          subjects.push({ ...item.subject, id: subjectId });
        }
        for (const ch of item.chapters) {
          chapters.push({ ...ch, id: uid('ch'), subjectId, completedHours: 0 });
        }
      }
      return withSchedule({ ...prev, subjects, chapters });
    });
  }, []);

  const resetToSample = useCallback(() => setState(buildSeedState()), []);
  const clearAll = useCallback(() => {
    clearState();
    setState(emptyState());
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      hydrated,
      addSubject,
      updateSubject,
      deleteSubject,
      addChapter,
      updateChapter,
      deleteChapter,
      setAvailability,
      clearAvailability,
      setDefaultHours,
      regenerate,
      toggleTask,
      upsertReview,
      importSubjects,
      resetToSample,
      clearAll,
    }),
    [
      state,
      hydrated,
      addSubject,
      updateSubject,
      deleteSubject,
      addChapter,
      updateChapter,
      deleteChapter,
      setAvailability,
      clearAvailability,
      setDefaultHours,
      regenerate,
      toggleTask,
      upsertReview,
      importSubjects,
      resetToSample,
      clearAll,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within <StoreProvider>');
  return ctx;
}
