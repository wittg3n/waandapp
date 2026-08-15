import { Check } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type CheckboxProps = Omit<ComponentProps<'input'>, 'type'>;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <span className="relative inline-flex size-[22px] shrink-0" data-slot="checkbox">
      <input
        className={cn(
          'peer size-[22px] cursor-pointer appearance-none rounded-md border border-input bg-background outline-none transition checked:border-primary checked:bg-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive',
          className,
        )}
        type="checkbox"
        {...props}
      />
      <Check
        aria-hidden="true"
        className="pointer-events-none absolute inset-[3px] size-4 stroke-[3] text-primary-foreground opacity-0 transition-opacity peer-checked:opacity-100"
      />
    </span>
  );
}
