'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AppState, KnowledgePoint, Subject } from './types';
import { buildSeedState, emptyState } from './seed';
import { clearState, loadState, saveState } from './storage';
import { uid } from './id';

type NewSubject = Omit<Subject, 'id'>;
type NewPoint = Omit<KnowledgePoint, 'id' | 'completed'>;
type ImportPoint = Omit<KnowledgePoint, 'id' | 'subjectId' | 'completed'>;

export interface ImportItem {
  mergeIntoId: string | null;
  subject: NewSubject;
  chapters: ImportPoint[];
}

interface StoreValue {
  state: AppState;
  hydrated: boolean;
  addSubject: (data: NewSubject) => string;
  updateSubject: (id: string, patch: Partial<NewSubject>) => void;
  deleteSubject: (id: string) => void;
  addChapter: (data: NewPoint) => string;
  updateChapter: (id: string, patch: Partial<NewPoint>) => void;
  deleteChapter: (id: string) => void;
  toggleChapter: (id: string) => void;
  importSubjects: (items: ImportItem[]) => void;
  setUserName: (name: string) => void;
  resetToSample: () => void;
  clearAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => emptyState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    // The first client render must match SSR before localStorage is read.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loaded ?? buildSeedState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const addSubject = useCallback((data: NewSubject) => {
    const id = uid('sub');
    setState((prev) => ({ ...prev, subjects: [...prev.subjects, { ...data, id }] }));
    return id;
  }, []);

  const updateSubject = useCallback((id: string, patch: Partial<NewSubject>) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject) => (subject.id === id ? { ...subject, ...patch } : subject)),
    }));
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((subject) => subject.id !== id),
      chapters: prev.chapters.filter((point) => point.subjectId !== id),
    }));
  }, []);

  const addChapter = useCallback((data: NewPoint) => {
    const id = uid('point');
    setState((prev) => ({ ...prev, chapters: [...prev.chapters, { ...data, id, completed: false }] }));
    return id;
  }, []);

  const updateChapter = useCallback((id: string, patch: Partial<NewPoint>) => {
    setState((prev) => ({
      ...prev,
      chapters: prev.chapters.map((point) => (point.id === id ? { ...point, ...patch } : point)),
    }));
  }, []);

  const deleteChapter = useCallback((id: string) => {
    setState((prev) => ({ ...prev, chapters: prev.chapters.filter((point) => point.id !== id) }));
  }, []);

  const toggleChapter = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      chapters: prev.chapters.map((point) =>
        point.id === id ? { ...point, completed: !point.completed } : point,
      ),
    }));
  }, []);

  const importSubjects = useCallback((items: ImportItem[]) => {
    setState((prev) => {
      const subjects = [...prev.subjects];
      const chapters = [...prev.chapters];
      for (const item of items) {
        const subjectId = item.mergeIntoId ?? uid('sub');
        if (!item.mergeIntoId) subjects.push({ ...item.subject, id: subjectId });
        for (const chapter of item.chapters) {
          const duplicate = chapters.some(
            (existing) =>
              existing.subjectId === subjectId &&
              existing.title.trim().toLowerCase() === chapter.title.trim().toLowerCase(),
          );
          if (!duplicate) chapters.push({ ...chapter, id: uid('point'), subjectId, completed: false });
        }
      }
      return { ...prev, subjects, chapters };
    });
  }, []);

  const setUserName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, userName: name.trim() }));
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
      toggleChapter,
      importSubjects,
      setUserName,
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
      toggleChapter,
      importSubjects,
      setUserName,
      resetToSample,
      clearAll,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within <StoreProvider>');
  return context;
}
