'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { Field, Input, Textarea } from '../ui/form';
import type { Subject } from '@/lib/types';

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
  const [examDate, setExamDate] = useState(initial?.examDate ?? '');
  const [examTime, setExamTime] = useState(initial?.examTime ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  return (
    <div className="space-y-4">
      <Field label="课程名称">
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="如 微积分（2）" autoFocus />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="考试日期" hint="未公布时留空">
          <Input
            type="date"
            value={examDate}
            onChange={(event) => {
              setExamDate(event.target.value);
              if (!event.target.value) setExamTime('');
            }}
          />
        </Field>
        <Field label="考试时间">
          <Input
            type="time"
            value={examTime}
            disabled={!examDate}
            onChange={(event) => setExamTime(event.target.value)}
          />
        </Field>
      </div>
      <Field label="备注">
        <Textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="可选" />
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>取消</Button>
        <Button
          disabled={!name.trim()}
          onClick={() =>
            name.trim() &&
            onSubmit({
              name: name.trim(),
              examDate,
              examTime: examDate ? examTime || '09:00' : '',
              notes: notes.trim(),
            })
          }
        >
          保存
        </Button>
      </div>
    </div>
  );
}
