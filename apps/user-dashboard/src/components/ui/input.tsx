import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type InputProps = ComponentProps<'input'>;

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'flex h-14 w-full rounded-[14px] border border-input bg-background px-4 text-base text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.02)] outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 hover:border-muted-foreground/40 focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/[0.08] aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive/15 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      data-slot="input"
      type={type}
      {...props}
    />
  );
}
