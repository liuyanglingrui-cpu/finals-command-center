'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Field, Input, Textarea } from '../ui/form';
import type { ReviewLog } from '@/lib/types';

type Data = Omit<ReviewLog, 'id'>;

export function ReviewForm({
  date,
  initial,
  plannedDefault,
  onSubmit,
}: {
  date: string;
  initial?: ReviewLog;
  plannedDefault: number;
  onSubmit: (data: Data) => void;
}) {
  const [planned, setPlanned] = useState(String(initial?.plannedHours ?? plannedDefault));
  const [actual, setActual] = useState(initial ? String(initial.actualHours) : '');
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [problems, setProblems] = useState(initial?.problems ?? '');
  const [adjustment, setAdjustment] = useState(initial?.adjustment ?? '');
  const [saved, setSaved] = useState(false);

  function submit() {
    onSubmit({
      date,
      plannedHours: Number(planned) || 0,
      actualHours: Number(actual) || 0,
      summary: summary.trim(),
      problems: problems.trim(),
      adjustment: adjustment.trim(),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="今天计划学习（小时）">
          <Input type="number" min="0" step="0.5" value={planned} onChange={(e) => setPlanned(e.target.value)} />
        </Field>
        <Field label="实际学习（小时）">
          <Input type="number" min="0" step="0.5" value={actual} onChange={(e) => setActual(e.target.value)} />
        </Field>
      </div>

      <Field label="完成情况">
        <Textarea rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="今天完成了哪些任务？" />
      </Field>
      <Field label="未完成原因">
        <Textarea rows={2} value={problems} onChange={(e) => setProblems(e.target.value)} placeholder="哪些没完成？为什么？" />
      </Field>
      <Field label="明天调整建议">
        <Textarea rows={2} value={adjustment} onChange={(e) => setAdjustment(e.target.value)} placeholder="明天怎么调整？" />
      </Field>

      <div className="flex items-center justify-end gap-3">
        {saved ? (
          <span className="inline-flex items-center gap-1 text-xs text-success">
            <Check size={14} /> 已保存
          </span>
        ) : null}
        <Button onClick={submit}>保存复盘</Button>
      </div>
    </div>
  );
}
