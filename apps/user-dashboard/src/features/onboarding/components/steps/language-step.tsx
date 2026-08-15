import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';

import { OnboardingChoiceGroup } from '../onboarding-choice-group';
import { OnboardingField, OnboardingSelect } from '../onboarding-field';
import {
  languageCertificateConfig,
  languageCertificateOptions,
} from '../onboarding-options';
import { OnboardingStepHeading } from '../onboarding-step-heading';
import {
  emptyLanguageCertificate,
  type OnboardingFormValues,
} from '../../schemas/onboarding-schema';

const certificateChoices = [
  { label: 'بله، مدرک دارم', value: 'true' },
  { label: 'فعلاً مدرک ندارم', value: 'false' },
] as const;

export function LanguageStep() {
  const reduceMotion = useReducedMotion();
  const {
    clearErrors,
    control,
    formState: { errors },
    getValues,
    register,
    setValue,
    watch,
  } = useFormContext<OnboardingFormValues>();
  const hasCertificate = watch('hasLanguageCertificate');
  const certificate = watch('languageCertificates.0');
  const certificateConfig = certificate?.type
    ? languageCertificateConfig[certificate.type]
    : undefined;
  const certificateErrors = errors.languageCertificates?.[0];

  function chooseCertificateStatus(value: string, onChange: (value: boolean) => void) {
    const nextValue = value === 'true';
    onChange(nextValue);
    if (nextValue && getValues('languageCertificates').length === 0) {
      setValue('languageCertificates', [{ ...emptyLanguageCertificate }], { shouldDirty: true });
    }
    if (!nextValue) {
      setValue('languageCertificates', [], { shouldDirty: true, shouldValidate: true });
    }
  }

  return (
    <div>
      <OnboardingStepHeading
        description="وضعیت فعلی زبانتان را بگویید؛ بعداً می‌توانید مدرک‌های بیشتری به پروفایل اضافه کنید."
        icon={Languages}
        title="مدرک زبان"
      />
      <Controller
        control={control}
        name="hasLanguageCertificate"
        render={({ field }) => (
          <OnboardingChoiceGroup
            choices={certificateChoices}
            error={errors.hasLanguageCertificate?.message}
            label="آیا مدرک زبان دارید؟"
            name={field.name}
            onBlur={field.onBlur}
            onChange={(value) => chooseCertificateStatus(value, field.onChange)}
            value={field.value === null ? undefined : String(field.value)}
          />
        )}
      />

      <AnimatePresence initial={false} mode="wait">
        {hasCertificate === true && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 grid gap-4 sm:grid-cols-2"
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            key="certificate-fields"
            transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }}
          >
            <Controller
              control={control}
              name="languageCertificates.0.type"
              render={({ field }) => (
                <OnboardingSelect
                  error={certificateErrors?.type?.message}
                  id="language-certificate"
                  label="مدرک"
                  name={field.name}
                  onBlur={field.onBlur}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue('languageCertificates.0.score', '', { shouldDirty: true });
                    setValue('languageCertificates.0.level', '', { shouldDirty: true });
                    clearErrors([
                      'languageCertificates.0.score',
                      'languageCertificates.0.level',
                    ]);
                  }}
                  options={languageCertificateOptions}
                  placeholder="نوع مدرک را انتخاب کنید"
                  triggerRef={field.ref}
                  value={field.value}
                />
              )}
            />

            {certificateConfig?.kind === 'level' && certificateConfig.options && (
              <Controller
                control={control}
                name="languageCertificates.0.level"
                render={({ field }) => (
                  <OnboardingSelect
                    error={certificateErrors?.level?.message}
                    id="language-level"
                    label={certificateConfig.label}
                    name={field.name}
                    onBlur={field.onBlur}
                    onValueChange={field.onChange}
                    options={certificateConfig.options}
                    placeholder={certificateConfig.placeholder}
                    triggerRef={field.ref}
                    value={field.value}
                  />
                )}
              />
            )}

            {certificateConfig?.kind === 'score' && (
              <OnboardingField
                error={certificateErrors?.score?.message}
                id="language-score"
                inputMode="decimal"
                label={certificateConfig.label}
                max={certificateConfig.maximum}
                min={certificateConfig.minimum}
                placeholder={certificateConfig.placeholder}
                step={certificateConfig.step}
                type="number"
                {...register('languageCertificates.0.score')}
              />
            )}
          </motion.div>
        )}

        {hasCertificate === false && (
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-xl border border-primary/10 bg-primary/[0.035] px-4 py-3 text-sm leading-6 text-muted-foreground"
            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
            key="no-certificate-note"
          >
            مشکلی نیست؛ بدون مدرک هم می‌توانید ادامه دهید و بعداً وضعیت زبانتان را کامل کنید.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
