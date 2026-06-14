'use client';

import { useState } from 'react';
import { RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form';
import { AvailabilityEditor } from '@/components/settings/AvailabilityEditor';

function HoursField({ value, onCommit }: { value: number; onCommit: (n: number) => void }) {
  const [val, setVal] = useState(String(value));
  function commit() {
    const n = Number(val);
    if (Number.isFinite(n) && n >= 0 && n !== value) onCommit(Math.round(n * 10) / 10);
    else setVal(String(value));
  }
  return (
    <div className="relative w-32">
      <Input
        type="number"
        min="0"
        step="0.5"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        className="pr-7"
      />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted">
        h
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const { state, hydrated, setDefaultHours, regenerate, resetToSample, clearAll } = useStore();

  if (!hydrated) return <Loading />;

  return (
    <div>
      <PageHeader title="Settings" subtitle="复习时间与数据管理" />

      <div className="space-y-5">
        <Card>
          <h2 className="mb-1 text-sm font-semibold text-text">默认每日可用时间</h2>
          <p className="mb-3 text-xs text-muted">没有单独设置的日期都使用这个值。</p>
          <HoursField key={state.defaultDailyHours} value={state.defaultDailyHours} onCommit={setDefaultHours} />
        </Card>

        <Card>
          <h2 className="mb-1 text-sm font-semibold text-text">每日可用时间</h2>
          <p className="mb-3 text-xs text-muted">逐日覆盖默认值（如考前一天调高）；修改后计划会自动重排。</p>
          <AvailabilityEditor />
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-text">数据</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={regenerate}>
              <RotateCcw size={15} /> 重新生成计划
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (confirm('用示例数据覆盖当前所有数据？')) resetToSample();
              }}
            >
              <Sparkles size={15} /> 重置为示例数据
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm('清空所有数据？此操作不可恢复。')) clearAll();
              }}
            >
              <Trash2 size={15} /> 清空所有数据
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted/70">所有数据仅保存在本机浏览器（localStorage），不会上传。</p>
        </Card>
      </div>
    </div>
  );
}
