import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AuthHeaderProps = {
  title: ReactNode;
  subtitle: string;
  className?: string;
  titleClassName?: string;
};

export function AuthHeader({ className, subtitle, title, titleClassName }: AuthHeaderProps) {
  return (
    <header className={cn('text-right', className)}>
      <h1
        className={cn(
          'm-0 text-balance font-extrabold leading-[1.42] tracking-[-0.025em] text-foreground',
          titleClassName,
        )}
      >
        {title}
      </h1>
      <p className="mt-3 text-[15px] leading-6 text-muted-foreground">{subtitle}</p>
    </header>
  );
}
