import { describe, expect, it } from 'vitest';
import { extractDate, extractExamTime, parseImportText } from './importParser';

const YEAR = new Date().getFullYear();

describe('考试信息解析', () => {
  it('支持中文、简写和完整日期', () => {
    expect(extractDate('微积分 6月24日上午考试')).toBe(`${YEAR}-06-24`);
    expect(extractDate('线代 6.26 下午考试')).toBe(`${YEAR}-06-26`);
    expect(extractDate('物理 2026-07-01 14:00 考试')).toBe('2026-07-01');
  });

  it('支持时段词和显式时间', () => {
    expect(extractExamTime('下午考试')).toBe('14:00');
    expect(extractExamTime('19:30 考试')).toBe('19:30');
  });
});

describe('知识点导入', () => {
  it('无需时长和考试日期也能解析', () => {
    const result = parseImportText(`课程：大学物理 B
振动与波
光学 重点
电磁学基础`);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ name: '大学物理 B', examDate: null, examTime: '' });
    expect(result[0].chapters).toEqual([
      { title: '振动与波', isImportant: false },
      { title: '光学', isImportant: true },
      { title: '电磁学基础', isImportant: false },
    ]);
  });

  it('支持课程名和考试信息分成两行', () => {
    const [subject] = parseImportText(`课程：微积分（2）
考试：2026-12-24 09:00
二重积分
三重积分`);
    expect(subject.name).toBe('微积分（2）');
    expect(subject.examDate).toBe('2026-12-24');
    expect(subject.examTime).toBe('09:00');
    expect(subject.chapters).toHaveLength(2);
  });

  it('兼容旧的考试和小时格式，但忽略小时', () => {
    const result = parseImportText(`微积分 6月24日上午考试
15.1 二重积分 2h
15.2 三重积分 2小时
16.1 曲线积分 3h 重点

线性代数 6月26日下午考试
特征值与特征向量 重点`);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('微积分');
    expect(result[0].examDate).toBe(`${YEAR}-06-24`);
    expect(result[0].chapters[0].title).toBe('15.1 二重积分');
    expect(result[0].chapters[2]).toEqual({ title: '16.1 曲线积分', isImportant: true });
    expect(result[1].examTime).toBe('14:00');
  });

  it('支持一行导入多个重点知识点', () => {
    const [subject] = parseImportText(`材料科学导论
重点知识点：晶体结构 / 相图 / 材料缺陷 / 高分子`);
    expect(subject.chapters).toHaveLength(4);
    expect(subject.chapters.every((point) => point.isImportant)).toBe(true);
  });

  it('以空行分隔多个无考试日期的课程', () => {
    const result = parseImportText(`有机化学
烷烃
烯烃

大学英语
阅读
写作`);
    expect(result.map((subject) => subject.name)).toEqual(['有机化学', '大学英语']);
  });
});
