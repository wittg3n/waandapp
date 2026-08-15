import type { ComponentProps, Ref } from 'react';

import { InlineError } from '@/components/errors/inline-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type FieldProps = Omit<ComponentProps<typeof Input>, 'id'> & {
  error?: string;
  id: string;
  label: string;
};

export function OnboardingField({ className, error, id, label, ...props }: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="min-w-0 space-y-1.5">
      <Label className="block truncate text-sm font-semibold" htmlFor={id} title={label}>
        {label}
      </Label>
      <Input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className={cn('h-11 rounded-xl text-right text-sm shadow-none', className)}
        dir="ltr"
        id={id}
        {...props}
      />
      <InlineError className="m-0 px-1 text-xs leading-5" id={errorId} message={error} />
    </div>
  );
}

export type SelectOption = { label: string; value: string };
export type SelectOptionGroup = { label: string; options: readonly SelectOption[] };

type SelectFieldProps = {
  className?: string;
  error?: string;
  groups?: readonly SelectOptionGroup[];
  id: string;
  label: string;
  name?: string;
  onBlur?: () => void;
  onValueChange: (value: string) => void;
  options?: readonly SelectOption[];
  placeholder: string;
  triggerRef?: Ref<HTMLButtonElement>;
  value: string;
};

export function OnboardingSelect({
  className,
  error,
  groups,
  id,
  label,
  name,
  onBlur,
  onValueChange,
  options,
  placeholder,
  triggerRef,
  value,
}: SelectFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="min-w-0 space-y-1.5">
      <Label className="block truncate text-sm font-semibold" htmlFor={id} title={label}>
        {label}
      </Label>
      <Select dir="rtl" name={name} onValueChange={onValueChange} value={value}>
        <SelectTrigger
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className={className}
          id={id}
          onBlur={onBlur}
          ref={triggerRef}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {groups?.map((group, groupIndex) => (
            <SelectGroup key={group.label}>
              {groupIndex > 0 && <SelectSeparator />}
              <SelectLabel>{group.label}</SelectLabel>
              {group.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
          {options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <InlineError className="m-0 px-1 text-xs leading-5" id={errorId} message={error} />
    </div>
  );
}
