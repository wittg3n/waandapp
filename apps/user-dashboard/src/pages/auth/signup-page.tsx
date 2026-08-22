import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, Mail, Smartphone, UserRound } from 'lucide-react';
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
import { signupSchema, type SignupFormValues, type SignupPayload } from '@/schemas/auth.schema';

export function SignupPage() {
  const navigate = useNavigate();
  const { applySnapshot, state, termsVersion } = useAuth();
  const { clearError, handleError } = useAppError();
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<SignupFormValues, unknown, SignupPayload>({
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '+98',
      password: '',
      passwordConfirmation: '',
      termsAccepted: false,
    },
    mode: 'onTouched',
    resolver: zodResolver(signupSchema),
  });

  async function submit(values: SignupPayload) {
    clearErrors('root');
    clearError();
    if (!termsVersion) {
      setError('root', {
        message: 'نسخه فعلی قوانین دریافت نشد؛ صفحه را تازه‌سازی و دوباره تلاش کنید.',
        type: 'server',
      });
      return;
    }

    try {
      const result = await authApi.register({
        ...values,
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
      setError('root', { message: error.userMessage, type: 'server' });
    }
  }

  const bootstrapError = state.status === 'anonymous' ? state.error : undefined;

  return (
    <AuthFormMotion
      className="auth-signup-form max-w-[500px]"
      noValidate
      onSubmit={handleSubmit(submit)}
    >
      <AuthMotionItem className="flex justify-center lg:justify-start">
        <AuthLogo />
      </AuthMotionItem>

      <AuthMotionItem>
        <AuthHeader
          className="auth-signup-header mt-6 lg:mt-7"
          subtitle="پس از ساخت حساب، ایمیل و موبایل شما به‌ترتیب تأیید می‌شوند."
          title="حساب کاربری بسازید"
          titleClassName="auth-signup-title text-[30px] sm:text-[34px] lg:text-[36px]"
        />
      </AuthMotionItem>

      <div className="auth-signup-fields mt-5 grid gap-2.5 sm:grid-cols-2">
        <AuthMotionItem>
          <AuthField
            autoComplete="given-name"
            error={errors.firstName?.message}
            icon={UserRound}
            id="signup-first-name"
            label="نام"
            placeholder="نام"
            type="text"
            {...register('firstName')}
          />
        </AuthMotionItem>
        <AuthMotionItem>
          <AuthField
            autoComplete="family-name"
            error={errors.lastName?.message}
            icon={UserRound}
            id="signup-last-name"
            label="نام خانوادگی"
            placeholder="نام خانوادگی"
            type="text"
            {...register('lastName')}
          />
        </AuthMotionItem>
        <AuthMotionItem>
          <AuthField
            autoCapitalize="none"
            autoComplete="username"
            dir="ltr"
            error={errors.username?.message}
            icon={AtSign}
            id="signup-username"
            label="نام کاربری"
            placeholder="username"
            spellCheck={false}
            type="text"
            {...register('username')}
          />
        </AuthMotionItem>
        <AuthMotionItem>
          <AuthField
            autoCapitalize="none"
            autoComplete="email"
            dir="ltr"
            error={errors.email?.message}
            icon={Mail}
            id="signup-email"
            inputMode="email"
            label="ایمیل"
            placeholder="name@example.com"
            spellCheck={false}
            type="email"
            {...register('email')}
          />
        </AuthMotionItem>
        <AuthMotionItem>
          <AuthField
            aria-describedby="signup-phone-hint"
            autoComplete="tel"
            dir="ltr"
            error={errors.phone?.message}
            icon={Smartphone}
            id="signup-phone"
            inputMode="tel"
            label="شماره موبایل با کد کشور"
            placeholder="+989121234567"
            type="tel"
            {...register('phone')}
          />
          <p className="sr-only" id="signup-phone-hint">
            کد کشور ایران مثبت نود و هشت است.
          </p>
        </AuthMotionItem>
        <AuthMotionItem>
          <PasswordField
            autoComplete="new-password"
            dir="ltr"
            error={errors.password?.message}
            id="signup-password"
            label="رمز عبور"
            placeholder="حداقل ۱۲ نویسه"
            {...register('password')}
          />
        </AuthMotionItem>
        <AuthMotionItem className="sm:col-span-2">
          <PasswordField
            autoComplete="new-password"
            dir="ltr"
            error={errors.passwordConfirmation?.message}
            id="signup-password-confirmation"
            label="تکرار رمز عبور"
            placeholder="تکرار رمز عبور"
            {...register('passwordConfirmation')}
          />
        </AuthMotionItem>
      </div>

      <AuthMotionItem className="auth-signup-terms mt-3.5">
        <label
          className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-foreground"
          htmlFor="terms-accepted"
        >
          <Checkbox
            aria-describedby={errors.termsAccepted ? 'terms-accepted-error' : undefined}
            aria-invalid={Boolean(errors.termsAccepted)}
            id="terms-accepted"
            {...register('termsAccepted')}
          />
          <span>با قوانین و شرایط فعلی وآند موافقم</span>
        </label>
        <InlineError id="terms-accepted-error" message={errors.termsAccepted?.message} />
      </AuthMotionItem>

      <AuthMotionItem className="auth-signup-submit mt-4">
        <FormError error={errors.root?.message ?? bootstrapError} />
        <Button
          aria-busy={isSubmitting}
          className={cn('auth-submit-button', (errors.root || bootstrapError) && 'mt-3')}
          disabled={isSubmitting || !termsVersion}
          size="auth"
          type="submit"
        >
          {isSubmitting ? 'در حال ساخت حساب…' : 'ثبت‌نام'}
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
  );
}
