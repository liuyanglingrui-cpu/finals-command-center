import { cn } from '@/lib/cn';
import type { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  sub,
  accent = 'text-text',
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/70 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        {Icon ? <Icon size={16} className="text-muted" /> : null}
      </div>
      <div className={cn('mt-2 text-2xl font-semibold', accent)}>{value}</div>
      {sub ? <div className="mt-1 text-xs text-muted">{sub}</div> : null}
    </div>
  );
}
