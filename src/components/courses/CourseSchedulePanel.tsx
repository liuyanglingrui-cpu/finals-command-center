'use client';

import { Eye, EyeOff, Trash2, TriangleAlert } from 'lucide-react';
import type { Course, CourseMeeting, CourseWeekday } from '@/lib/types';
import { COURSE_WEEKDAY_LABEL, findCourseConflicts } from '@/lib/courseImportParser';
import { cn } from '@/lib/cn';
import { Card } from '../ui/Card';

const COURSE_COLORS = [
  'border-primary/40 bg-primary/20 text-primary',
  'border-success/40 bg-success/20 text-success',
  'border-warning/40 bg-warning/20 text-warning',
  'border-danger/40 bg-danger/20 text-danger',
  'border-cyan-400/40 bg-cyan-400/20 text-cyan-200',
];

function meetingText(meetings: CourseMeeting[]): string {
  if (meetings.length === 0) return '暂无节次';
  return meetings
    .map((m) => `${COURSE_WEEKDAY_LABEL[m.weekday]} ${m.startSection}-${m.endSection}节`)
    .join(' · ');
}

function visibleWeekdays(courses: Course[]): CourseWeekday[] {
  const set = new Set<CourseWeekday>();
  for (const course of courses) {
    if (course.hidden) continue;
    for (const meeting of course.meetings) set.add(meeting.weekday);
  }
  const days = ([1, 2, 3, 4, 5] as CourseWeekday[]).filter((day) => set.has(day));
  const weekend = ([6, 7] as CourseWeekday[]).filter((day) => set.has(day));
  return [...(days.length ? days : ([1, 2, 3, 4, 5] as CourseWeekday[])), ...weekend];
}

