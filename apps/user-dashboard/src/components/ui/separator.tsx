import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type SeparatorProps = ComponentProps<'div'> & {
  orientation?: 'horizontal' | 'vertical';
};

export function Separator({
  className,
  orientation = 'horizontal',
  role = 'separator',
  ...props
}: SeparatorProps) {
  return (
    <div
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      data-slot="separator"
      role={role}
      {...props}
    />
  );
}
