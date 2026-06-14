'use client';

import Link from 'next/link';
import { Plus, RotateCcw, TriangleAlert } from 'lucide-react';
import { useStore } from '@/lib/store';
import { availabilityFor, futureSubjects } from '@/lib/selectors';
import { formatCN, todayStr, weekdayCN } from '@/lib/date';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { DayGroup } from '@/components/schedule/DayGroup';
import type { ScheduleTask, Subject } from '@/lib/types';

export default function SchedulePage() {
  const { state, hydrated, toggleTask, regenerate } = useStore();
  const today = todayStr();

  if (!hydrated) return <Loading />;

  const getName = (id: string) => state.subjects.find((s) => s.id === id)?.name ?? '';

  if (state.subjects.length === 0) {
    return (
      <div>
        <PageHeader title="Schedule" subtitle="自动生成的每日复习计划" />
        <EmptyState
          title="还没有计划"
          hint="先添加科目与章节，系统会自动排程"
          action={
            <Link href="/subjects">
              <Button>
                <Plus size={16} /> 去添加科目
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const fs = futureSubjects(state);

  const tasksByDate = new Map<string, ScheduleTask[]>();
  for (const t of state.tasks) {
    const arr = tasksByDate.get(t.date) ?? [];
    arr.push(t);
    tasksByDate.set(t.date, arr);
  }

  const examByDate = new Map<string, Subject[]>();
  for (const s of fs) {
    const arr = examByDate.get(s.examDate) ?? [];
    arr.push(s);
    examByDate.set(s.examDate, arr);
  }

  const dates = [...new Set([...tasksByDate.keys(), ...examByDate.keys()])].sort();
  const hasShortfall = state.tasks.some((t) => t.shortfall && !t.completed);

  return (
    <div>
      <PageHeader
        title="Schedule"
        subtitle="按日期推进，勾选即完成"
        action={
          <Button variant="secondary" size="sm" onClick={regenerate}>
            <RotateCcw size={14} /> 重新生成
          </Button>
        }
      />

      {hasShortfall ? (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          <TriangleAlert size={14} className="mt-0.5 shrink-0" />
          <span>部分任务在考前排不下（标红），建议增加每日可用时间，或精简 / 提前章节。</span>
        </div>
      ) : null}

      {dates.length === 0 ? (
        <EmptyState title="暂无计划" hint="给科目添加章节后会自动生成计划" />
      ) : (
        <div className="space-y-4">
          {dates.map((date) => {
            const exams = examByDate.get(date);
            const tasks = tasksByDate.get(date);
            return (
              <div key={date} className="space-y-3">
                {exams ? (
                  <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text">{formatCN(date)}</span>
                        <span className="text-xs text-muted">{weekdayCN(date)}</span>
                      </div>
                      <span className="text-sm font-medium text-danger">📝 考试日</span>
                    </div>
                    <div className="mt-1 text-sm text-text">
                      {exams.map((e) => `${e.name} ${e.examTime}`).join(' · ')}
                    </div>
                  </div>
                ) : null}

                {tasks ? (
                  <DayGroup
                    date={date}
                    tasks={tasks}
                    capacity={availabilityFor(state, date)}
                    isToday={date === today}
                    getSubjectName={getName}
                    onToggle={toggleTask}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
