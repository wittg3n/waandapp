import { Check } from 'lucide-react';

import { InlineError } from '@/components/errors/inline-error';
import { cn } from '@/lib/utils';

type Choice = {
  description?: string;
  label: string;
  value: string;
};

export function OnboardingChoiceGroup({
  choices,
  className,
  error,
  label,
  name,
  onBlur,
  onChange,
  value,
}: {
  choices: readonly Choice[];
  className?: string;
  error?: string;
  label: string;
  name: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  value?: string;
}) {
  const errorId = `${name}-error`;

  return (
    <fieldset
      aria-describedby={error ? errorId : undefined}
      aria-invalid={Boolean(error)}
      className="min-w-0"
    >
      <legend className="text-sm font-semibold text-foreground">{label}</legend>
      <div className={cn('mt-3 grid gap-3 sm:grid-cols-2', className)}>
        {choices.map((choice) => {
          const isSelected = value === choice.value;

          return (
            <label
              className={cn(
                'flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-right text-sm outline-none transition-[border-color,background-color,box-shadow] focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/10',
                isSelected
                  ? 'border-primary/45 bg-primary/[0.06] font-semibold text-primary'
                  : 'border-border bg-background text-foreground hover:border-primary/25 hover:bg-muted/50',
              )}
              key={choice.value}
            >
              <input
                checked={isSelected}
                className="sr-only"
                name={name}
                onBlur={onBlur}
                onChange={() => onChange(choice.value)}
                type="radio"
                value={choice.value}
              />
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-5 shrink-0 place-items-center rounded-full border',
                  isSelected ? 'border-primary bg-primary text-white' : 'border-input bg-white',
                )}
              >
                {isSelected && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span>
                <span className="block">{choice.label}</span>
                {choice.description && (
                  <span className="mt-0.5 block text-xs font-normal leading-5 text-muted-foreground">
                    {choice.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      <InlineError className="m-0 mt-2 px-1 text-xs" id={errorId} message={error} />
    </fieldset>
  );
}
