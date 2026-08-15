import { SlidersHorizontal } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';

import { OnboardingChoiceGroup } from '../onboarding-choice-group';
import { OnboardingSelect } from '../onboarding-field';
import { annualBudgetOptions, scholarshipOptions } from '../onboarding-options';
import { OnboardingStepHeading } from '../onboarding-step-heading';
import type { OnboardingFormValues } from '../../schemas/onboarding-schema';

export function PreferencesStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();

  return (
    <div>
      <OnboardingStepHeading
        description="دو اولویت اصلی را مشخص کنید تا پیشنهادها با شرایط شما هماهنگ‌تر باشند."
        icon={SlidersHorizontal}
        title="اولویت‌های اپلای"
      />
      <div className="space-y-5">
        <Controller
          control={control}
          name="annualBudget"
          render={({ field }) => (
            <OnboardingSelect
              error={errors.annualBudget?.message}
              id="annual-budget"
              label="بودجه تقریبی سالانه برای تحصیل"
              name={field.name}
              onBlur={field.onBlur}
              onValueChange={field.onChange}
              options={annualBudgetOptions}
              placeholder="بازه بودجه را انتخاب کنید"
              triggerRef={field.ref}
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="scholarshipImportance"
          render={({ field }) => (
            <OnboardingChoiceGroup
              choices={scholarshipOptions}
              className="sm:grid-cols-3"
              error={errors.scholarshipImportance?.message}
              label="بورسیه چقدر برای شما مهم است؟"
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />
      </div>
    </div>
  );
}
