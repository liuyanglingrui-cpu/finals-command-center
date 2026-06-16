'use client';

import { useMemo, useState } from 'react';
import { BookOpenCheck, Eye, EyeOff, GraduationCap, Trash2, TriangleAlert } from 'lucide-react';
import { useStore, type ImportItem } from '@/lib/store';
import type { ParsedCourse } from '@/lib/courseImportParser';
import { COURSE_WEEKDAY_LABEL, findCourseConflicts } from '@/lib/courseImportParser';
import { todayStr } from '@/lib/date';
import type { Course, CourseMeeting } from '@/lib/types';
import { cn } from '@/lib/cn';
import { uid } from '@/lib/id';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/form';

type NewCourse = Omit<Course, 'id'>;

interface DraftCourse extends ParsedCourse {
  key: string;
  syncToReview: boolean;
  existingId: string | null;
  mergeIntoId: string | null;
  examDate: string;
  examTime: string;
}

function meetingsText(meetings: ParsedCourse['meetings']): string {
  if (meetings.length === 0) return '暂无上课节次';
  return meetings
    .map((m) => `${COURSE_WEEKDAY_LABEL[m.weekday]} ${m.startSection}-${m.endSection}节`)
    .join(' · ');
}

function normalizeName(name: string): string {
  return name.replace(/\s+/g, '').trim();
}

function toCourseMeetings(meetings: ParsedCourse['meetings']): CourseMeeting[] {
  return meetings.map((m) => ({ ...m, id: uid('meet') }));
}

