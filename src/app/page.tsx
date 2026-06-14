'use client';

import Link from 'next/link';
import { CalendarClock, ChevronRight, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { computePressure } from '@/lib/pressure';
import { futureSubjects, nextExam, overallProgress, subjectProgress } from '@/lib/selectors';
import { daysUntil, formatCN, formatFull, formatHours, todayStr } from '@/lib/date';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Countdown } from '@/components/ui/Countdown';
import { PressureGauge } from '@/components/dashboard/PressureGauge';
import { TaskItem } from '@/components/schedule/TaskItem';

export default function DashboardPage() {
  const { state, hydrated, toggleTask } = useStore();
  const today = todayStr();

  if (!hydrated) return <Loading />;

  const getName = (id: string) => state.subjects.find((s) => s.id === id)?.name ?? '';

  if (state.subjects.length === 0) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle={formatFull(today)} />
        <EmptyState
          title="还没有任何科目"
          hint="先添加考试科目和章节，系统会自动为你生成复习计划"
          action={
            <Link href="/subjects">
              <Button>
                <Plus size={16} /> 添加科目
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const exam = nextExam(state);
  const pressure = computePressure(state);
  const overall = overallProgress(state);
  const todayTasks = state.tasks.filter((t) => t.date === today);
  const todayDone = todayTasks.filter((t) => t.completed).length;
  const fs = futureSubjects(state);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={formatFull(today)} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="最近一场考试"
          value={exam ? exam.name : '—'}
          accent="text-primary"
          icon={CalendarClock}
          sub={
            exam
              ? `${formatCN(exam.examDate)} ${exam.examTime} · 还剩 ${Math.max(0, daysUntil(exam.examDate))} 天`
              : '暂无未来考试'
          }
        />
        <StatCard
          label="总复习进度"
          value={`${Math.round(overall.pct * 100)}%`}
          accent="text-success"
          sub={`${overall.doneChapters}/${overall.totalChapters} 章 · 已学 ${formatHours(overall.completedHours)} / ${formatHours(overall.totalHours)}`}
        />
        <PressureGauge pressure={pressure} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 今日任务 */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">
              今日任务{' '}
              <span className="text-muted">
                {todayDone}/{todayTasks.length}
              </span>
            </h2>
            <Link href="/schedule" className="inline-flex items-center text-xs text-primary hover:underline">
              完整计划 <ChevronRight size={14} />
            </Link>
          </div>
          {todayTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">今天没有安排，去日程页看看后续计划</p>
          ) : (
            <div className="space-y-2">
              {[...todayTasks]
                .sort((a, b) => Number(a.completed) - Number(b.completed))
                .map((t) => (
                  <TaskItem key={t.id} task={t} subjectName={getName(t.subjectId)} onToggle={toggleTask} />
                ))}
            </div>
          )}
        </Card>

        {/* 各科完成度 */}
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-text">各科完成度</h2>
          <div className="space-y-3.5">
            {fs.map((s) => {
              const p = subjectProgress(state, s.id);
              return (
                <Link key={s.id} href={`/subjects/${s.id}`} className="block">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 truncate text-sm text-text">
                      {s.name}
                      <Countdown date={s.examDate} />
                    </span>
                    <span className="shrink-0 text-xs text-muted">{Math.round(p.pct * 100)}%</span>
                  </div>
                  <ProgressBar value={p.pct} color="bg-success" />
                </Link>
              );
            })}
            {fs.length === 0 ? <p className="text-sm text-muted">没有未来的考试。</p> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
