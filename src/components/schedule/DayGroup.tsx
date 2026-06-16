import { TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatCN, formatHours, weekdayCN } from '@/lib/date';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { TaskItem } from './TaskItem';
import type { ScheduleTask } from '@/lib/types';

export function DayGroup({
  date,
  tasks,
  capacity,
  isToday,
  getSubjectName,
  onToggle,
}: {
  date: string;
  tasks: ScheduleTask[];
  capacity: number;
  isToday: boolean;
  getSubjectName: (id: string) => string;
  onToggle: (id: string) => void;
}) {
  const planned = tasks.reduce((s, t) => s + t.hours, 0);
  const over = planned > capacity + 0.01;
  const sorted = [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed));

  return (
    <div className="rounded-lg border border-white/5 bg-card/90 p-4 shadow-sm shadow-black/25">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text">{formatCN(date)}</span>
          <span className="text-xs text-muted">{weekdayCN(date)}</span>
          {isToday ? (
            <Badge className="border-primary/30 bg-primary/15 text-primary">今天</Badge>
          ) : null}
        </div>
        <span className={cn('text-xs font-medium', over ? 'text-danger' : 'text-muted')}>
          {formatHours(planned)} / {formatHours(capacity)}
        </span>
      </div>

      <ProgressBar
        value={capacity > 0 ? planned / capacity : planned > 0 ? 1 : 0}
        color={over ? 'bg-danger' : 'bg-gradient-to-r from-primary to-accent'}
        className="mb-3"
      />

      <div className="space-y-2">
        {sorted.map((t) => (
          <TaskItem key={t.id} task={t} subjectName={getSubjectName(t.subjectId)} onToggle={onToggle} />
        ))}
      </div>

      {over ? (
        <p className="mt-2 flex items-center gap-1 text-xs text-danger">
          <TriangleAlert size={12} /> 当天任务超出可用时间，建议提高可用时长或前移任务
        </p>
      ) : null}
    </div>
  );
}
