import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type InlineErrorProps = HTMLAttributes<HTMLParagraphElement> & {
  message?: ReactNode;
};

export function InlineError({ children, className, message, ...props }: InlineErrorProps) {
  const content = message ?? children;

  if (content === null || content === undefined || content === false) return null;

  return (
    <p
      aria-live="polite"
      className={cn('mt-1.5 text-right text-sm leading-6 text-[#b42318]', className)}
      role="alert"
      {...props}
    >
      {content}
    </p>
  );
}
