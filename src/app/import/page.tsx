'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, CircleCheckBig, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import { parseImportText, type ParsedSubject } from '@/lib/importParser';
import { parseCourseImportText, type ParsedCourse } from '@/lib/courseImportParser';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/form';
import { ImportPreview } from '@/components/import/ImportPreview';
import { CourseImportPreview } from '@/components/import/CourseImportPreview';
import { cn } from '@/lib/cn';

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

const COURSE_SAMPLE = `微积分（2）2026春 第14-18周
周一 1-2节
周二 3-4节
周三 1-2节
周四 1-2节
周五 3-4节
重点章节：15.1 二重积分 / 15.2 三重积分 / 16.1 曲线积分 / 16.2 曲面积分

大学物理B（1） 第15-18周
周一 3-4节
周二 1-2节
周四 5-6节
周五 3-4节
重点章节：振动与波 / 光学 / 电磁学基础

材料科学导论
周三 5-6节 第14-16周
周四 7-8节 第14-16周
周五 1-2节 第15周
重点章节：晶体结构 / 相图 / 材料缺陷 / 高分子

有机化学 第15周
周四 9-10节
周五 9-10节
重点章节：烷烃 / 烯烃 / 芳香烃 / 醛酮羧酸 / 反应机理

英语科技文献阅读 第15-18周双周
周二 1-2节
周五 1-2节
（本课程你已标记：不需要纳入复习系统）

中国近现代史纲要
（未出现在本截图课表中 / 可选隐藏）`;

type ImportMode = 'review' | 'course';
type ParsedState =
  | { mode: 'review'; data: ParsedSubject[] }
  | { mode: 'course'; data: ParsedCourse[] };

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors',
        active ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-muted hover:text-text',
      )}
    >
      {children}
    </button>
  );
}

export default function ImportPage() {
  const { hydrated } = useStore();
  const [mode, setMode] = useState<ImportMode>('review');
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ParsedState | null>(null);
  const [done, setDone] = useState(false);

  if (!hydrated) return <Loading />;

  // 导入成功
  if (done) {
    return (
      <div>
        <PageHeader title="导入" subtitle="智能导入" />
        <Card className="flex flex-col items-center gap-4 py-10 text-center">
          <CircleCheckBig size={40} className="text-success" />
          <div>
            <p className="text-base font-semibold text-text">导入成功！</p>
            <p className="mt-1 text-sm text-muted">
              {mode === 'review' ? '科目与章节已加入，复习计划已自动更新。' : '课程表已保存，可在计划页查看。'}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/schedule">
              <Button>
                去看计划 <ArrowRight size={15} />
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
        <PageHeader title="导入" subtitle="解析预览，确认后写入本地数据" />
        {parsed.mode === 'review' ? (
          <ImportPreview
            parsed={parsed.data}
            onCancel={() => setParsed(null)}
            onImported={() => setDone(true)}
          />
        ) : (
          <CourseImportPreview
            parsed={parsed.data}
            onCancel={() => setParsed(null)}
            onImported={() => setDone(true)}
          />
        )}
      </div>
    );
  }

  // 文本输入
  return (
    <div>
      <PageHeader title="导入" subtitle="粘贴文本，自动解析考试复习或课程表" />
      <Card className="space-y-3">
        <div className="flex rounded-lg border border-white/10 bg-card2/70 p-1">
          <ModeButton
            active={mode === 'review'}
            onClick={() => {
              setMode('review');
              setText('');
            }}
          >
            <Sparkles size={15} /> 考试复习
          </ModeButton>
          <ModeButton
            active={mode === 'course'}
            onClick={() => {
              setMode('course');
              setText('');
            }}
          >
            <CalendarDays size={15} /> 课程表
          </ModeButton>
        </div>
        <p className="text-sm text-muted">
          {mode === 'review'
            ? '粘贴考试安排和复习范围：科目行包含日期/考试，章节行包含时长，如 2h / 1.5小时。'
            : '粘贴课程表：课程名一行，下面写周几第几节，可选重点章节和“不纳入复习系统”等标记。'}
        </p>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={mode === 'review' ? SAMPLE : COURSE_SAMPLE}
          rows={14}
          className="min-h-[280px] font-mono text-[13px] leading-6"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button variant="secondary" onClick={() => setText(mode === 'review' ? SAMPLE : COURSE_SAMPLE)}>
            填入示例
          </Button>
          <Button
            onClick={() =>
              setParsed(
                mode === 'review'
                  ? { mode: 'review', data: parseImportText(text) }
                  : { mode: 'course', data: parseCourseImportText(text) },
              )
            }
            disabled={!text.trim()}
          >
            <Sparkles size={15} /> 智能解析
          </Button>
        </div>
      </Card>
    </div>
  );
}
