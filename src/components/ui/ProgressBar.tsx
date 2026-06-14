import { cn } from '@/lib/cn';

export function ProgressBar({
  value,
  className,
  color = 'bg-primary',
}: {
  value: number; // 0..1
  className?: string;
  color?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-white/10', className)}>
      <div className={cn('h-full rounded-full transition-all duration-300', color)} style={{ width: `${pct}%` }} />
    </div>
  );
}