export function CourseImportPreview({
  parsed,
  onCancel,
  onImported,
}: {
  parsed: ParsedCourse[];
  onCancel: () => void;
  onImported: () => void;
}) {
  const { state, importCourses, importSubjects } = useStore();

  const [draft, setDraft] = useState<DraftCourse[]>(() =>
    parsed.map((course) => {
      const existing = state.subjects.find((subject) => normalizeName(subject.name) === normalizeName(course.name));
      return {
        ...course,
        key: uid('course-draft'),
        syncToReview: false,
        existingId: existing?.id ?? null,
        mergeIntoId: existing?.id ?? null,
        examDate: '',
        examTime: '09:00',
      };
    }),
  );

  const conflicts = useMemo(() => findCourseConflicts(draft), [draft]);

  function patchCourse(i: number, patch: Partial<DraftCourse>) {
    setDraft((courses) => courses.map((course, idx) => (idx === i ? { ...course, ...patch } : course)));
  }

  function removeCourse(i: number) {
    setDraft((courses) => courses.filter((_, idx) => idx !== i));
  }

  const canImport =
    draft.length > 0 &&
    draft.every(
      (course) =>
        course.name.trim() &&
        (!course.syncToReview ||
          (course.keyTopics.length > 0 && (course.mergeIntoId || course.examDate.trim()))),
    );

  function confirmImport() {
    if (!canImport) return;

    const courses: NewCourse[] = draft.map((course) => ({
      name: course.name.trim(),
      term: course.term.trim(),
      meetings: toCourseMeetings(course.meetings),
      keyTopics: course.keyTopics.map((topic) => topic.trim()).filter(Boolean),
      hidden: course.hidden,
      excludedFromReview: course.excludedFromReview,
      notes: course.notes.trim(),
    }));

    const reviewItems: ImportItem[] = draft
      .filter((course) => course.syncToReview && course.keyTopics.length > 0)
      .map((course) => ({
        mergeIntoId: course.mergeIntoId,
        subject: {
          name: course.name.trim(),
          examDate: course.examDate || todayStr(),
          examTime: course.examTime || '09:00',
          difficulty: 'mid',
          priority: 'mid',
          notes: course.notes ? `来自课程表导入：${course.notes}` : '来自课程表导入',
        },
        chapters: course.keyTopics
          .map((topic) => topic.trim())
          .filter(Boolean)
          .map((topic) => ({
            title: topic,
            estimatedHours: 2,
            difficulty: 'mid' as const,
            isImportant: true,
            kind: 'study' as const,
          })),
      }));

    importCourses(courses);
    if (reviewItems.length > 0) importSubjects(reviewItems);
    onImported();
  }

  if (draft.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted">没有识别到课程，请返回修改文本。</p>
        <div className="mt-4">
          <Button variant="secondary" onClick={onCancel}>
            返回
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted">
          识别出 <span className="text-text">{draft.length}</span> 门课程，可逐项决定是否同步到复习系统。
        </p>
      </div>

      {conflicts.length > 0 ? (
        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          <TriangleAlert size={14} className="mt-0.5 shrink-0" />
          <span>
            检测到 {conflicts.length} 处课程冲突，例如{' '}
            {COURSE_WEEKDAY_LABEL[conflicts[0].weekday]} {conflicts[0].startSection}-
            {conflicts[0].endSection}节：{conflicts[0].courseNames.join(' / ')}。
          </span>
        </div>
      ) : null}

      <div className="space-y-3">
        {draft.map((course, i) => {
          const needsExamDate = course.syncToReview && !course.mergeIntoId && !course.examDate;
          const canSync = course.keyTopics.length > 0;
          return (
            <Card key={course.key} className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                  <GraduationCap size={21} />
                </div>
                <div className="min-w-0 flex-1">
                  <Input
                    value={course.name}
                    onChange={(e) => patchCourse(i, { name: e.target.value })}
                    className="h-9 font-semibold"
                    placeholder="课程名称"
                  />
                  <div className="mt-1 text-xs text-muted">{meetingsText(course.meetings)}</div>
                </div>
                <button
                  onClick={() => removeCourse(i)}
                  aria-label="删除课程"
                  className="rounded-md p-2 text-muted transition-colors hover:bg-danger/15 hover:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="mb-1 block text-xs text-muted">学期</span>
                  <Input
                    value={course.term}
                    onChange={(e) => patchCourse(i, { term: e.target.value })}
                    placeholder="如 2026春"
                  />
                </div>
                <div>
                  <span className="mb-1 block text-xs text-muted">显示</span>
                  <button
                    onClick={() => patchCourse(i, { hidden: !course.hidden })}
                    className={cn(
                      'flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border text-sm transition-colors',
                      course.hidden
                        ? 'border-muted/30 bg-card2 text-muted'
                        : 'border-primary/40 bg-primary/15 text-primary',
                    )}
                  >
                    {course.hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                    {course.hidden ? '隐藏' : '显示'}
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card2/45 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted">重点章节</span>
                  <span className="text-xs text-muted/70">{course.keyTopics.length} 项</span>
                </div>
                {course.keyTopics.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {course.keyTopics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full border border-warning/30 bg-warning/10 px-2 py-1 text-[11px] text-warning"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted/70">没有重点章节，仍会完整导入课程表。</p>
                )}
              </div>

              <div className="rounded-lg border border-border bg-card2/45 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      if (canSync) patchCourse(i, { syncToReview: !course.syncToReview });
                    }}
                    disabled={!canSync}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50',
                      course.syncToReview ? 'bg-success/15 text-success' : 'bg-white/5 text-muted hover:text-text',
                    )}
                  >
                    <BookOpenCheck size={14} />
                    {course.syncToReview ? '将同步复习' : '仅保存课程表'}
                  </button>
                  {course.excludedFromReview ? (
                    <span className="text-xs text-warning">已标记不纳入复习系统</span>
                  ) : null}
                </div>

                {course.syncToReview ? (
                  <div className="mt-3 space-y-3">
                    {course.existingId ? (
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-muted">同名科目：</span>
                        <button
                          onClick={() => patchCourse(i, { mergeIntoId: course.existingId })}
                          className={cn(
                            'rounded-md px-2 py-1 transition-colors',
                            course.mergeIntoId ? 'bg-primary/15 text-primary' : 'text-muted hover:text-text',
                          )}
                        >
                          合并已有
                        </button>
                        <button
                          onClick={() => patchCourse(i, { mergeIntoId: null })}
                          className={cn(
                            'rounded-md px-2 py-1 transition-colors',
                            course.mergeIntoId === null ? 'bg-primary/15 text-primary' : 'text-muted hover:text-text',
                          )}
                        >
                          新建科目
                        </button>
                      </div>
                    ) : null}
                    {!course.mergeIntoId ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="mb-1 block text-xs text-muted">考试日期</span>
                          <Input
                            type="date"
                            value={course.examDate}
                            onChange={(e) => patchCourse(i, { examDate: e.target.value })}
                            className={needsExamDate ? 'border-warning/60' : ''}
                          />
                        </div>
                        <div>
                          <span className="mb-1 block text-xs text-muted">考试时间</span>
                          <Input
                            type="time"
                            value={course.examTime}
                            onChange={(e) => patchCourse(i, { examTime: e.target.value })}
                          />
                        </div>
                      </div>
                    ) : null}
                    {needsExamDate ? <p className="text-xs text-warning">新建复习科目需要补考试日期。</p> : null}
                  </div>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          返回修改文本
        </Button>
        <Button onClick={confirmImport} disabled={!canImport}>
          确认导入
        </Button>
      </div>
    </div>
  );
}
