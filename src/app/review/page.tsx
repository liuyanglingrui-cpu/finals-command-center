'use client';

import { useStore } from '@/lib/store';
import { round1 } from '@/lib/selectors';
import { formatCN, formatFull, formatHours, todayStr, weekdayCN } from '@/lib/date';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { ReviewForm } from '@/components/review/ReviewForm';

export default function ReviewPage() {
  const { state, hydrated, upsertReview } = useStore();
  const today = todayStr();

  if (!hydrated) return <Loading />;

  const todayReview = state.reviews.find((r) => r.date === today);
  const plannedDefault = round1(
    state.tasks.filter((t) => t.date === today).reduce((s, t) => s + t.hours, 0),
  );
  const history = [...state.reviews].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <PageHeader title="今日复盘" subtitle={formatFull(today)} />

      <Card className="mb-6">
        <ReviewForm
          key={today}
          date={today}
          initial={todayReview}
          plannedDefault={plannedDefault}
          onSubmit={upsertReview}
        />
      </Card>

      <h2 className="mb-3 text-sm font-semibold text-text">历史复盘</h2>
      {history.length === 0 ? (
        <p className="text-sm text-muted">还没有复盘记录。</p>
      ) : (
        <div className="space-y-3">
          {history.map((r) => (
            <Card key={r.id}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-text">
                  {formatCN(r.date)} <span className="text-xs text-muted">{weekdayCN(r.date)}</span>
                </span>
                <span className="text-xs text-muted">
                  计划 {formatHours(r.plannedHours)} · 实际 {formatHours(r.actualHours)}
                </span>
              </div>
              {r.summary ? (
                <p className="mt-2 text-sm text-text">
                  <span className="text-muted">完成：</span>
                  {r.summary}
                </p>
              ) : null}
              {r.problems ? (
                <p className="mt-1 text-sm text-text">
                  <span className="text-muted">未完成：</span>
                  {r.problems}
                </p>
              ) : null}
              {r.adjustment ? (
                <p className="mt-1 text-sm text-text">
                  <span className="text-muted">调整：</span>
                  {r.adjustment}
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
