'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea } from '../ui/form';
import { LEVELS, LEVEL_LABEL } from '@/lib/constants';
import { todayStr } from '@/lib/date';
import type { Level, Subject } from '@/lib/types';

type Data = Omit<Subject, 'id'>;

export function SubjectForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Subject;
  onSubmit: (data: Data) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [examDate, setExamDate] = useState(initial?.examDate ?? todayStr());
  const [examTime, setExamTime] = useState(initial?.examTime ?? '09:00');
  const [difficulty, setDifficulty] = useState<Level>(initial?.difficulty ?? 'mid');
  const [priority, setPriority] = useState<Level>(initial?.priority ?? 'mid');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const valid = name.trim().length > 0 && examDate.length > 0;

  function submit() {
    if (!valid) return;
    onSubmit({
      name: name.trim(),
      examDate,
      examTime,
      difficulty,
      priority,
      notes: notes.trim(),
    });
  }

  return (
    <div className="space-y-4">
      <Field label="科目名称">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如 微积分" autoFocus />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="考试日期">
          <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        </Field>
        <Field label="考试时间">
          <Input type="time" value={examTime} onChange={(e) => setExamTime(e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="难度">
          <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Level)}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {LEVEL_LABEL[l]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="优先级">
          <Select value={priority} onChange={(e) => setPriority(e.target.value as Level)}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {LEVEL_LABEL[l]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="备注">
        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="可选" />
      </Field>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={submit} disabled={!valid}>
          保存
        </Button>
      </div>
    </div>
  );
}
