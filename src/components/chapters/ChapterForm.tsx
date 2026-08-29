'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Field, Input } from '../ui/form';
import { cn } from '@/lib/cn';
import type { KnowledgePoint } from '@/lib/types';

type Data = Omit<KnowledgePoint, 'id' | 'completed'>;

export function ChapterForm({
  subjectId,
  initial,
  onSubmit,
  onCancel,
}: {
  subjectId: string;
  initial?: KnowledgePoint;
  onSubmit: (data: Data) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [isImportant, setIsImportant] = useState(initial?.isImportant ?? false);

  return (
    <div className="space-y-4">
      <Field label="知识点名称">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="如 15.1 二重积分" autoFocus />
      </Field>
      <button
        type="button"
        onClick={() => setIsImportant((value) => !value)}
        className={cn(
          'flex min-h-11 w-full items-center justify-between rounded-[3px] border px-3 text-sm',
          isImportant ? 'border-white bg-white text-black' : 'border-border bg-card2 text-muted',
        )}
      >
        <span className="flex items-center gap-2"><Star size={15} fill={isImportant ? 'currentColor' : 'none'} />标记为重点</span>
        <span className="text-xs">{isImportant ? '已标记' : '未标记'}</span>
      </button>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>取消</Button>
        <Button
          disabled={!title.trim()}
          onClick={() => title.trim() && onSubmit({ subjectId, title: title.trim(), isImportant })}
        >
          保存
        </Button>
      </div>
    </div>
  );
}
