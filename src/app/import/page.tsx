'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CircleCheckBig, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { parseImportText, type ParsedSubject } from '@/lib/importParser';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/form';
import { ImportPreview } from '@/components/import/ImportPreview';

const SAMPLE = `微积分 6月24日上午考试
15.1 二重积分 2h
15.2 三重积分 2h
16.1 曲线积分 3h 重点
16.2 曲面积分 4h 重点
错题整理 2h
模拟卷 3h

线性代数 6月26日下午考试
秩与主元 2h
特征值与特征向量 3h 重点
相似矩阵 2h 重点
正交对角化 2h
错题整理 2h`;

export default function ImportPage() {
  const { hydrated } = useStore();
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ParsedSubject[] | null>(null);
  const [done, setDone] = useState(false);

  if (!hydrated) return <Loading />;

  // 导入成功
  if (done) {
    return (
      <div>
        <PageHeader title="Import" subtitle="智能导入" />
        <Card className="flex flex-col items-center gap-4 py-10 text-center">
          <CircleCheckBig size={40} className="text-success" />
          <div>
            <p className="text-base font-semibold text-text">导入成功！</p>
            <p className="mt-1 text-sm text-muted">科目与章节已加入，复习计划已自动更新。</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/schedule">
              <Button>
                去看复习计划 <ArrowRight size={15} />
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={() => {
                setText('');
                setParsed(null);
                setDone(false);
              }}
            >
              再导入一批
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // 解析预览
  if (parsed) {
    return (
      <div>
        <PageHeader title="Import" subtitle="解析预览 —— 确认后导入" />
        <ImportPreview
          parsed={parsed}
          onCancel={() => setParsed(null)}
          onImported={() => setDone(true)}
        />
      </div>
    );
  }

  // 文本输入
  return (
    <div>
      <PageHeader title="Import" subtitle="粘贴考试安排，自动解析成科目与章节" />
      <Card className="space-y-3">
        <p className="text-sm text-muted">
          粘贴一段考试安排和复习范围，每门科目一行（含日期/考试），其下每个章节一行（含时长，如 2h / 1.5小时）。
        </p>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={SAMPLE}
          rows={14}
          className="min-h-[280px] font-mono text-[13px] leading-6"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="secondary" onClick={() => setText(SAMPLE)}>
            填入示例
          </Button>
          <Button onClick={() => setParsed(parseImportText(text))} disabled={!text.trim()}>
            <Sparkles size={15} /> 智能解析
          </Button>
        </div>
      </Card>
    </div>
  );
}
