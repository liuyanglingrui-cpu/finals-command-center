import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const VARIANTS: Record<Variant, string> = {
  primary: 'border border-white bg-white text-black hover:bg-accent',
  secondary: 'border border-border bg-card2 text-text hover:border-muted',
  ghost: 'text-muted hover:text-text',
  danger: 'border border-danger bg-transparent text-danger hover:bg-danger hover:text-black',
};

const SIZES: Record<Size, string> = {
  sm: 'h-11 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-[3px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    />
  );
}
