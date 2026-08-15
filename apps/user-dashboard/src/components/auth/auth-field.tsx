import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InlineError } from '@/components/errors/inline-error';
import { cn } from '@/lib/utils';

export type AuthFieldProps = Omit<ComponentProps<typeof Input>, 'id'> & {
  id: string;
  icon: LucideIcon;
  label: string;
  error?: string;
  trailing?: ReactNode;
};

export function AuthField({
  className,
  error,
  icon: Icon,
  id,
  label,
  trailing,
  ...props
}: AuthFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1.5">
      <div className="group relative">
        <Label className="sr-only" htmlFor={id}>
          {label}
        </Label>
        <Input
          aria-describedby={error ? errorId : props['aria-describedby']}
          aria-invalid={Boolean(error)}
          className={cn(
            'auth-field-control h-[54px] rounded-[14px] border-border bg-background pr-12 text-right shadow-none transition-colors focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/10',
            trailing ? 'pl-12' : 'pl-[18px]',
            className,
          )}
          dir="rtl"
          id={id}
          {...props}
        />
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
          strokeWidth={1.8}
        />
        {trailing}
      </div>
      <InlineError className="m-0 px-1 text-xs leading-4" id={errorId} message={error} />
    </div>
  );
}
