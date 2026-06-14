import { cn } from '@/lib/cn';

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border border-border bg-card/70 p-4 shadow-sm shadow-black/20', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
