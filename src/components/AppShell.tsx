'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, Settings, Upload } from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV = [
  { href: '/', label: '总览', icon: LayoutDashboard },
  { href: '/subjects', label: '课程', icon: BookOpen },
  { href: '/import', label: '导入', icon: Upload },
  { href: '/settings', label: '设置', icon: Settings },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto min-h-dvh w-full max-w-[720px] border-x border-border bg-bg">
        <div className="border-b border-border px-4 py-3">
          <Link href="/" className="text-sm font-bold tracking-normal text-text">学习作战室</Link>
        </div>
        <main className="px-4 pb-28 pt-5">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto grid h-[72px] max-w-[720px] grid-cols-4 border-x border-t border-border bg-bg">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-h-11 flex-col items-center justify-center gap-1 text-[11px] font-medium',
                  active ? 'bg-white text-black' : 'text-muted hover:text-text',
                )}
              >
                <Icon size={19} strokeWidth={active ? 2.5 : 2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
