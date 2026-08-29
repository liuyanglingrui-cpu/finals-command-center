import { cn } from '@/lib/cn';

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-[3px] border border-border bg-card p-4', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
