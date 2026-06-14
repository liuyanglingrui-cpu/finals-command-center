import { cn } from '@/lib/cn';
import { daysUntil } from '@/lib/date';

export function Countdown({ date, className }: { date: string; className?: string }) {
  const d = daysUntil(date);
  let text: string;
  let tone: string;

  if (d < 0) {
    text = '已结束';
    tone = 'bg-muted/15 text-muted border-muted/30';
  } else if (d === 0) {
    text = '今天考试';
    tone = 'bg-danger/15 text-danger border-danger/30';
  } else if (d === 1) {
    text = '明天考试';
    tone = 'bg-warning/15 text-warning border-warning/30';
  } else if (d <= 3) {
    text = `还剩 ${d} 天`;
    tone = 'bg-warning/15 text-warning border-warning/30';
  } else {
    text = `还剩 ${d} 天`;
    tone = 'bg-primary/15 text-primary border-primary/30';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium',
        tone,
        className,
      )}
    >
      {text}
    </span>
  );
}
