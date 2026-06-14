import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { ImportantBadge, LevelBadge, StatusBadge } from '../Badges';
import { KIND_LABEL } from '@/lib/constants';
import { chapterStatus } from '@/lib/selectors';
import { formatHours } from '@/lib/date';
import type { Chapter } from '@/lib/types';

export function ChapterRow({
  chapter,
  onEdit,
  onDelete,
}: {
  chapter: Chapter;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = chapterStatus(chapter);
  const pct =
    chapter.estimatedHours > 0 ? Math.min(1, chapter.completedHours / chapter.estimatedHours) : 0;

  return (
    <div className="rounded-lg border border-border bg-card2/50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="font-medium text-text">{chapter.title}</span>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={status} />
            <LevelBadge level={chapter.difficulty} prefix="难度 " />
            {chapter.isImportant ? <ImportantBadge /> : null}
            {chapter.kind === 'review' ? (
              <Badge className="border-primary/30 bg-primary/10 text-primary">{KIND_LABEL.review}</Badge>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="mr-1 whitespace-nowrap text-xs text-muted">
            {formatHours(chapter.completedHours)}/{formatHours(chapter.estimatedHours)}
          </span>
          <button
            onClick={onEdit}
            aria-label="编辑章节"
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-text"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDelete}
            aria-label="删除章节"
            className="rounded-md p-1.5 text-muted transition-colors hover:bg-danger/15 hover:text-danger"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {status !== 'todo' ? <ProgressBar value={pct} color="bg-success" className="mt-2.5" /> : null}
    </div>
  );
}
