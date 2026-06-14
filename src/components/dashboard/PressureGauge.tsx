import { cn } from '@/lib/cn';
import { formatHours } from '@/lib/date';
import type { Pressure } from '@/lib/pressure';

const TONE = {
  green: { text: 'text-success', bar: 'bg-success', badge: 'border-success/30 bg-success/15 text-success' },
  yellow: { text: 'text-warning', bar: 'bg-warning', badge: 'border-warning/30 bg-warning/15 text-warning' },
  red: { text: 'text-danger', bar: 'bg-danger', badge: 'border-danger/30 bg-danger/15 text-danger' },
} as const;

export function PressureGauge({ pressure }: { pressure: Pressure }) {
  const tone = TONE[pressure.level];
  const hasData = pressure.available > 0 || pressure.remaining > 0;
  const pctNum = pressure.available > 0 ? Math.round(pressure.ratio * 100) : pressure.remaining > 0 ? 999 : 0;
  const fill = Math.min(1, pressure.available > 0 ? pressure.ratio : pressure.remaining > 0 ? 1 : 0);

  return (
    <div className="rounded-xl border border-border bg-card/70 p-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-muted">压力指数</div>
          <div className={cn('mt-1 text-2xl font-semibold', hasData ? tone.text : 'text-muted')}>
            {hasData ? `${pctNum}%` : '—'}
          </div>
        </div>
        <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', tone.badge)}>
          {pressure.label}
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className={cn('h-full rounded-full transition-all', tone.bar)} style={{ width: `${fill * 100}%` }} />
      </div>
      <div className="mt-2 text-xs text-muted">
        剩余 {formatHours(pressure.remaining)} · 可用 {formatHours(pressure.available)}
      </div>
    </div>
  );
}
