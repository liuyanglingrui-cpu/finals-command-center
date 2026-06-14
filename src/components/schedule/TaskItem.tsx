import { Check, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatHours } from '@/lib/date';
import type { ScheduleTask } from '@/lib/types';

export function TaskItem({
  task,
  subjectName,
  onToggle,
}: {
  task: ScheduleTask;
  subjectName: string;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(task.id)}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
        task.completed
          ? 'border-border/60 bg-card2/30'
          : 'border-border bg-card2/60 hover:border-primary/40',
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
          task.completed
            ? 'border-success bg-success text-bg'
            : 'border-muted/50 group-hover:border-primary',
        )}
      >
        {task.completed ? <Check size={14} strokeWidth={3} /> : null}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-xs text-muted">{subjectName}</span>
          {task.shortfall ? <TriangleAlert size={12} className="shrink-0 text-danger" /> : null}
        </span>
        <span className={cn('block truncate text-sm', task.completed ? 'text-muted line-through' : 'text-text')}>
          {task.title}
        </span>
      </span>

      <span className={cn('shrink-0 text-xs font-medium', task.shortfall ? 'text-danger' : 'text-muted')}>
        {formatHours(task.hours)}
      </span>
    </button>
  );
}
