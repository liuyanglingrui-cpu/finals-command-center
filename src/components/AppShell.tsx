'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BatteryFull,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Clock3,
  Download,
  LayoutDashboard,
  Signal,
  Settings,
  Sparkles,
  Target,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: '/', label: '今日', icon: LayoutDashboard },
  { href: '/subjects', label: '科目', icon: Sparkles },
  { href: '/schedule', label: '计划', icon: CalendarDays },
  { href: '/import', label: '导入', icon: Download },
  { href: '/settings', label: '设置', icon: Settings },
];

const FEATURES = [
  { icon: Sparkles, title: '智能规划', text: '自动生成最优复习计划' },
  { icon: Target, title: '可视化进度', text: '清晰掌握学习进度和薄弱环节' },
  { icon: ChartNoAxesColumnIncreasing, title: '多维度分析', text: '学习数据深度分析与建议' },
  { icon: Clock3, title: '个性化调整', text: '根据实际情况灵活调整计划' },
];

const PALETTE = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#1F2937', '#374151'];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-full bg-bg lg:flex lg:items-center lg:justify-center lg:gap-8 lg:p-6">
      <aside className="hidden w-[320px] shrink-0 lg:block">
        <div className="mb-10 flex items-center gap-5">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-primary to-accent shadow-2xl shadow-primary/30">
            <Target size={44} className="text-white" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-normal text-text">期末作战室</div>
            <div className="mt-2 text-base text-muted">科学规划，高效备考</div>
          </div>
        </div>

        <div className="space-y-7">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex gap-4">
                <div className="mt-1 grid h-6 w-6 shrink-0 place-items-center text-muted">
                  <Icon size={22} />
                </div>
                <div>
                  <div className="text-lg font-semibold text-text">{feature.title}</div>
                  <div className="mt-1 text-sm leading-6 text-muted">{feature.text}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <div className="mb-3 text-sm font-semibold text-text">配色方案</div>
          <div className="grid grid-cols-2 gap-3">
            {PALETTE.map((color) => (
              <div key={color} className="flex items-center gap-2 text-sm text-text">
                <span className="h-7 w-7 rounded-md shadow-lg" style={{ backgroundColor: color }} />
                <span>{color}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-bg lg:h-[812px] lg:min-h-0 lg:w-[390px] lg:rounded-[30px] lg:border lg:border-white/15 lg:shadow-2xl lg:shadow-black/50">
        <header className="hidden h-11 shrink-0 items-center justify-between px-8 text-xs font-semibold text-text lg:flex">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal size={15} />
            <Wifi size={15} />
            <BatteryFull size={18} />
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 pt-5">
          {children}
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card2/95 backdrop-blur lg:absolute">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted',
                )}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="pointer-events-none absolute bottom-1 left-1/2 hidden h-1 w-28 -translate-x-1/2 rounded-full bg-white lg:block" />
      </div>
    </div>
  );
}
