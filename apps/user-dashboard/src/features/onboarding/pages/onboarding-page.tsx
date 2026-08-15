import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, LoaderCircle } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { FormProvider, useForm, useWatch, type FieldPath } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { AuthLogo } from '@/components/auth/auth-logo';
import { FormError } from '@/components/errors/form-error';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/auth-context';
import { authStorage } from '@/features/auth/auth-storage';
import { createProfileCompletion } from '@/features/auth/profile-completion';
import { useAppError } from '@/hooks/use-app-error';
import { cn } from '@/lib/utils';

import { OnboardingProgress } from '../components/onboarding-progress';
import {
  COMPLETION_VIEW,
  OnboardingStep,
  WELCOME_VIEW,
} from '../components/onboarding-steps';
import {
  fromInitialProfileData,
  isOnboardingStepComplete,
  onboardingDefaultValues,
  onboardingSchema,
  parseOnboardingDraftValues,
  toInitialProfileData,
  type OnboardingDataStep,
  type OnboardingFormValues,
} from '../schemas/onboarding-schema';

const dataStepLabels = ['تحصیلات', 'هدف', 'زبان', 'اولویت‌ها'] as const;
const onboardingCompletion = createProfileCompletion(true).percentage;

const stepFields = [
  [
    'currentDegree',
    'fieldId',
    'universityId',
    'studyStatus',
    'gradeAverage',
    'gradeScale',
  ],
  ['targetFieldId', 'targetDegree', 'targetCountries', 'intake'],
  ['hasLanguageCertificate', 'languageCertificates'],
  ['annualBudget', 'scholarshipImportance'],
] satisfies ReadonlyArray<ReadonlyArray<FieldPath<OnboardingFormValues>>>;

function isDataStep(view: number): view is OnboardingDataStep {
  return Number.isInteger(view) && view >= 0 && view < dataStepLabels.length;
}

