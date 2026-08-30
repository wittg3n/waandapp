import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'default' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
};

export function Button({
  className,
  size = 'default',
  type = 'button',
  variant = 'default',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'focus-visible:ring-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        size === 'icon' ? 'size-11' : 'min-h-11 px-4',
        variant === 'default' && 'bg-[#171717] text-white hover:bg-[#292929]',
        variant === 'outline' &&
          'border border-[#e2e2e4] bg-white text-[#2b2b2f] hover:bg-[#f7f7f8]',
        variant === 'ghost' && 'text-[#383838] hover:bg-black/[0.04]',
        className,
      )}
      data-slot="button"
      type={type}
      {...props}
    />
  );
}
