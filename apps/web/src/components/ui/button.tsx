import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'default' | 'icon';

export function buttonVariants({
  className,
  size = 'default',
  variant = 'primary',
}: {
  className?: string | undefined;
  size?: ButtonSize | undefined;
  variant?: ButtonVariant | undefined;
} = {}) {
  return cn(
    'group/button inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 ease-out motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.97] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#143CFB] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    size === 'icon' ? 'size-11 shrink-0' : 'min-h-11 px-5 py-2.5 text-sm',
    variant === 'primary' &&
      'bg-[#171717] text-white shadow-[0_8px_22px_rgba(0,0,0,0.12)] hover:bg-[#292929]',
    variant === 'secondary' &&
      'border border-[#e8e8e8] bg-white text-[#202020] shadow-[0_5px_16px_rgba(0,0,0,0.04)] hover:bg-[#f7f7f7]',
    variant === 'ghost' && 'text-[#383838] hover:bg-black/[0.04]',
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function Button({ className, size, type = 'button', variant, ...props }: ButtonProps) {
  return <button className={buttonVariants({ className, size, variant })} type={type} {...props} />;
}
