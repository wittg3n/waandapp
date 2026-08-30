import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'border-input focus-visible:ring-ring h-10 w-full min-w-0 rounded-md border bg-transparent px-3 text-sm outline-none placeholder:text-[#929299] focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      data-slot="input"
      type={type}
      {...props}
    />
  );
}
