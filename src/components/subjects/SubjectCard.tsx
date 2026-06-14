import Link from 'next/link';
import { ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Countdown } from '../ui/Countdown';
import { ProgressBar } from '../ui/ProgressBar';
import { LevelBadge } from '../Badges';
import { formatCN, formatHours } from '@/lib/date';
import type { Subject } from '@/lib/types';
import type { SubjectProgress } from '@/lib/selectors';

export function SubjectCard({
  subject,
  progress,
  onEdit,
  onDelete,
}: {
  subject: Subject;
  progress: SubjectProgress;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/subjects/${subject.id}`} className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-text hover:text-primary">{subject.name}</h3>
          <div className="mt-1 text-xs text-muted">
            {formatCN(subject.examDate)} {subject.examTime} 考试
          </div>
        </Link>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={onEdit}
            aria-label="编辑科目"
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-text"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDelete}
            aria-label="删除科目"
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-danger/15 hover:text-danger"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Countdown date={subject.examDate} />
        <LevelBadge level={subject.difficulty} prefix="难度 " />
        <LevelBadge level={subject.priority} prefix="优先 " />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-muted">
          <span>
            {progress.doneChapters}/{progress.totalChapters} 章 · 剩 {formatHours(progress.remainingHours)}
          </span>
          <span>{Math.round(progress.pct * 100)}%</span>
        </div>
        <ProgressBar value={progress.pct} color="bg-success" />
      </div>

      <Link
        href={`/subjects/${subject.id}`}
        className="flex items-center justify-end gap-0.5 text-xs text-primary hover:underline"
      >
        查看详情 <ChevronRight size={14} />
      </Link>
    </Card>
  );
}
