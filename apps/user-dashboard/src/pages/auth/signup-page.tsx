import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, AtSign, Mail, Smartphone, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { AuthField } from '@/components/auth/auth-field';
import { AuthFormMotion, AuthMotionItem } from '@/components/auth/auth-form-motion';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthLogo } from '@/components/auth/auth-logo';
import { PasswordField } from '@/components/auth/password-field';
import { FormError } from '@/components/errors/form-error';
import { InlineError } from '@/components/errors/inline-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { authApi } from '@/features/auth/auth-api';
import { useAuth } from '@/features/auth/auth-context';
import { destinationForAuthState } from '@/features/auth/auth-routing';
import { useAppError } from '@/hooks/use-app-error';
import { cn } from '@/lib/utils';
import {
  signupAccountSchema,
  signupPhoneFormSchema,
  type SignupAccountFormValues,
  type SignupAccountPayload,
  type SignupPhoneFormValues,
  type SignupPhonePayload,
} from '@/schemas/auth.schema';

const accountFieldNames = [
  'firstName',
  'lastName',
  'username',
  'email',
  'password',
  'passwordConfirmation',
] as const;

export function SignupPage() {
  const navigate = useNavigate();
  const { applySnapshot, state, termsVersion } = useAuth();
  const { clearError, handleError } = useAppError();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<'account' | 'phone'>('account');
  const [accountFocusTarget, setAccountFocusTarget] = useState<
    (typeof accountFieldNames)[number] | null
  >(null);
  const accountForm = useForm<SignupAccountFormValues, unknown, SignupAccountPayload>({
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      termsAccepted: false,
    },
    mode: 'onTouched',
    resolver: zodResolver(signupAccountSchema),
  });
  const phoneForm = useForm<SignupPhoneFormValues, unknown, SignupPhonePayload>({
    defaultValues: { phone: '' },
    mode: 'onTouched',
    resolver: zodResolver(signupPhoneFormSchema),
  });

  function advanceToPhone() {
    accountForm.clearErrors('root');
    clearError();
    if (!termsVersion) {
      accountForm.setError('root', {
        message: 'نسخه فعلی قوانین دریافت نشد؛ صفحه را تازه‌سازی و دوباره تلاش کنید.',
        type: 'server',
      });
      return;
    }
    setAccountFocusTarget(null);
    setStep('phone');
  }

  async function submit({ phone }: SignupPhonePayload) {
    phoneForm.clearErrors('root');
    clearError();
    if (!termsVersion) {
      phoneForm.setError('root', {
        message: 'نسخه فعلی قوانین دریافت نشد؛ صفحه را تازه‌سازی و دوباره تلاش کنید.',
        type: 'server',
      });
      return;
    }

    try {
      const account = signupAccountSchema.parse(accountForm.getValues());
      const result = await authApi.register({
        ...account,
        phone,
        termsAccepted: true,
        termsVersion,
      });
      const nextState = applySnapshot(result.snapshot);
      if (nextState.status !== 'loading') {
        navigate(destinationForAuthState(nextState), { replace: true });
      }
    } catch (cause) {
      const error = handleError(cause, {
        source: 'authentication',
        context: { operation: 'register' },
      });
      const accountField = accountFieldNames.find((field) => error.fieldErrors?.[field]?.[0]);
      if (accountField) {
        accountForm.setError(accountField, {
          message: error.fieldErrors?.[accountField]?.[0],
          type: 'server',
        });
        setAccountFocusTarget(accountField);
        setStep('account');
        return;
      }

      const phoneMessage = error.fieldErrors?.phone?.[0];
      phoneForm.setError(phoneMessage ? 'phone' : 'root', {
        message: phoneMessage ?? error.userMessage,
        type: 'server',
      });
    }
  }

  const bootstrapError = state.status === 'anonymous' ? state.error : undefined;
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <AnimatePresence initial={false} mode="wait">
      {step === 'account' ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="w-full"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key="signup-account"
          transition={transition}
        >
          <AuthFormMotion
            className="auth-signup-form max-w-[500px]"
            noValidate
            onSubmit={accountForm.handleSubmit(advanceToPhone)}
          >
            <AuthMotionItem className="flex justify-start lg:justify-start">
              <AuthLogo />
            </AuthMotionItem>

            <AuthMotionItem>
              <AuthHeader
                className="auth-signup-header mt-6 lg:mt-7"
                subtitle="برای شروع، اطلاعات حساب کاربری خود را وارد کنید."
                title="حساب کاربری بسازید"
                titleClassName="auth-signup-title text-[30px] sm:text-[34px] lg:text-[36px]"
              />
            </AuthMotionItem>

            <div className="auth-signup-fields mt-5 grid gap-2.5 sm:grid-cols-2">
              <AuthMotionItem>
                <AuthField
                  autoFocus={accountFocusTarget === 'firstName'}
                  autoComplete="given-name"
                  error={accountForm.formState.errors.firstName?.message}
                  icon={UserRound}
                  id="signup-first-name"
                  label="نام"
                  placeholder="نام"
                  type="text"
                  {...accountForm.register('firstName')}
                />
              </AuthMotionItem>
              <AuthMotionItem>
                <AuthField
                  autoFocus={accountFocusTarget === 'lastName'}
                  autoComplete="family-name"
                  error={accountForm.formState.errors.lastName?.message}
                  icon={UserRound}
                  id="signup-last-name"
                  label="نام خانوادگی"
                  placeholder="نام خانوادگی"
                  type="text"
                  {...accountForm.register('lastName')}
                />
              </AuthMotionItem>
              <AuthMotionItem>
                <AuthField
                  autoFocus={accountFocusTarget === 'username'}
                  autoCapitalize="none"
                  autoComplete="username"
                  dir="ltr"
                  error={accountForm.formState.errors.username?.message}
                  icon={AtSign}
                  id="signup-username"
                  label="نام کاربری"
                  placeholder="username"
                  spellCheck={false}
                  type="text"
                  {...accountForm.register('username')}
                />
              </AuthMotionItem>
              <AuthMotionItem>
                <AuthField
                  autoFocus={accountFocusTarget === 'email'}
                  autoCapitalize="none"
                  autoComplete="email"
                  dir="ltr"
                  error={accountForm.formState.errors.email?.message}
                  icon={Mail}
                  id="signup-email"
                  inputMode="email"
                  label="ایمیل"
                  placeholder="name@example.com"
                  spellCheck={false}
                  type="email"
                  {...accountForm.register('email')}
                />
              </AuthMotionItem>
              <AuthMotionItem>
                <PasswordField
                  autoFocus={accountFocusTarget === 'password'}
                  autoComplete="new-password"
                  dir="ltr"
                  error={accountForm.formState.errors.password?.message}
                  id="signup-password"
                  label="رمز عبور"
                  placeholder="حداقل ۸ نویسه"
                  {...accountForm.register('password')}
                />
              </AuthMotionItem>
              <AuthMotionItem>
                <PasswordField
                  autoFocus={accountFocusTarget === 'passwordConfirmation'}
                  autoComplete="new-password"
                  dir="ltr"
                  error={accountForm.formState.errors.passwordConfirmation?.message}
                  id="signup-password-confirmation"
                  label="تکرار رمز عبور"
                  placeholder="تکرار رمز عبور"
                  {...accountForm.register('passwordConfirmation')}
                />
              </AuthMotionItem>
            </div>

            <AuthMotionItem className="auth-signup-terms mt-3.5">
              <label
                className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-foreground"
                htmlFor="terms-accepted"
              >
                <Checkbox
                  aria-describedby={
                    accountForm.formState.errors.termsAccepted ? 'terms-accepted-error' : undefined
                  }
                  aria-invalid={Boolean(accountForm.formState.errors.termsAccepted)}
                  id="terms-accepted"
                  {...accountForm.register('termsAccepted')}
                />
                <span>با قوانین و شرایط فعلی وآند موافقم</span>
              </label>
              <InlineError
                id="terms-accepted-error"
                message={accountForm.formState.errors.termsAccepted?.message}
              />
            </AuthMotionItem>

            <AuthMotionItem className="auth-signup-submit mt-4">
              <FormError error={accountForm.formState.errors.root?.message ?? bootstrapError} />
              <Button
                aria-busy={accountForm.formState.isSubmitting}
                className={cn(
                  'auth-submit-button',
                  (accountForm.formState.errors.root || bootstrapError) && 'mt-3',
                )}
                disabled={accountForm.formState.isSubmitting || !termsVersion}
                size="auth"
                type="submit"
              >
                ثبت‌نام
              </Button>
            </AuthMotionItem>

            <AuthMotionItem className="auth-signup-footer mt-4 flex flex-wrap items-baseline justify-center gap-2 text-[15px] leading-6 text-muted-foreground">
              <span>حساب کاربری دارید؟</span>
              <Link
                className="rounded-md font-bold text-primary outline-none hover:text-primary/80 focus-visible:ring-4 focus-visible:ring-ring/15"
                to="/login"
              >
                ورود
              </Link>
            </AuthMotionItem>
          </AuthFormMotion>
        </motion.div>
      ) : (
        <motion.div
          animate={{ opacity: 1 }}
          className="w-full"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key="signup-phone"
          transition={transition}
        >
          <AuthFormMotion
            className="auth-signup-form max-w-[500px]"
            noValidate
            onSubmit={phoneForm.handleSubmit(submit)}
          >
            <AuthMotionItem className="flex justify-start lg:justify-start">
              <AuthLogo />
            </AuthMotionItem>

            <AuthMotionItem>
              <AuthHeader
                className="auth-signup-header mt-8 lg:mt-10"
                subtitle="شماره موبایل ایران را بدون کد کشور وارد کنید."
                title="شماره موبایل شما"
                titleClassName="auth-signup-title text-[30px] sm:text-[34px] lg:text-[36px]"
              />
            </AuthMotionItem>

            <AuthMotionItem className="mt-7">
              <AuthField
                aria-describedby="signup-phone-hint"
                autoComplete="tel-national"
                autoFocus
                dir="ltr"
                error={phoneForm.formState.errors.phone?.message}
                icon={Smartphone}
                id="signup-phone"
                inputMode="numeric"
                label="شماره موبایل"
                maxLength={11}
                placeholder="09121234567"
                spellCheck={false}
                type="tel"
                {...phoneForm.register('phone')}
              />
              <p
                className="mt-2 px-1 text-sm leading-6 text-muted-foreground"
                id="signup-phone-hint"
              >
                نمونه: <span dir="ltr">09121234567</span>
              </p>
            </AuthMotionItem>

            <AuthMotionItem className="mt-6">
              <FormError error={phoneForm.formState.errors.root?.message ?? bootstrapError} />
              <Button
                aria-busy={phoneForm.formState.isSubmitting}
                className={cn(
                  'auth-submit-button',
                  (phoneForm.formState.errors.root || bootstrapError) && 'mt-3',
                )}
                disabled={phoneForm.formState.isSubmitting || !termsVersion}
                size="auth"
                type="submit"
              >
                {phoneForm.formState.isSubmitting ? 'در حال ساخت حساب…' : 'تکمیل ثبت‌نام'}
              </Button>
            </AuthMotionItem>

            <AuthMotionItem className="mt-3 flex justify-center">
              <Button
                disabled={phoneForm.formState.isSubmitting}
                onClick={() => {
                  phoneForm.clearErrors('root');
                  clearError();
                  setAccountFocusTarget('firstName');
                  setStep('account');
                }}
                type="button"
                variant="ghost"
              >
                <ArrowRight aria-hidden="true" className="size-4" />
                بازگشت و ویرایش اطلاعات
              </Button>
            </AuthMotionItem>
          </AuthFormMotion>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
