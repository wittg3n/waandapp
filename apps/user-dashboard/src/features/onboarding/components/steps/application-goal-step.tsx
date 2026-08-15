import { Check, MapPin } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';

import { InlineError } from '@/components/errors/inline-error';
import { cn } from '@/lib/utils';

import { OnboardingSelect } from '../onboarding-field';
import {
  academicFieldOptionGroups,
  createIntakeOptions,
  targetCountryOptions,
  targetDegreeOptions,
} from '../onboarding-options';
import { OnboardingStepHeading } from '../onboarding-step-heading';
import type { OnboardingFormValues } from '../../schemas/onboarding-schema';

const intakeOptions = createIntakeOptions();

function intakeToValue(intake: OnboardingFormValues['intake']): string {
  if (intake.term === '' || intake.term === 'undecided') return intake.term;
  return `${intake.term}-${intake.year ?? ''}`;
}

function valueToIntake(value: string): OnboardingFormValues['intake'] {
  if (value === 'undecided') return { term: 'undecided', year: null };
  const [term, year] = value.split('-');
  return { term: term === 'spring' ? 'spring' : 'fall', year: Number(year) };
}

export function ApplicationGoalStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();
  const intakeError =
    errors.intake?.message ?? errors.intake?.term?.message ?? errors.intake?.year?.message;

  return (
    <div>
      <OnboardingStepHeading
        description="هدفتان را مشخص کنید تا پیشنهاد دانشگاه و برنامه تحصیلی از همین ابتدا دقیق‌تر باشد."
        icon={MapPin}
        title="هدف اپلای"
      />
      <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:gap-x-4">
        <div className="col-span-2">
          <Controller
            control={control}
            name="targetFieldId"
            render={({ field }) => (
              <OnboardingSelect
                error={errors.targetFieldId?.message}
                groups={academicFieldOptionGroups}
                id="target-field"
                label="رشته یا حوزه موردنظر"
                name={field.name}
                onBlur={field.onBlur}
                onValueChange={field.onChange}
                placeholder="رشته هدف را انتخاب کنید"
                triggerRef={field.ref}
                value={field.value}
              />
            )}
          />
        </div>
        <Controller
          control={control}
          name="targetDegree"
          render={({ field }) => (
            <OnboardingSelect
              error={errors.targetDegree?.message}
              id="target-degree"
              label="مقطع موردنظر"
              name={field.name}
              onBlur={field.onBlur}
              onValueChange={field.onChange}
              options={targetDegreeOptions}
              placeholder="انتخاب مقطع"
              triggerRef={field.ref}
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="intake"
          render={({ field }) => (
            <OnboardingSelect
              error={intakeError}
              id="target-intake"
              label="زمان شروع تحصیل"
              name={field.name}
              onBlur={field.onBlur}
              onValueChange={(value) => field.onChange(valueToIntake(value))}
              options={intakeOptions}
              placeholder="انتخاب ورودی"
              triggerRef={field.ref}
              value={intakeToValue(field.value)}
            />
          )}
        />
      </div>

      <Controller
        control={control}
        name="targetCountries"
        render={({ field }) => (
          <fieldset
            aria-describedby={errors.targetCountries ? 'target-countries-error' : undefined}
            aria-invalid={Boolean(errors.targetCountries)}
            className="mt-4 min-w-0"
          >
            <legend className="text-sm font-semibold text-foreground">کشورهای هدف</legend>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              یک یا چند مقصد را انتخاب کنید.
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {targetCountryOptions.map((country) => {
                const isSelected = field.value.includes(country.value);
                return (
                  <button
                    aria-pressed={isSelected}
                    className={cn(
                      'flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 text-xs font-semibold outline-none transition-[border-color,background-color,box-shadow,color] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 sm:text-sm',
                      isSelected
                        ? 'border-primary/45 bg-primary/[0.07] text-primary'
                        : 'border-border bg-white text-foreground hover:border-primary/25',
                    )}
                    key={country.value}
                    onBlur={field.onBlur}
                    onClick={() =>
                      field.onChange(
                        isSelected
                          ? field.value.filter((value) => value !== country.value)
                          : [...field.value, country.value],
                      )
                    }
                    type="button"
                  >
                    <span className="truncate">{country.label}</span>
                    {isSelected && (
                      <Check aria-hidden="true" className="size-3.5 shrink-0" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>
            <InlineError
              className="m-0 mt-1 px-1 text-xs leading-5"
              id="target-countries-error"
              message={errors.targetCountries?.message}
            />
          </fieldset>
        )}
      />
    </div>
  );
}
