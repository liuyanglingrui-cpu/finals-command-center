'use client';

import { useState } from 'react';
import { Plus, Star, Trash2, TriangleAlert } from 'lucide-react';
import { useStore, type ImportItem } from '@/lib/store';
import type { ParsedSubject } from '@/lib/importParser';
import type { ChapterKind, Level } from '@/lib/types';
import { KIND_LABEL, LEVELS, LEVEL_LABEL } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { uid } from '@/lib/id';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/form';

interface DraftChapter {
  key: string;
  title: string;
  estimatedHours: number;
  difficulty: Level;
  isImportant: boolean;
  kind: ChapterKind;
}
interface DraftSubject {
  key: string;
  name: string;
  examDate: string; // '' = 缺失
  examTime: string;
  existingId: string | null; // 同名已有科目 id
  mergeIntoId: string | null; // null = 新建；非空 = 合并到该 id
  chapters: DraftChapter[];
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
    parsed.map((s) => {
      const existing = state.subjects.find((x) => x.name.trim() === s.name.trim());
      return {
        key: uid('d'),
        name: s.name,
        examDate: s.examDate ?? '',
        examTime: s.examTime,
        existingId: existing?.id ?? null,
        mergeIntoId: existing?.id ?? null, // 默认合并
        chapters: s.chapters.map((c) => ({ key: uid('dc'), ...c })),
      };
    }),
  );

  function patchSubject(i: number, patch: Partial<DraftSubject>) {
    setDraft((d) => d.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function removeSubject(i: number) {
    setDraft((d) => d.filter((_, idx) => idx !== i));
  }
  function patchChapter(i: number, j: number, patch: Partial<DraftChapter>) {
    setDraft((d) =>
      d.map((s, idx) =>
        idx === i ? { ...s, chapters: s.chapters.map((c, k) => (k === j ? { ...c, ...patch } : c)) } : s,
      ),
    );
  }
  function removeChapter(i: number, j: number) {
    setDraft((d) =>
      d.map((s, idx) => (idx === i ? { ...s, chapters: s.chapters.filter((_, k) => k !== j) } : s)),
    );
  }
  function addChapter(i: number) {
    setDraft((d) =>
      d.map((s, idx) =>
        idx === i
          ? {
              ...s,
              chapters: [
                ...s.chapters,
                { key: uid('dc'), title: '', estimatedHours: 2, difficulty: 'mid', isImportant: false, kind: 'study' },
              ],
            }
          : s,
      ),
    );
  }

  const totalChapters = draft.reduce((n, s) => n + s.chapters.length, 0);
  const missingDate = draft.some((s) => !s.examDate);
  const canImport =
    draft.length > 0 && draft.every((s) => s.name.trim() && s.examDate) && totalChapters > 0;

  function confirmImport() {
    if (!canImport) return;
    const items: ImportItem[] = draft.map((s) => ({
      mergeIntoId: s.mergeIntoId,
      subject: {
        name: s.name.trim(),
        examDate: s.examDate,
        examTime: s.examTime || '09:00',
        difficulty: 'mid',
        priority: 'mid',
        notes: '',
      },
      chapters: s.chapters
        .filter((c) => c.title.trim())
        .map((c) => ({
          title: c.title.trim(),
          estimatedHours: c.estimatedHours > 0 ? c.estimatedHours : 1,
          difficulty: c.difficulty,
          isImportant: c.isImportant,
          kind: c.kind,
        })),
    }));
    importSubjects(items);
    onImported();
  }

  if (draft.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted">没有可导入的内容，请返回重新解析。</p>
        <div className="mt-4">
          <Button variant="secondary" onClick={onCancel}>
            返回
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted">
          解析出 <span className="text-text">{draft.length}</span> 门科目、
          <span className="text-text">{totalChapters}</span> 个章节，可在下方修改后导入。
        </p>
      </div>

      {missingDate ? (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          <TriangleAlert size={14} className="mt-0.5 shrink-0" />
          <span>有科目缺少考试日期，请补充后才能导入。</span>
        </div>
      ) : null}

      <div className="space-y-4">
        {draft.map((s, i) => (
          <Card key={s.key} className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                value={s.name}
                onChange={(e) => patchSubject(i, { name: e.target.value })}
                placeholder="科目名称"
                className="flex-1 font-medium"
              />
              <button
                onClick={() => removeSubject(i)}
                aria-label="删除科目"
                className="rounded-md p-2 text-muted transition-colors hover:bg-danger/15 hover:text-danger"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {s.existingId ? (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card2/50 px-3 py-2 text-xs">
                <span className="text-muted">已存在同名科目：</span>
                <button
                  onClick={() => patchSubject(i, { mergeIntoId: s.existingId })}
                  className={cn(
                    'rounded-md px-2 py-1 transition-colors',
                    s.mergeIntoId ? 'bg-primary/15 text-primary' : 'text-muted hover:text-text',
                  )}
                >
                  合并到已有
                </button>
                <button
                  onClick={() => patchSubject(i, { mergeIntoId: null })}
                  className={cn(
                    'rounded-md px-2 py-1 transition-colors',
                    s.mergeIntoId === null ? 'bg-primary/15 text-primary' : 'text-muted hover:text-text',
                  )}
                >
                  新建科目
                </button>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="mb-1 block text-xs text-muted">考试日期</span>
                <Input
                  type="date"
                  value={s.examDate}
                  onChange={(e) => patchSubject(i, { examDate: e.target.value })}
                  className={s.examDate ? '' : 'border-warning/60'}
                />
              </div>
              <div>
                <span className="mb-1 block text-xs text-muted">考试时间</span>
                <Input
                  type="time"
                  value={s.examTime}
                  onChange={(e) => patchSubject(i, { examTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              {s.chapters.map((c, j) => (
                <div key={c.key} className="rounded-lg border border-border bg-card2/40 p-2.5">
                  <div className="flex items-center gap-2">
                    <Input
                      value={c.title}
                      onChange={(e) => patchChapter(i, j, { title: e.target.value })}
                      placeholder="章节名称"
                      className="flex-1"
                    />
                    <button
                      onClick={() => removeChapter(i, j)}
                      aria-label="删除章节"
                      className="rounded-md p-1.5 text-muted transition-colors hover:bg-danger/15 hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <div className="relative w-20">
                      <Input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={String(c.estimatedHours)}
                        onChange={(e) => patchChapter(i, j, { estimatedHours: Number(e.target.value) })}
                        className="pr-6"
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted">
                        h
                      </span>
                    </div>
                    <div className="w-24">
                      <Select
                        value={c.difficulty}
                        onChange={(e) => patchChapter(i, j, { difficulty: e.target.value as Level })}
                      >
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>
                            难度 {LEVEL_LABEL[l]}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="w-36">
                      <Select
                        value={c.kind}
                        onChange={(e) => patchChapter(i, j, { kind: e.target.value as ChapterKind })}
                      >
                        <option value="study">{KIND_LABEL.study}</option>
                        <option value="review">{KIND_LABEL.review}</option>
                      </Select>
                    </div>
                    <button
                      onClick={() => patchChapter(i, j, { isImportant: !c.isImportant })}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs transition-colors',
                        c.isImportant
                          ? 'border-warning/40 bg-warning/10 text-warning'
                          : 'border-border text-muted hover:text-text',
                      )}
                    >
                      <Star size={13} className={c.isImportant ? 'fill-warning' : ''} />
                      重点
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => addChapter(i)}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Plus size={13} /> 添加章节
              </button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          返回修改文本
        </Button>
        <Button onClick={confirmImport} disabled={!canImport}>
          确认导入
        </Button>
      </div>
    </div>
  );
}
