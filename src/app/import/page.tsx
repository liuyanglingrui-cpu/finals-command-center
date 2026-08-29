'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ClipboardPaste } from 'lucide-react';
import { parseImportText, type ParsedSubject } from '@/lib/importParser';
import { useStore } from '@/lib/store';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/form';
import { ImportPreview } from '@/components/import/ImportPreview';

const SAMPLE = `课程：微积分（2）
考试：2026-12-24 09:00
15.1 二重积分
15.2 三重积分
16.1 曲线积分 重点
16.2 曲面积分 重点

课程：大学物理 B
振动与波
光学 重点
电磁学基础`;

export default function ImportPage() {
  const { hydrated } = useStore();
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ParsedSubject[] | null>(null);
  const [done, setDone] = useState(false);

  if (!hydrated) return <Loading />;
  if (done) {
    return (
      <div>
        <PageHeader title="导入完成" subtitle="课程和知识点已经写入清单" />
        <Card className="py-10 text-center">
          <Check size={36} className="mx-auto text-success" />
          <p className="mt-4 font-semibold text-text">可以开始一个个清理了</p>
          <Link href="/subjects" className="mt-5 inline-block"><Button>打开课程 <ArrowRight size={15} /></Button></Link>
        </Card>
      </div>
    );
  }
  if (parsed) {
    return (
      <div>
        <PageHeader title="确认导入" subtitle="检查名称、考试时间和重点标记" />
        <ImportPreview parsed={parsed} onCancel={() => setParsed(null)} onImported={() => setDone(true)} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="格式导入" subtitle="一次粘贴多门课程和全部知识点" />
      <Card>
        <div className="mb-4 border-l-2 border-white pl-3 text-xs leading-5 text-muted">
          每门课程用空行分隔。第一行写课程名，考试日期可选；下面每行一个知识点，末尾写“重点”即可标记。
        </div>
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={SAMPLE}
          rows={16}
          className="min-h-[340px] font-mono text-[13px] leading-6"
        />
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button variant="secondary" onClick={() => setText(SAMPLE)}>填入格式示例</Button>
          <Button disabled={!text.trim()} onClick={() => setParsed(parseImportText(text))}>
            <ClipboardPaste size={15} /> 解析内容
          </Button>
        </div>
      </Card>
    </div>
  );
}