export function CourseSchedulePanel({
  courses,
  onToggleHidden,
  onDelete,
}: {
  courses: Course[];
  onToggleHidden: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const visibleCourses = courses.filter((course) => !course.hidden);
  const weekdays = visibleWeekdays(courses);
  const maxSection = Math.max(
    10,
    ...visibleCourses.flatMap((course) => course.meetings.map((meeting) => meeting.endSection)),
  );
  const conflicts = findCourseConflicts(courses);
  const conflictKeys = new Set(
    conflicts.flatMap((conflict) =>
      conflict.courseNames.map(
        (name) => `${conflict.weekday}:${conflict.startSection}:${conflict.endSection}:${name}`,
      ),
    ),
  );

  if (courses.length === 0) {
    return (
      <Card className="text-center">
        <p className="text-sm font-medium text-text">还没有课程表</p>
        <p className="mt-1 text-sm text-muted">去导入页粘贴课表文本，课程会保存在这里。</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {conflicts.length > 0 ? (
        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
          <TriangleAlert size={14} className="mt-0.5 shrink-0" />
          <span>
            有 {conflicts.length} 处课程冲突，最近一处：{COURSE_WEEKDAY_LABEL[conflicts[0].weekday]}{' '}
            {conflicts[0].startSection}-{conflicts[0].endSection}节，{conflicts[0].courseNames.join(' / ')}。
          </span>
        </div>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-text">周视图</h2>
          <p className="mt-0.5 text-xs text-muted">隐藏课程不会出现在周视图中。</p>
        </div>
        <div className="overflow-x-auto p-3">
          <div
            className="grid min-w-[560px] rounded-lg border border-border bg-card2/45"
            style={{
              gridTemplateColumns: `44px repeat(${weekdays.length}, minmax(88px, 1fr))`,
              gridTemplateRows: `32px repeat(${maxSection}, 46px)`,
            }}
          >
            <div className="border-b border-r border-border/70" />
            {weekdays.map((weekday, idx) => (
              <div
                key={weekday}
                className={cn(
                  'flex items-center justify-center border-b border-border/70 text-xs font-medium text-muted',
                  idx < weekdays.length - 1 ? 'border-r' : '',
                )}
                style={{ gridColumn: idx + 2, gridRow: 1 }}
              >
                {COURSE_WEEKDAY_LABEL[weekday].replace('周', '')}
              </div>
            ))}
            {Array.from({ length: maxSection }, (_, idx) => idx + 1).map((section) => (
              <div
                key={`label-${section}`}
                className="flex items-center justify-center border-r border-t border-border/50 text-[11px] text-muted"
                style={{ gridColumn: 1, gridRow: section + 1 }}
              >
                {section}
              </div>
            ))}
            {Array.from({ length: maxSection }, (_, sectionIdx) =>
              weekdays.map((weekday, dayIdx) => (
                <div
                  key={`${weekday}-${sectionIdx}`}
                  className={cn(
                    'border-t border-border/40',
                    dayIdx < weekdays.length - 1 ? 'border-r border-border/40' : '',
                  )}
                  style={{ gridColumn: dayIdx + 2, gridRow: sectionIdx + 2 }}
                />
              )),
            )}
            {visibleCourses.flatMap((course, courseIdx) =>
              course.meetings
                .filter((meeting) => weekdays.includes(meeting.weekday))
                .map((meeting) => {
                  const dayIdx = weekdays.indexOf(meeting.weekday);
                  const overlap = conflicts.some(
                    (conflict) =>
                      conflict.weekday === meeting.weekday &&
                      conflict.startSection <= meeting.endSection &&
                      meeting.startSection <= conflict.endSection &&
                      conflictKeys.has(
                        `${conflict.weekday}:${conflict.startSection}:${conflict.endSection}:${course.name}`,
                      ),
                  );
                  return (
                    <div
                      key={`${course.id}-${meeting.id}`}
                      className={cn(
                        'm-1 overflow-hidden rounded-lg border px-2 py-1.5 text-[11px] leading-tight shadow-sm',
                        COURSE_COLORS[courseIdx % COURSE_COLORS.length],
                        overlap ? 'ring-1 ring-warning' : '',
                      )}
                      style={{
                        gridColumn: dayIdx + 2,
                        gridRow: `${meeting.startSection + 1} / span ${
                          meeting.endSection - meeting.startSection + 1
                        }`,
                      }}
                      title={`${course.name} ${meeting.startSection}-${meeting.endSection}节`}
                    >
                      <div className="line-clamp-2 font-semibold">{course.name}</div>
                      <div className="mt-0.5 opacity-80">
                        {meeting.startSection}-{meeting.endSection}节
                      </div>
                    </div>
                  );
                }),
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-text">课程列表</h2>
        {courses.map((course) => (
          <Card key={course.id} className={cn('space-y-3', course.hidden ? 'opacity-70' : '')}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-text">{course.name}</h3>
                <p className="mt-1 text-xs text-muted">
                  {course.term || '未设置学期'} · {meetingText(course.meetings)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => onToggleHidden(course.id)}
                  aria-label={course.hidden ? '显示课程' : '隐藏课程'}
                  className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-text"
                >
                  {course.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => onDelete(course.id)}
                  aria-label="删除课程"
                  className="rounded-md p-2 text-muted transition-colors hover:bg-danger/15 hover:text-danger"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {course.excludedFromReview ? (
                <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-1 text-[11px] text-warning">
                  不纳入复习
                </span>
              ) : null}
              {course.hidden ? (
                <span className="rounded-full border border-muted/30 bg-muted/10 px-2 py-1 text-[11px] text-muted">
                  已隐藏
                </span>
              ) : null}
              {course.keyTopics.slice(0, 4).map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] text-primary"
                >
                  {topic}
                </span>
              ))}
              {course.keyTopics.length > 4 ? (
                <span className="rounded-full border border-border px-2 py-1 text-[11px] text-muted">
                  +{course.keyTopics.length - 4}
                </span>
              ) : null}
            </div>
            {course.notes ? <p className="text-xs text-muted">{course.notes}</p> : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
