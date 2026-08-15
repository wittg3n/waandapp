import { GraduationCap } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';

import { OnboardingField, OnboardingSelect } from '../onboarding-field';
import {
  academicFieldOptionGroups,
  degreeOptions,
  gradeScaleOptions,
  studyStatusOptions,
  universityOptionGroups,
} from '../onboarding-options';
import { OnboardingStepHeading } from '../onboarding-step-heading';
import type { OnboardingFormValues } from '../../schemas/onboarding-schema';

export function EducationStep() {
  const {
    control,
    formState: { errors },
    getValues,
    register,
    trigger,
    watch,
  } = useFormContext<OnboardingFormValues>();
  const gradeScale = watch('gradeScale');
  const gradeMaximum = gradeScale === '' ? undefined : Number(gradeScale);

  return (
    <div>
      <OnboardingStepHeading
        description="اطلاعات پایه تحصیلی شما به وآند کمک می‌کند پیشنهادهای دقیق‌تری پیدا کند."
        icon={GraduationCap}
        title="اطلاعات تحصیلی"
      />
      <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:gap-x-4">
        <Controller
          control={control}
          name="currentDegree"
          render={({ field }) => (
            <OnboardingSelect
              error={errors.currentDegree?.message}
              id="current-degree"
              label="آخرین مقطع تحصیلی"
              name={field.name}
              onBlur={field.onBlur}
              onValueChange={field.onChange}
              options={degreeOptions}
              placeholder="انتخاب مقطع"
              triggerRef={field.ref}
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="fieldId"
          render={({ field }) => (
            <OnboardingSelect
              error={errors.fieldId?.message}
              groups={academicFieldOptionGroups}
              id="field-of-study"
              label="رشته تحصیلی"
              name={field.name}
              onBlur={field.onBlur}
              onValueChange={field.onChange}
              placeholder="انتخاب رشته"
              triggerRef={field.ref}
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="universityId"
          render={({ field }) => (
            <OnboardingSelect
              error={errors.universityId?.message}
              groups={universityOptionGroups}
              id="university"
              label="دانشگاه"
              name={field.name}
              onBlur={field.onBlur}
              onValueChange={field.onChange}
              placeholder="انتخاب دانشگاه"
              triggerRef={field.ref}
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="studyStatus"
          render={({ field }) => (
            <OnboardingSelect
              error={errors.studyStatus?.message}
              id="study-status"
              label="وضعیت تحصیل"
              name={field.name}
              onBlur={field.onBlur}
              onValueChange={field.onChange}
              options={studyStatusOptions}
              placeholder="انتخاب وضعیت"
              triggerRef={field.ref}
              value={field.value}
            />
          )}
        />
        <OnboardingField
          autoComplete="off"
          error={errors.gradeAverage?.message}
          id="grade-average"
          inputMode="decimal"
          label="معدل"
          max={gradeMaximum}
          min={0}
          placeholder="مثلاً ۱۷.۵"
          step="0.01"
          type="number"
          {...register('gradeAverage')}
        />
        <Controller
          control={control}
          name="gradeScale"
          render={({ field }) => (
            <OnboardingSelect
              error={errors.gradeScale?.message}
              id="grade-scale"
              label="سیستم نمره"
              name={field.name}
              onBlur={field.onBlur}
              onValueChange={(value) => {
                field.onChange(value);
                if (getValues('gradeAverage').trim()) void trigger('gradeAverage');
              }}
              options={gradeScaleOptions}
              placeholder="انتخاب سیستم"
              triggerRef={field.ref}
              value={field.value}
            />
          )}
        />
      </div>
    </div>
  );
}
