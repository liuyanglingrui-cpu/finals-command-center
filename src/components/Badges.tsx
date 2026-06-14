import { Star } from 'lucide-react';
import { Badge } from './ui/Badge';
import { LEVEL_BADGE, LEVEL_LABEL, STATUS_BADGE, STATUS_LABEL } from '@/lib/constants';
import type { ChapterStatus, Level } from '@/lib/types';

export function LevelBadge({ level, prefix }: { level: Level; prefix?: string }) {
  return (
    <Badge className={LEVEL_BADGE[level]}>
      {prefix}
      {LEVEL_LABEL[level]}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: ChapterStatus }) {
  return <Badge className={STATUS_BADGE[status]}>{STATUS_LABEL[status]}</Badge>;
}

export function ImportantBadge() {
  return (
    <Badge className="border-warning/30 bg-warning/15 text-warning">
      <Star size={11} className="fill-warning" />
      重点
    </Badge>
  );
}
