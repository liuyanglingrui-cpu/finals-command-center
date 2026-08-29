'use client';

import Link from 'next/link';
import { ArrowRight, CalendarClock, Check, Circle, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { DEFAULT_USER_NAME } from '@/lib/constants';
import { nextExam, overallProgress, subjectProgress } from '@/lib/selectors';
import { daysUntil, formatCN, formatFull, todayStr } from '@/lib/date';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function DashboardPage() {
  const { state, hydrated, toggleChapter } = useStore();
  if (!hydrated) return <Loading />;

  const today = todayStr();
  const displayName = state.userName.trim() || DEFAULT_USER_NAME;
  const progress = overallProgress(state);
  const exam = nextExam(state);
  const pending = state.chapters.filter((point) => !point.completed).slice(0, 6);
  const subjectName = (id: string) => state.subjects.find((subject) => subject.id === id)?.name ?? '';

  return (
    <div>
      <PageHeader title={`你好，${displayName}`} subtitle={formatFull(today)} />

      <section className="grid grid-cols-2 border border-border">
        <div className="border-r border-border p-4">
          <div className="text-xs text-muted">全部进度</div>
          <div className="mt-2 text-3xl font-bold text-text">{Math.round(progress.pct * 100)}%</div>
          <div className="mt-1 text-xs text-muted">{progress.doneChapters}/{progress.totalChapters} 已清理</div>
        </div>
        <div className="p-4">
          <div className="text-xs text-muted">最近考试</div>
          {exam ? (
            <>
              <div className="mt-2 text-3xl font-bold text-text">{Math.max(0, daysUntil(exam.examDate))}<span className="ml-1 text-sm text-muted">天</span></div>
              <div className="mt-1 truncate text-xs text-muted">{exam.name}</div>
            </>
          ) : (
            <>
              <div className="mt-3 text-base font-semibold text-text">尚未公布</div>
              <div className="mt-2 text-xs text-muted">先清知识点即可</div>
            </>
          )}
        </div>
      </section>
      <ProgressBar value={progress.pct} className="mt-3" />

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-text">接下来清这些</h2>
          <Link href="/subjects" className="inline-flex min-h-11 items-center gap-1 text-xs text-muted hover:text-text">
            全部课程 <ArrowRight size={14} />
          </Link>
        </div>
        {pending.length > 0 ? (
          <div className="border-t border-border">
            {pending.map((point) => (
              <button
                key={point.id}
                onClick={() => toggleChapter(point.id)}
                className="flex min-h-14 w-full items-center border-b border-border text-left"
              >
                <span className="mr-3 grid h-7 w-7 shrink-0 place-items-center rounded-[2px] border border-muted text-transparent">
                  <Check size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-text">{point.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted">{subjectName(point.subjectId)}</span>
                </span>
                {point.isImportant ? <span className="ml-2 border border-warning px-1.5 py-0.5 text-[10px] text-warning">重点</span> : null}
              </button>
            ))}
          </div>
        ) : (
          <Card className="text-center">
            <Circle size={24} className="mx-auto text-muted" />
            <p className="mt-3 text-sm font-medium text-text">清单已经清空</p>
            <p className="mt-1 text-xs text-muted">可以添加下一门课程或新的知识点。</p>
          </Card>
        )}
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-sm font-bold text-text">课程进度</h2>
        {state.subjects.length > 0 ? (
          <div className="border-t border-border">
            {state.subjects.map((subject) => {
              const itemProgress = subjectProgress(state, subject.id);
              return (
                <Link key={subject.id} href={`/subjects/${subject.id}`} className="flex min-h-16 items-center gap-3 border-b border-border">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-text">{subject.name}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                      <CalendarClock size={12} />
                      {subject.examDate ? `${formatCN(subject.examDate)} 考试` : '考试时间未公布'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-text">{Math.round(itemProgress.pct * 100)}%</div>
                    <div className="mt-1 text-[11px] text-muted">{itemProgress.remainingChapters} 待清理</div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <Link href="/subjects"><Button><Plus size={15} />添加第一门课程</Button></Link>
        )}
      </section>
    </div>
  );
}
