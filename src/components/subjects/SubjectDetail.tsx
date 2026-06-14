'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, CheckCircle2, Clock, Pencil, Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { subjectChapters, subjectProgress } from '@/lib/selectors';
import { formatCN } from '@/lib/date';
import { Loading } from '../ui/Loading';
import { Button } from '../ui/Button';
import { Countdown } from '../ui/Countdown';
import { StatCard } from '../ui/StatCard';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { LevelBadge } from '../Badges';
import { ChapterRow } from '../chapters/ChapterRow';
import { ChapterForm } from '../chapters/ChapterForm';
import { SubjectForm } from './SubjectForm';
import type { Chapter } from '@/lib/types';

export function SubjectDetail({ id }: { id: string }) {
  const router = useRouter();
  const { state, hydrated, addChapter, updateChapter, deleteChapter, updateSubject, deleteSubject } =
    useStore();

  // chapterModal: false | 'new' | Chapter
  const [chapterModal, setChapterModal] = useState<Chapter | 'new' | null>(null);
  const [editingSubject, setEditingSubject] = useState(false);

  if (!hydrated) return <Loading />;

  const subject = state.subjects.find((s) => s.id === id);
  if (!subject) {
    return (
      <EmptyState
        title="未找到该科目"
        hint="它可能已被删除"
        action={
          <Link href="/subjects">
            <Button variant="secondary">返回科目列表</Button>
          </Link>
        }
      />
    );
  }

  const chapters = subjectChapters(state, id);
  const progress = subjectProgress(state, id);
  const study = chapters.filter((c) => c.kind === 'study');
  const review = chapters.filter((c) => c.kind === 'review');

  function handleDeleteSubject() {
    if (confirm(`确定删除「${subject!.name}」及其所有章节吗？`)) {
      deleteSubject(id);
      router.push('/subjects');
    }
  }

  return (
    <div>
      <Link
        href="/subjects"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-text"
      >
        <ArrowLeft size={16} /> 返回科目
      </Link>

      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-text">{subject.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Countdown date={subject.examDate} />
            <LevelBadge level={subject.difficulty} prefix="难度 " />
            <LevelBadge level={subject.priority} prefix="优先 " />
          </div>
          <p className="mt-2 text-sm text-muted">
            {formatCN(subject.examDate)} {subject.examTime} 考试
            {subject.notes ? ` · ${subject.notes}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => setEditingSubject(true)}
            aria-label="编辑科目"
            className="rounded-md p-2 text-muted transition-colors hover:bg-white/5 hover:text-text"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={handleDeleteSubject}
            aria-label="删除科目"
            className="rounded-md p-2 text-muted transition-colors hover:bg-danger/15 hover:text-danger"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="总章节" value={progress.totalChapters} icon={BookOpen} />
        <StatCard label="已完成" value={progress.doneChapters} accent="text-success" icon={CheckCircle2} />
        <StatCard label="剩余时长" value={`${progress.remainingHours}h`} icon={Clock} />
        <StatCard label="完成度" value={`${Math.round(progress.pct * 100)}%`} accent="text-primary" />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text">章节列表</h2>
        <Button size="sm" onClick={() => setChapterModal('new')}>
          <Plus size={15} /> 添加章节
        </Button>
      </div>

      {chapters.length === 0 ? (
        <EmptyState
          title="还没有章节"
          hint="添加章节后，系统会把它们排进复习计划"
          action={
            <Button size="sm" onClick={() => setChapterModal('new')}>
              <Plus size={15} /> 添加第一个章节
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {study.length > 0 ? (
            <div className="space-y-2">
              {study.map((c) => (
                <ChapterRow
                  key={c.id}
                  chapter={c}
                  onEdit={() => setChapterModal(c)}
                  onDelete={() => {
                    if (confirm(`删除章节「${c.title}」？`)) deleteChapter(c.id);
                  }}
                />
              ))}
            </div>
          ) : null}

          {review.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-medium text-muted">复盘 / 错题 / 模拟卷</p>
              <div className="space-y-2">
                {review.map((c) => (
                  <ChapterRow
                    key={c.id}
                    chapter={c}
                    onEdit={() => setChapterModal(c)}
                    onDelete={() => {
                      if (confirm(`删除章节「${c.title}」？`)) deleteChapter(c.id);
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* 章节增/改 */}
      <Modal
        open={chapterModal !== null}
        onClose={() => setChapterModal(null)}
        title={chapterModal && chapterModal !== 'new' ? '编辑章节' : '添加章节'}
      >
        {chapterModal !== null ? (
          <ChapterForm
            subjectId={id}
            initial={chapterModal === 'new' ? undefined : chapterModal}
            onCancel={() => setChapterModal(null)}
            onSubmit={(data) => {
              if (chapterModal === 'new') addChapter(data);
              else updateChapter(chapterModal.id, data);
              setChapterModal(null);
            }}
          />
        ) : null}
      </Modal>

      {/* 科目编辑 */}
      <Modal open={editingSubject} onClose={() => setEditingSubject(false)} title="编辑科目">
        {editingSubject ? (
          <SubjectForm
            initial={subject}
            onCancel={() => setEditingSubject(false)}
            onSubmit={(data) => {
              updateSubject(id, data);
              setEditingSubject(false);
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
