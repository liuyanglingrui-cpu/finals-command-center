import { describe, it, expect } from 'vitest';
import {
  extractDate,
  extractExamTime,
  extractHours,
  inferDifficulty,
  inferImportance,
  inferKind,
  parseImportText,
} from './importParser';

const YEAR = new Date().getFullYear();

describe('extractHours', () => {
  it('解析 2h / 1.5h / 2小时 / 3时；无时长返回 null', () => {
    expect(extractHours('15.1 二重积分 2h')).toBe(2);
    expect(extractHours('作文模板 1.5h')).toBe(1.5);
    expect(extractHours('复习 2小时')).toBe(2);
    expect(extractHours('电磁学 3时')).toBe(3);
    expect(extractHours('微积分 6月24日上午考试')).toBeNull();
  });
});

describe('extractDate', () => {
  it('支持 6月24日 / 6.24 / 06-24 / 2026-06-24，无年份用当前年', () => {
    expect(extractDate('微积分 6月24日上午考试')).toBe(`${YEAR}-06-24`);
    expect(extractDate('线性代数 6.26 下午考试')).toBe(`${YEAR}-06-26`);
    expect(extractDate('化学 06-28 考试')).toBe(`${YEAR}-06-28`);
    expect(extractDate('物理 2026-06-30 考试')).toBe('2026-06-30');
  });
  it('无法识别 / 越界数字返回 null', () => {
    expect(extractDate('英语 期末复习')).toBeNull();
    expect(extractDate('15.1 二重积分')).toBeNull(); // 月份 15 非法
  });
});

describe('extractExamTime', () => {
  it('映射上午/下午/晚上与显式时间，默认 09:00', () => {
    expect(extractExamTime('微积分 6月24日上午考试')).toBe('09:00');
    expect(extractExamTime('线代 下午考试')).toBe('14:00');
    expect(extractExamTime('英语 晚上考试')).toBe('19:00');
    expect(extractExamTime('物理 14:00 考试')).toBe('14:00');
    expect(extractExamTime('化学 9:30 考试')).toBe('09:30');
    expect(extractExamTime('无时间科目 6月1日')).toBe('09:00');
  });
});

describe('inferDifficulty / inferImportance / inferKind', () => {
  it('难度关键词 → 高', () => {
    expect(inferDifficulty('16.1 曲线积分')).toBe('high');
    expect(inferDifficulty('特征值与特征向量')).toBe('high');
    expect(inferDifficulty('15.2 三重积分')).toBe('mid');
  });
  it('重点关键词 → true', () => {
    expect(inferImportance('16.1 曲线积分 重点')).toBe(true);
    expect(inferImportance('错题整理')).toBe(true);
    expect(inferImportance('模拟卷')).toBe(true);
    expect(inferImportance('15.2 三重积分')).toBe(false);
  });
  it('复盘类 → review', () => {
    expect(inferKind('错题整理')).toBe('review');
    expect(inferKind('模拟卷')).toBe('review');
    expect(inferKind('15.1 二重积分')).toBe('study');
  });
});

describe('parseImportText —— 样例 1：中文日期（微积分 / 线性代数）', () => {
  const text = `微积分 6月24日上午考试
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
  const result = parseImportText(text);

  it('识别两门科目及日期/时间', () => {
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('微积分');
    expect(result[0].examDate).toBe(`${YEAR}-06-24`);
    expect(result[0].examTime).toBe('09:00');
    expect(result[1].name).toBe('线性代数');
    expect(result[1].examDate).toBe(`${YEAR}-06-26`);
    expect(result[1].examTime).toBe('14:00');
  });

  it('章节时长/重点/难度/类型/标题清洗正确', () => {
    expect(result[0].chapters).toHaveLength(6);
    const c = result[0].chapters.find((x) => x.title.includes('曲线积分'))!;
    expect(c.title).toBe('16.1 曲线积分'); // 3h / 重点 已剥离
    expect(c.estimatedHours).toBe(3);
    expect(c.isImportant).toBe(true);
    expect(c.difficulty).toBe('high');
    const mock = result[0].chapters.find((x) => x.title === '模拟卷')!;
    expect(mock.kind).toBe('review');
    expect(mock.isImportant).toBe(true);
    expect(result[1].chapters.find((x) => x.title.includes('特征值'))!.difficulty).toBe('high');
  });
});

describe('parseImportText —— 样例 2：混合日期格式 + 小时/时', () => {
  const text = `化学 6.28 上午考试
反应机理 3h 重点
错题 2小时

物理 2026-07-01 14:00 考试
力学 2h
电磁学 3时`;
  const result = parseImportText(text);

  it('解析简写日期、完整日期、显式时间', () => {
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('化学');
    expect(result[0].examDate).toBe(`${YEAR}-06-28`);
    expect(result[0].examTime).toBe('09:00');
    expect(result[0].chapters[0].difficulty).toBe('high'); // 机理
    expect(result[0].chapters[1].estimatedHours).toBe(2); // 2小时
    expect(result[1].examDate).toBe('2026-07-01');
    expect(result[1].examTime).toBe('14:00');
    expect(result[1].chapters[1].estimatedHours).toBe(3); // 3时
  });
});

describe('parseImportText —— 样例 3：缺考试日期', () => {
  const text = `英语 期末复习
作文模板 1.5h
真题阅读 2h`;
  const result = parseImportText(text);

  it('examDate 为 null，章节仍正确解析', () => {
    expect(result).toHaveLength(1);
    expect(result[0].examDate).toBeNull();
    expect(result[0].chapters).toHaveLength(2);
    expect(result[0].chapters[1].title).toBe('真题阅读');
    expect(result[0].chapters[1].isImportant).toBe(true); // 真题
  });
});
