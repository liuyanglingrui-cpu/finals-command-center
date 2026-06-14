// 轻量唯一 id 生成器（仅在事件回调 / 初始化中调用，不在渲染期使用）
let counter = 0;

export function uid(prefix = 'id'): string {
  counter += 1;
  const t = Date.now().toString(36);
  const c = counter.toString(36);
  const r = Math.random().toString(36).slice(2, 6);
  return `${prefix}_${t}${c}${r}`;
}
