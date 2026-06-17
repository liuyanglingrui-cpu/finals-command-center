'use client';

import Link from 'next/link';
import { BarChart3, CalendarClock, ChevronRight, NotebookPen, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { DEFAULT_USER_NAME } from '@/lib/constants';
import { computePressure } from '@/lib/pressure';
import { futureSubjects, nextExam, overallProgress, subjectProgress } from '@/lib/selectors';
import { daysUntil, formatFull, formatHours, todayStr } from '@/lib/date';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
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
  const displayName = state.userName.trim() || DEFAULT_USER_NAME;

  if (state.subjects.length === 0) {
    return (
      <div>
        <PageHeader title={`早上好，${displayName}`} subtitle={formatFull(today)} />
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
  const todayHours = todayTasks.reduce((sum, task) => sum + task.hours, 0);
  const fs = futureSubjects(state);

  return (
    <div>
      <PageHeader
        title={`早上好，${displayName}`}
        subtitle={`今天是 ${formatFull(today)}`}
        action={
          <Link href="/review">
            <Button variant="secondary" size="sm">
              <NotebookPen size={14} /> 复盘
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <Card className="min-h-[104px] overflow-hidden bg-card/90">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">最近考试</span>
            <CalendarClock size={15} className="text-success" />
          </div>
          <div className="mt-3 text-3xl font-bold text-text">{exam ? Math.max(0, daysUntil(exam.examDate)) : '—'}</div>
          <div className="mt-1 truncate text-xs text-muted">{exam ? `${exam.name} · 天` : '暂无未来考试'}</div>
        </Card>
        <Card className="min-h-[104px] bg-card/90">
          <div className="text-xs text-muted">今日任务</div>
          <div className="mt-3 text-3xl font-bold text-text">
            {formatHours(todayHours).replace('h', '')}
            <span className="ml-1 text-sm font-medium text-muted">小时</span>
          </div>
          <div className="mt-1 text-xs text-muted">计划学习</div>
        </Card>
        <Card className="min-h-[104px] bg-card/90">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">完成进度</span>
            <BarChart3 size={15} className="text-primary" />
          </div>
          <div className="mt-3 text-3xl font-bold text-text">{Math.round(overall.pct * 100)}%</div>
          <ProgressBar value={overall.pct} color="bg-success" className="mt-2" />
        </Card>
        <PressureGauge pressure={pressure} />
      </div>

      <div className="mt-6 space-y-4">
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
          <Link href="/schedule" className="mt-4 block">
            <Button className="w-full">开始学习</Button>
          </Link>
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
