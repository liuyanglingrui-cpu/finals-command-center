import Link from 'next/link';
import { CalendarClock, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Countdown } from '../ui/Countdown';
import { ProgressBar } from '../ui/ProgressBar';
import { formatCN } from '@/lib/date';
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
    <Card className="p-0">
      <div className="flex items-start gap-3 border-b border-border p-4">
        <Link href={`/subjects/${subject.id}`} className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-text">{subject.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted">
            <CalendarClock size={13} />
            {subject.examDate ? (
              <>
                <span>{formatCN(subject.examDate)} {subject.examTime}</span>
                <Countdown date={subject.examDate} />
              </>
            ) : (
              <span>考试时间未公布</span>
            )}
          </div>
        </Link>
        <button onClick={onEdit} aria-label="编辑课程" className="grid h-11 w-11 place-items-center text-muted hover:text-text">
          <Pencil size={15} />
        </button>
        <button onClick={onDelete} aria-label="删除课程" className="grid h-11 w-11 place-items-center text-muted hover:text-danger">
          <Trash2 size={15} />
        </button>
      </div>
      <Link href={`/subjects/${subject.id}`} className="block p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>{progress.doneChapters}/{progress.totalChapters} 已清理</span>
          <span>{Math.round(progress.pct * 100)}%</span>
        </div>
        <ProgressBar value={progress.pct} />
        <div className="mt-3 flex items-center justify-end gap-1 text-xs text-text">
          打开清单 <ChevronRight size={14} />
        </div>
      </Link>
    </Card>
  );
}
