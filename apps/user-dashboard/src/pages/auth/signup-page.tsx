import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, UserRound } from 'lucide-react';
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
import { useAuth } from '@/features/auth/auth-context';
import { useAppError } from '@/hooks/use-app-error';
import { cn } from '@/lib/utils';
import { signupSchema, type SignupFormValues } from '@/schemas/auth.schema';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { clearError, handleError } = useAppError();
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<SignupFormValues>({
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      passwordConfirmation: '',
      termsAccepted: true,
    },
    mode: 'onTouched',
    resolver: zodResolver(signupSchema),
  });

  const submit = async (values: SignupFormValues) => {
    clearErrors('root');
    clearError();

    try {
      const user = await signup(values);
      navigate(user.onboardingCompleted ? '/dashboard' : '/onboarding', { replace: true });
    } catch (cause) {
      const error = handleError(cause, {
        source: 'authentication',
        context: { operation: 'signup' },
      });
      setError('root', { message: error.userMessage, type: 'server' });
    }
  };

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
          className="auth-signup-header mt-7 lg:mt-10"
          subtitle="با ساخت حساب، به امکانات و خدمات واند دسترسی پیدا کنید."
          title={
            <>
              <span className="auth-signup-title block text-[32px] sm:text-[34px] lg:text-[36px]">
                حساب کاربری بسازید
              </span>
              <span className="auth-signup-secondary block text-[24px] font-bold sm:text-[26px] lg:text-[28px]">
                سفر اپلای خود را با واند شروع کنید
              </span>
            </>
          }
        />
      </AuthMotionItem>

      <div className="auth-signup-fields mt-6 grid gap-2.5">
        <AuthMotionItem>
          <AuthField
            autoComplete="name"
            error={errors.fullName?.message}
            icon={UserRound}
            id="signup-name"
            label="نام و نام خانوادگی"
            placeholder="نام و نام خانوادگی"
            type="text"
            {...register('fullName')}
          />
        </AuthMotionItem>

        <AuthMotionItem>
          <AuthField
            autoComplete="email"
            error={errors.email?.message}
            icon={Mail}
            id="signup-email"
            inputMode="email"
            label="ایمیل"
            placeholder="ایمیل"
            type="email"
            {...register('email')}
          />
        </AuthMotionItem>

        <AuthMotionItem>
          <PasswordField
            autoComplete="new-password"
            error={errors.password?.message}
            id="signup-password"
            label="رمز عبور"
            placeholder="رمز عبور"
            {...register('password')}
          />
        </AuthMotionItem>

        <AuthMotionItem>
          <PasswordField
            autoComplete="new-password"
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
          <span>
            با <span className="font-semibold text-primary">قوانین و شرایط</span> موافقم
          </span>
        </label>
        <InlineError id="terms-accepted-error" message={errors.termsAccepted?.message} />
      </AuthMotionItem>

      <AuthMotionItem className="auth-signup-submit mt-5">
        <FormError error={errors.root?.message} />
        <Button
          aria-busy={isSubmitting}
          className={cn('auth-submit-button', errors.root && 'mt-3')}
          disabled={isSubmitting}
          size="auth"
          type="submit"
        >
          {isSubmitting ? 'در حال ساخت حساب…' : 'ثبت‌نام'}
        </Button>
      </AuthMotionItem>

      <AuthMotionItem className="auth-signup-footer mt-5 flex flex-wrap items-baseline justify-center gap-2 text-[15px] leading-6 text-muted-foreground">
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
