'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useStore } from '@/lib/store';
import { availabilityFor, futureSubjects } from '@/lib/selectors';
import { addDays, dateRange, formatCN, todayStr, weekdayCN } from '@/lib/date';
import { Input } from '../ui/form';

function DayRow({
  date,
  effective,
  isOverride,
  onCommit,
  onReset,
}: {
  date: string;
  effective: number;
  isOverride: boolean;
  onCommit: (hours: number) => void;
  onReset: () => void;
}) {
  const [val, setVal] = useState(String(effective));

  function commit() {
    const n = Number(val);
    if (Number.isFinite(n) && n >= 0 && n !== effective) onCommit(Math.round(n * 10) / 10);
    else setVal(String(effective));
  }

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-32 shrink-0 text-sm">
        <span className="text-text">{formatCN(date)}</span>{' '}
        <span className="text-xs text-muted">{weekdayCN(date)}</span>
      </div>
      <div className="relative w-24">
        <Input
          type="number"
          min="0"
          step="0.5"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          className="pr-7"
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted">
          h
        </span>
      </div>
      {isOverride ? (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <RotateCcw size={12} /> 恢复默认
        </button>
      ) : (
        <span className="text-xs text-muted/50">默认</span>
      )}
    </div>
  );
}

export function AvailabilityEditor() {
  const { state, setAvailability, clearAvailability } = useStore();
  const today = todayStr();
  const fs = futureSubjects(state);
  const horizonEnd = fs.length ? fs[fs.length - 1].examDate : addDays(today, 13);
  const days = dateRange(today, horizonEnd);
  const overrides = new Set(state.availability.map((a) => a.date));

  if (days.length === 0) {
    return <p className="text-sm text-muted">暂无可安排的日期（没有未来的考试）。</p>;
  }

  return (
    <div className="divide-y divide-border/60">
      {days.map((d) => {
        const eff = availabilityFor(state, d);
        return (
          <DayRow
            key={`${d}:${eff}`}
            date={d}
            effective={eff}
            isOverride={overrides.has(d)}
            onCommit={(h) => setAvailability(d, h)}
            onReset={() => clearAvailability(d)}
          />
        );
      })}
    </div>
  );
}