function resolveInitialView(requestedView: number, values: OnboardingFormValues): number {
  if (requestedView === WELCOME_VIEW) return WELCOME_VIEW;
  if (requestedView < WELCOME_VIEW || requestedView > COMPLETION_VIEW) return WELCOME_VIEW;

  const firstIncompleteStep = ([0, 1, 2, 3] as const).find(
    (step) => !isOnboardingStepComplete(values, step),
  );
  if (firstIncompleteStep !== undefined && requestedView > firstIncompleteStep) {
    return firstIncompleteStep;
  }

  return requestedView === COMPLETION_VIEW && !onboardingSchema.safeParse(values).success
    ? firstIncompleteStep ?? dataStepLabels.length - 1
    : requestedView;
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { completeOnboarding, user } = useAuth();
  const { clearError, error, handleError } = useAppError();
  const contentRef = useRef<HTMLDivElement>(null);
  const focusView = useRef<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);
  const [initialState] = useState(() => {
    const storedDraft = user ? authStorage.getOnboardingDraft(user.email) : null;
    const draftValues = parseOnboardingDraftValues(storedDraft?.values);
    const profileValues = user?.initialProfile
      ? fromInitialProfileData(user.initialProfile)
      : onboardingDefaultValues;
    const values = draftValues ?? profileValues;
    const requestedView = draftValues ? (storedDraft?.view ?? WELCOME_VIEW) : WELCOME_VIEW;

    return {
      values,
      view: resolveInitialView(requestedView, values),
    };
  });
  const [view, setView] = useState(initialState.view);

  useEffect(() => {
    document.title = 'وآند | شروع مسیر اپلای';
  }, []);

  const form = useForm<OnboardingFormValues>({
    defaultValues: initialState.values,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: zodResolver(onboardingSchema),
  });
  const values = useWatch({ control: form.control });

  useEffect(() => {
    if (!user) return;

    authStorage.saveOnboardingDraft(user.email, { values: form.getValues(), view });
    const subscription = form.watch(() => {
      authStorage.saveOnboardingDraft(user.email, { values: form.getValues(), view });
    });

    return () => subscription.unsubscribe();
  }, [form, user, view]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      contentRef.current
        ?.querySelector<HTMLElement>('#onboarding-step-title')
        ?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const currentStepComplete = isDataStep(view)
    ? isOnboardingStepComplete(values, view)
    : view !== COMPLETION_VIEW || onboardingSchema.safeParse(values).success;

  function moveTo(nextView: number, nextDirection: number) {
    clearError();
    focusView.current = nextView;
    setDirection(nextDirection);
    setView(nextView);
  }

  async function nextView() {
    if (view === WELCOME_VIEW) {
      moveTo(0, 1);
      return;
    }
    if (!isDataStep(view)) return;

    clearError();
    const isValid = await form.trigger([...stepFields[view]], { shouldFocus: true });
    if (!isValid) return;
    moveTo(view === dataStepLabels.length - 1 ? COMPLETION_VIEW : view + 1, 1);
  }

  function previousView() {
    if (!isDataStep(view) || view === 0) return;
    moveTo(view - 1, -1);
  }

  async function finish(valuesToSubmit: OnboardingFormValues) {
    clearError();
    setIsSubmitting(true);

    try {
      await completeOnboarding(toInitialProfileData(valuesToSubmit));
      navigate('/dashboard', { replace: true });
    } catch (cause) {
      handleError(cause, {
        source: 'client',
        userMessage: 'ثبت اطلاعات انجام نشد. لطفاً دوباره تلاش کنید.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function submitCurrentView(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (view === COMPLETION_VIEW) {
      void form.handleSubmit(finish)(event);
      return;
    }
    void nextView();
  }

  const firstName = user?.fullName.trim().split(/\s+/)[0];
  const showProgress = isDataStep(view);
  const showBack = isDataStep(view) && view > 0;
  const isStandaloneView = view === WELCOME_VIEW || view === COMPLETION_VIEW;

  return (
    <main
      className="relative h-dvh overflow-hidden bg-[#f7f8fb] px-3 py-3 text-right sm:px-6 sm:py-4 lg:px-8"
      dir="rtl"
      lang="fa"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(20,60,251,0.10),transparent_68%)]"
      />
      <div className="relative mx-auto flex h-full w-full max-w-3xl flex-col">
        <header className="flex h-9 shrink-0 items-center sm:h-10">
          <AuthLogo />
        </header>

        <section
          aria-label="فرایند تکمیل پروفایل اولیه"
          className="flex min-h-0 flex-1 flex-col justify-center gap-2 py-1 sm:gap-3"
        >
          {showProgress && (
            <OnboardingProgress
              currentStep={view}
              labels={dataStepLabels}
            />
          )}

          <FormProvider {...form}>
            <motion.form
              animate={{ opacity: 1, y: 0 }}
              aria-labelledby="onboarding-step-title"
              className="rounded-[22px] border border-border/80 bg-white p-4 shadow-[0_18px_55px_rgba(20,30,55,0.07)] sm:p-5"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              noValidate
              onSubmit={submitCurrentView}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.32, ease: 'easeOut' }}
            >
              <div>
                <AnimatePresence custom={direction} initial={false} mode="wait">
                  <motion.div
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    className="outline-none"
                    custom={direction}
                    exit={
                      reduceMotion
                        ? { opacity: 1 }
                        : { opacity: 0, x: direction > 0 ? 10 : -10, y: -2 }
                    }
                    initial={
                      reduceMotion
                        ? { opacity: 1 }
                        : { opacity: 0, x: direction > 0 ? -10 : 10, y: 7 }
                    }
                    key={view}
                    onAnimationComplete={() => {
                      if (focusView.current !== view) return;
                      contentRef.current
                        ?.querySelector<HTMLElement>('#onboarding-step-title')
                        ?.focus({ preventScroll: true });
                      focusView.current = null;
                    }}
                    ref={contentRef}
                    transition={
                      reduceMotion ? { duration: 0 } : { duration: 0.26, ease: 'easeOut' }
                    }
                  >
                    <OnboardingStep
                      completion={onboardingCompletion}
                      firstName={firstName}
                      view={view}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <FormError className="mt-3" error={error} />

              <footer
                className={cn(
                  'mt-4 flex items-center gap-3 border-t border-border/70 pt-4',
                  isStandaloneView ? 'justify-center' : showBack ? 'justify-between' : 'justify-end',
                )}
              >
                {showBack && (
                  <Button
                    className="min-h-11 px-4 text-muted-foreground"
                    disabled={isSubmitting}
                    onClick={previousView}
                    type="button"
                    variant="ghost"
                  >
                    <ArrowRight aria-hidden="true" className="size-4" />
                    بازگشت
                  </Button>
                )}

                <Button
                  className={cn(
                    'min-h-11 min-w-28 px-5',
                    isStandaloneView && 'w-full max-w-64',
                  )}
                  disabled={isSubmitting || !currentStepComplete}
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                      در حال ثبت...
                    </>
                  ) : (
                    <>
                      {view === WELCOME_VIEW
                        ? 'شروع کنیم'
                        : view === COMPLETION_VIEW
                          ? 'مشاهده پیشنهادهای اولیه'
                          : 'ادامه'}
                      <ArrowLeft aria-hidden="true" className="size-4" />
                    </>
                  )}
                </Button>
              </footer>
            </motion.form>
          </FormProvider>
        </section>
      </div>
    </main>
  );
}
