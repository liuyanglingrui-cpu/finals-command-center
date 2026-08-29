import { Check, Pencil, Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { KnowledgePoint } from '@/lib/types';

export function ChapterRow({
  chapter,
  onToggle,
  onEdit,
  onDelete,
}: {
  chapter: KnowledgePoint;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={cn('flex min-h-14 items-center border-b border-border', chapter.completed && 'opacity-55')}>
      <button
        onClick={onToggle}
        aria-label={chapter.completed ? '标记为未完成' : '标记为已完成'}
        className="mr-1 grid h-11 w-11 shrink-0 place-items-center"
      >
        <span
          className={cn(
            'grid h-7 w-7 place-items-center rounded-[2px] border',
            chapter.completed ? 'border-white bg-white text-black' : 'border-muted text-transparent',
          )}
        >
          <Check size={17} strokeWidth={3} />
        </span>
      </button>
      <button onClick={onToggle} className="min-w-0 flex-1 py-3 text-left">
        <span className={cn('text-sm font-medium text-text', chapter.completed && 'line-through')}>
          {chapter.title}
        </span>
        {chapter.isImportant ? (
          <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-warning">
            <Star size={11} fill="currentColor" />重点
          </span>
        ) : null}
      </button>
      <button onClick={onEdit} aria-label="编辑知识点" className="grid h-11 w-10 place-items-center text-muted hover:text-text">
        <Pencil size={15} />
      </button>
      <button onClick={onDelete} aria-label="删除知识点" className="grid h-11 w-10 place-items-center text-muted hover:text-danger">
        <Trash2 size={15} />
      </button>
    </div>
  );
}
