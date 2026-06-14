'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  NotebookPen,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/subjects', label: 'Subjects', icon: GraduationCap },
  { href: '/import', label: 'Import', icon: Sparkles },
  { href: '/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/review', label: 'Review', icon: NotebookPen },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-full md:flex">
      {/* 桌面端左侧导航 */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-card2/60 px-4 py-6 backdrop-blur md:flex">
        <div className="mb-8 px-2">
          <div className="text-lg font-semibold leading-tight text-primary">期末作战室</div>
          <div className="mt-0.5 text-xs text-muted">Finals Command Center</div>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  active ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-white/5 hover:text-text',
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-2 text-[11px] text-muted/60">本地存储 · 无需登录</div>
      </aside>

      {/* 主区域 */}
      <div className="min-w-0 flex-1 md:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-bg/80 px-4 backdrop-blur md:hidden">
          <span className="font-semibold text-primary">期末作战室</span>
          <span className="text-xs text-muted">Finals Command Center</span>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 md:px-8 md:pb-10 md:pt-8">
          {children}
        </main>
      </div>

      {/* 移动端底部导航 */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card2/95 backdrop-blur md:hidden">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors',
                active ? 'text-primary' : 'text-muted',
              )}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
