'use client';

import { useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { DEFAULT_USER_NAME } from '@/lib/constants';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form';

function NameField({ value, onCommit }: { value: string; onCommit: (name: string) => void }) {
  const [name, setName] = useState(value);
  return (
    <Input
      value={name}
      maxLength={12}
      placeholder={DEFAULT_USER_NAME}
      onChange={(event) => {
        setName(event.target.value);
        onCommit(event.target.value);
      }}
    />
  );
}

export default function SettingsPage() {
  const { state, hydrated, setUserName, resetToSample, clearAll } = useStore();
  if (!hydrated) return <Loading />;

  return (
    <div>
      <PageHeader title="设置" subtitle="称呼和本地数据" />
      <div className="space-y-4">
        <Card>
          <h2 className="text-sm font-semibold text-text">昵称</h2>
          <p className="mb-3 mt-1 text-xs text-muted">用于首页问候，留空时显示“{DEFAULT_USER_NAME}”。</p>
          <NameField key={state.userName} value={state.userName} onCommit={setUserName} />
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-text">数据管理</h2>
          <p className="mb-4 mt-1 text-xs leading-5 text-muted">数据只保存在当前浏览器，不会上传到服务器。</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => confirm('用示例数据覆盖当前内容？') && resetToSample()}>
              <RotateCcw size={15} />恢复示例
            </Button>
            <Button variant="danger" onClick={() => confirm('清空全部课程和知识点？此操作无法恢复。') && clearAll()}>
              <Trash2 size={15} />清空数据
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
