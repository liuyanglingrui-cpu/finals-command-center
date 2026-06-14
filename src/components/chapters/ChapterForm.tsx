'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Field, Input, Select } from '../ui/form';
import { cn } from '@/lib/cn';
import { KIND_LABEL, LEVELS, LEVEL_LABEL } from '@/lib/constants';
import type { Chapter, ChapterKind, Level } from '@/lib/types';

type Data = Omit<Chapter, 'id' | 'completedHours'>;

export function ChapterForm({
  subjectId,
  initial,
  onSubmit,
  onCancel,
}: {
  subjectId: string;
  initial?: Chapter;
  onSubmit: (data: Data) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [hours, setHours] = useState(String(initial?.estimatedHours ?? 2));
  const [difficulty, setDifficulty] = useState<Level>(initial?.difficulty ?? 'mid');
  const [kind, setKind] = useState<ChapterKind>(initial?.kind ?? 'study');
  const [isImportant, setIsImportant] = useState(initial?.isImportant ?? false);

  const hoursNum = Number(hours);
  const valid = title.trim().length > 0 && Number.isFinite(hoursNum) && hoursNum > 0;

  function submit() {
    if (!valid) return;
    onSubmit({
      subjectId,
      title: title.trim(),
      estimatedHours: Math.round(hoursNum * 10) / 10,
      difficulty,
      isImportant,
      kind,
    });
  }

  return (
    <div className="space-y-4">
      <Field label="章节名称">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="如 15.1 二重积分"
          autoFocus
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="预计时长（小时）">
          <Input type="number" min="0.5" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} />
        </Field>
        <Field label="难度">
          <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Level)}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {LEVEL_LABEL[l]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="类型">
        <Select value={kind} onChange={(e) => setKind(e.target.value as ChapterKind)}>
          <option value="study">{KIND_LABEL.study}</option>
          <option value="review">{KIND_LABEL.review}</option>
        </Select>
      </Field>

      <button
        type="button"
        onClick={() => setIsImportant((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors',
          isImportant
            ? 'border-warning/40 bg-warning/10 text-warning'
            : 'border-border bg-card2 text-muted hover:text-text',
        )}
      >
        <span className="flex items-center gap-2">
          <Star size={15} className={isImportant ? 'fill-warning' : ''} />
          标记为重点章节
        </span>
        <span className="text-xs">{isImportant ? '已标记' : '点击标记'}</span>
      </button>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={submit} disabled={!valid}>
          保存
        </Button>
      </div>
    </div>
  );
}
