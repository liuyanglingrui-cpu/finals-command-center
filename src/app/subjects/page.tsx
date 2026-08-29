'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '@/lib/store';
import { subjectProgress } from '@/lib/selectors';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubjectCard } from '@/components/subjects/SubjectCard';
import { SubjectForm } from '@/components/subjects/SubjectForm';
import type { Subject } from '@/lib/types';

export default function SubjectsPage() {
  const { state, hydrated, addSubject, updateSubject, deleteSubject } = useStore();
  const [modal, setModal] = useState<Subject | 'new' | null>(null);

  if (!hydrated) return <Loading />;

  const subjects = [...state.subjects].sort((a, b) => {
    if (a.examDate && b.examDate) return a.examDate.localeCompare(b.examDate);
    if (a.examDate) return -1;
    if (b.examDate) return 1;
    return a.name.localeCompare(b.name, 'zh-CN');
  });

  return (
    <div>
      <PageHeader
        title="我的课程"
        subtitle="把知识点列出来，一个个清掉"
        action={
          <Button onClick={() => setModal('new')}>
            <Plus size={16} /> 添加科目
          </Button>
        }
      />

      {subjects.length === 0 ? (
        <EmptyState
          title="还没有科目"
          hint="先建课程，考试日期可以等公布后再补"
          action={
            <Button onClick={() => setModal('new')}>
              <Plus size={16} /> 添加科目
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {subjects.map((s) => (
            <SubjectCard
              key={s.id}
              subject={s}
              progress={subjectProgress(state, s.id)}
              onEdit={() => setModal(s)}
              onDelete={() => {
                if (confirm(`确定删除「${s.name}」及其所有章节吗？`)) deleteSubject(s.id);
              }}
            />
          ))}
        </div>
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal && modal !== 'new' ? '编辑科目' : '添加科目'}
      >
        {modal !== null ? (
          <SubjectForm
            initial={modal === 'new' ? undefined : modal}
            onCancel={() => setModal(null)}
            onSubmit={(data) => {
              if (modal === 'new') addSubject(data);
              else updateSubject(modal.id, data);
              setModal(null);
            }}
          />
        ) : null}
      </Modal>
    </div>
  );
}
