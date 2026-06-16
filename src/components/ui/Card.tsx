import { cn } from '@/lib/cn';

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg border border-white/5 bg-card/78 p-4 shadow-sm shadow-black/25', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
