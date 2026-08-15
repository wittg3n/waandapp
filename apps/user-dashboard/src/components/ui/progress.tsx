import * as ProgressPrimitive from '@radix-ui/react-progress';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export function Progress({
  className,
  max = 100,
  value = 0,
  ...props
}: ComponentProps<typeof ProgressPrimitive.Root>) {
  const safeMax = max > 0 ? max : 100;
  const safeValue = Math.min(safeMax, Math.max(0, value ?? 0));

  return (
    <ProgressPrimitive.Root
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/10', className)}
      data-slot="progress"
      max={safeMax}
      value={safeValue}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
        data-slot="progress-indicator"
        style={{ width: `${(safeValue / safeMax) * 100}%` }}
      />
    </ProgressPrimitive.Root>
  );
}
