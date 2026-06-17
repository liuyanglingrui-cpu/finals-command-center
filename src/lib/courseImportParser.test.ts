import { describe, expect, it } from 'vitest';
import { findCourseConflicts, parseCourseImportText } from './courseImportParser';
import { allCourseWeeks } from './courseWeeks';

const SAMPLE = `微积分（2）2026春
周一 1-2节
周二 3-4节
周三 1-2节
周四 1-2节
周五 3-4节
重点章节：15.1 二重积分 / 15.2 三重积分 / 16.1 曲线积分 / 16.2 曲面积分

大学物理B（1）
周一 3-4节
周二 1-2节
周四 5-6节
周五 3-4节
重点章节：振动与波 / 光学 / 电磁学基础

材料科学导论
周三 5-6节
周四 7-8节
周五 1-2节
重点章节：晶体结构 / 相图 / 材料缺陷 / 高分子

有机化学
周四 9-10节
周五 9-10节
重点章节：烷烃 / 烯烃 / 芳香烃 / 醛酮羧酸 / 反应机理

英语科技文献阅读
周二 1-2节
周五 1-2节
（本课程你已标记：不需要纳入复习系统）

中国近现代史纲要
（未出现在本截图课表中 / 可选隐藏）`;

describe('parseCourseImportText', () => {
  it('解析多门课程、学期、多个星期节次和重点章节', () => {
    const courses = parseCourseImportText(SAMPLE);
    const weeks = allCourseWeeks();

    expect(courses).toHaveLength(6);
    expect(courses[0]).toMatchObject({
      name: '微积分（2）',
      term: '2026春',
      keyTopics: ['15.1 二重积分', '15.2 三重积分', '16.1 曲线积分', '16.2 曲面积分'],
      hidden: false,
      excludedFromReview: false,
    });
    expect(courses[0].meetings).toEqual([
      { weekday: 1, startSection: 1, endSection: 2, weeks },
      { weekday: 2, startSection: 3, endSection: 4, weeks },
      { weekday: 3, startSection: 1, endSection: 2, weeks },
      { weekday: 4, startSection: 1, endSection: 2, weeks },
      { weekday: 5, startSection: 3, endSection: 4, weeks },
    ]);
  });

  it('没有重点章节也能录入课程', () => {
    const [course] = parseCourseImportText(`体育
周一 7-8节`);

    expect(course.name).toBe('体育');
    expect(course.keyTopics).toEqual([]);
    expect(course.meetings).toEqual([{ weekday: 1, startSection: 7, endSection: 8, weeks: allCourseWeeks() }]);
  });

  it('解析课程级周次、节次级周次、离散周次和单双周', () => {
    const courses = parseCourseImportText(`第15周
微积分
周一 1-2节

线性代数 第14-18周
周二 3-4节

大学物理
周三 5-6节 第1、3、5周

有机化学 第1-16周单周
周四 1-2节
第2-16周双周 周五 3-4节`);

    expect(courses[0].meetings[0].weeks).toEqual([15]);
    expect(courses[1].meetings[0].weeks).toEqual([14, 15, 16, 17, 18]);
    expect(courses[2].meetings[0].weeks).toEqual([1, 3, 5]);
    expect(courses[3].meetings[0].weeks).toEqual([1, 3, 5, 7, 9, 11, 13, 15]);
    expect(courses[3].meetings[1].weeks).toEqual([2, 4, 6, 8, 10, 12, 14, 16]);
  });

  it('识别不纳入复习系统和可选隐藏课程', () => {
    const courses = parseCourseImportText(SAMPLE);
    const english = courses.find((course) => course.name === '英语科技文献阅读');
    const history = courses.find((course) => course.name === '中国近现代史纲要');

    expect(english?.excludedFromReview).toBe(true);
    expect(english?.hidden).toBe(false);
    expect(history?.hidden).toBe(true);
    expect(history?.meetings).toEqual([]);
  });
});

describe('findCourseConflicts', () => {
  it('检测同一节次冲突并忽略隐藏课程', () => {
    const courses = parseCourseImportText(SAMPLE);
    const conflicts = findCourseConflicts(courses);

    expect(conflicts).toContainEqual({
      weeks: allCourseWeeks(),
      weekday: 2,
      startSection: 1,
      endSection: 2,
      courseNames: ['大学物理B（1）', '英语科技文献阅读'],
    });
    expect(conflicts).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ courseNames: expect.arrayContaining(['中国近现代史纲要']) }),
      ]),
    );
  });

  it('只在同一周次内检测冲突', () => {
    const courses = parseCourseImportText(`A 第1周
周一 1-2节

B 第2周
周一 1-2节

C 第2周
周一 2-3节`);

    expect(findCourseConflicts(courses, 1)).toEqual([]);
    expect(findCourseConflicts(courses, 2)).toEqual([
      {
        weeks: [2],
        weekday: 1,
        startSection: 2,
        endSection: 2,
        courseNames: ['B', 'C'],
      },
    ]);
    expect(findCourseConflicts(courses)).toEqual([
      {
        weeks: [2],
        weekday: 1,
        startSection: 2,
        endSection: 2,
        courseNames: ['B', 'C'],
      },
    ]);
  });
});
