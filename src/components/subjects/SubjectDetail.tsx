'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarClock, Check, Pencil, Plus, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { subjectChapters, subjectProgress } from '@/lib/selectors';
import { formatCN } from '@/lib/date';
import { Loading } from '../ui/Loading';
import { Button } from '../ui/Button';
import { Countdown } from '../ui/Countdown';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { ChapterRow } from '../chapters/ChapterRow';
import { ChapterForm } from '../chapters/ChapterForm';
import { SubjectForm } from './SubjectForm';
import { ProgressBar } from '../ui/ProgressBar';
import type { KnowledgePoint } from '@/lib/types';

export function SubjectDetail({ id }: { id: string }) {
  const router = useRouter();
  const {
    state,
    hydrated,
    addChapter,
    updateChapter,
    deleteChapter,
    toggleChapter,
    updateSubject,
    deleteSubject,
  } = useStore();
  const [chapterModal, setChapterModal] = useState<KnowledgePoint | 'new' | null>(null);
  const [editingSubject, setEditingSubject] = useState(false);

  if (!hydrated) return <Loading />;
  const subject = state.subjects.find((item) => item.id === id);
  if (!subject) return <EmptyState title="未找到这门课程" hint="它可能已被删除" />;

  const chapters = subjectChapters(state, id);
  const progress = subjectProgress(state, id);
  const pending = chapters.filter((point) => !point.completed);
  const done = chapters.filter((point) => point.completed);

  return (
    <div>
      <Link href="/subjects" className="mb-5 inline-flex min-h-11 items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={16} /> 返回课程
      </Link>

      <header className="mb-6 border-b border-border pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-text">{subject.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
              <CalendarClock size={14} />
              {subject.examDate ? (
                <>
                  <span>{formatCN(subject.examDate)} {subject.examTime}</span>
                  <Countdown date={subject.examDate} />
                </>
              ) : (
                <span>考试时间未公布，可以稍后补充</span>
              )}
            </div>
            {subject.notes ? <p className="mt-2 text-sm text-muted">{subject.notes}</p> : null}
          </div>
          <button onClick={() => setEditingSubject(true)} aria-label="编辑课程" className="grid h-11 w-11 place-items-center border border-border text-muted hover:text-text">
            <Pencil size={16} />
          </button>
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold text-text">{progress.doneChapters}<span className="text-base text-muted"> / {progress.totalChapters}</span></div>
            <div className="mt-1 text-xs text-muted">知识点已清理</div>
          </div>
          <span className="text-sm font-semibold text-text">{Math.round(progress.pct * 100)}%</span>
        </div>
        <ProgressBar value={progress.pct} className="mt-3" />
      </header>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text">待清理 · {pending.length}</h2>
        <Button size="sm" onClick={() => setChapterModal('new')}><Plus size={15} />添加知识点</Button>
      </div>

      {chapters.length === 0 ? (
        <EmptyState
          title="清单还是空的"
          hint="手动添加，或者用导入功能一次粘贴整门课"
          action={<Button size="sm" onClick={() => setChapterModal('new')}><Plus size={15} />添加知识点</Button>}
        />
      ) : (
        <div className="border-t border-border">
          {pending.map((point) => (
            <ChapterRow
              key={point.id}
              chapter={point}
              onToggle={() => toggleChapter(point.id)}
              onEdit={() => setChapterModal(point)}
              onDelete={() => confirm(`删除知识点「${point.title}」？`) && deleteChapter(point.id)}
            />
          ))}
          {done.length > 0 ? (
            <div className="mt-6">
              <div className="flex items-center gap-2 border-b border-border pb-2 text-xs font-semibold text-muted">
                <Check size={14} /> 已清理 · {done.length}
              </div>
              {done.map((point) => (
                <ChapterRow
                  key={point.id}
                  chapter={point}
                  onToggle={() => toggleChapter(point.id)}
                  onEdit={() => setChapterModal(point)}
                  onDelete={() => confirm(`删除知识点「${point.title}」？`) && deleteChapter(point.id)}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}

      <button
        onClick={() => {
          if (confirm(`确定删除「${subject.name}」和全部知识点吗？`)) {
            deleteSubject(id);
            router.push('/subjects');
          }
        }}
        className="mt-10 flex min-h-11 items-center gap-2 text-sm text-danger"
      >
        <Trash2 size={15} /> 删除这门课程
      </button>

      <Modal open={chapterModal !== null} onClose={() => setChapterModal(null)} title={chapterModal === 'new' ? '添加知识点' : '编辑知识点'}>
        {chapterModal ? (
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
      <Modal open={editingSubject} onClose={() => setEditingSubject(false)} title="编辑课程">
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
