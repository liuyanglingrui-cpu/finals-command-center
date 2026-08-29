'use client';

import { useState } from 'react';
import { Plus, Star, Trash2 } from 'lucide-react';
import { useStore, type ImportItem } from '@/lib/store';
import type { ParsedSubject } from '@/lib/importParser';
import { uid } from '@/lib/id';
import { cn } from '@/lib/cn';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/form';

interface DraftPoint {
  key: string;
  title: string;
  isImportant: boolean;
}

interface DraftSubject {
  key: string;
  name: string;
  examDate: string;
  examTime: string;
  existingId: string | null;
  mergeIntoId: string | null;
  chapters: DraftPoint[];
}

export function ImportPreview({
  parsed,
  onCancel,
  onImported,
}: {
  parsed: ParsedSubject[];
  onCancel: () => void;
  onImported: () => void;
}) {
  const { state, importSubjects } = useStore();
  const [draft, setDraft] = useState<DraftSubject[]>(() =>
    parsed.map((subject) => {
      const existing = state.subjects.find(
        (item) => item.name.trim().toLowerCase() === subject.name.trim().toLowerCase(),
      );
      return {
        key: uid('draft'),
        name: subject.name,
        examDate: subject.examDate ?? '',
        examTime: subject.examTime,
        existingId: existing?.id ?? null,
        mergeIntoId: existing?.id ?? null,
        chapters: subject.chapters.map((point) => ({ ...point, key: uid('point-draft') })),
      };
    }),
  );

  const patchSubject = (index: number, patch: Partial<DraftSubject>) =>
    setDraft((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  const patchPoint = (subjectIndex: number, pointIndex: number, patch: Partial<DraftPoint>) =>
    setDraft((items) =>
      items.map((item, itemIndex) =>
        itemIndex === subjectIndex
          ? {
              ...item,
              chapters: item.chapters.map((point, index) =>
                index === pointIndex ? { ...point, ...patch } : point,
              ),
            }
          : item,
      ),
    );

  const validPoints = draft.reduce(
    (total, subject) => total + subject.chapters.filter((point) => point.title.trim()).length,
    0,
  );
  const canImport = draft.length > 0 && draft.every((subject) => subject.name.trim()) && validPoints > 0;

  function confirmImport() {
    if (!canImport) return;
    const items: ImportItem[] = draft.map((subject) => ({
      mergeIntoId: subject.mergeIntoId,
      subject: {
        name: subject.name.trim(),
        examDate: subject.examDate,
        examTime: subject.examDate ? subject.examTime || '09:00' : '',
        notes: '',
      },
      chapters: subject.chapters
        .filter((point) => point.title.trim())
        .map((point) => ({ title: point.title.trim(), isImportant: point.isImportant })),
    }));
    importSubjects(items);
    onImported();
  }

  if (draft.length === 0) {
    return <Card><p className="text-sm text-muted">没有识别到可以导入的内容。</p><Button className="mt-4" variant="secondary" onClick={onCancel}>返回</Button></Card>;
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted">识别到 {draft.length} 门课程、{validPoints} 个知识点。考试日期可以留空。</p>
      <div className="space-y-4">
        {draft.map((subject, subjectIndex) => (
          <Card key={subject.key} className="p-0">
            <div className="space-y-3 border-b border-border p-4">
              <div className="flex items-center gap-2">
                <Input value={subject.name} onChange={(event) => patchSubject(subjectIndex, { name: event.target.value })} className="flex-1 font-semibold" />
                <button
                  onClick={() => setDraft((items) => items.filter((_, index) => index !== subjectIndex))}
                  aria-label="移除课程"
                  className="grid h-11 w-10 place-items-center text-muted hover:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {subject.existingId ? (
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => patchSubject(subjectIndex, { mergeIntoId: subject.existingId })}
                    className={cn('min-h-11 border px-3', subject.mergeIntoId ? 'border-white bg-white text-black' : 'border-border text-muted')}
                  >
                    合并已有课程
                  </button>
                  <button
                    onClick={() => patchSubject(subjectIndex, { mergeIntoId: null })}
                    className={cn('min-h-11 border px-3', subject.mergeIntoId === null ? 'border-white bg-white text-black' : 'border-border text-muted')}
                  >
                    新建课程
                  </button>
                </div>
              ) : null}
              {!subject.mergeIntoId ? (
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="mb-1 block text-xs text-muted">考试日期（可选）</span><Input type="date" value={subject.examDate} onChange={(event) => patchSubject(subjectIndex, { examDate: event.target.value })} /></div>
                  <div><span className="mb-1 block text-xs text-muted">考试时间</span><Input type="time" disabled={!subject.examDate} value={subject.examTime} onChange={(event) => patchSubject(subjectIndex, { examTime: event.target.value })} /></div>
                </div>
              ) : null}
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {subject.chapters.map((point, pointIndex) => (
                  <div key={point.key} className="flex items-center gap-2">
                    <Input value={point.title} onChange={(event) => patchPoint(subjectIndex, pointIndex, { title: event.target.value })} className="flex-1" />
                    <button
                      onClick={() => patchPoint(subjectIndex, pointIndex, { isImportant: !point.isImportant })}
                      aria-label="切换重点"
                      className={cn('grid h-11 w-10 place-items-center border', point.isImportant ? 'border-white bg-white text-black' : 'border-border text-muted')}
                    >
                      <Star size={15} fill={point.isImportant ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() =>
                        patchSubject(subjectIndex, {
                          chapters: subject.chapters.filter((_, index) => index !== pointIndex),
                        })
                      }
                      aria-label="移除知识点"
                      className="grid h-11 w-10 place-items-center text-muted hover:text-danger"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() =>
                  patchSubject(subjectIndex, {
                    chapters: [...subject.chapters, { key: uid('point-draft'), title: '', isImportant: false }],
                  })
                }
                className="mt-3 inline-flex min-h-11 items-center gap-1 text-xs text-text"
              >
                <Plus size={14} /> 添加知识点
              </button>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>返回文本</Button>
        <Button onClick={confirmImport} disabled={!canImport}>确认导入</Button>
      </div>
    </div>
  );
}
