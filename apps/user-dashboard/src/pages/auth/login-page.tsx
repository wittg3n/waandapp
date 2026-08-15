import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { AuthField } from '@/components/auth/auth-field';
import { AuthFormMotion, AuthMotionItem } from '@/components/auth/auth-form-motion';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthLogo } from '@/components/auth/auth-logo';
import { PasswordField } from '@/components/auth/password-field';
import { FormError } from '@/components/errors/form-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/features/auth/auth-context';
import { useAppError } from '@/hooks/use-app-error';
import { cn } from '@/lib/utils';
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { clearError, handleError } = useAppError();
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '', remember: true },
    mode: 'onTouched',
    resolver: zodResolver(loginSchema),
  });

  const submit = async (values: LoginFormValues) => {
    clearErrors('root');
    clearError();

    try {
      const user = await login(values);
      navigate(user.onboardingCompleted ? '/dashboard' : '/onboarding', { replace: true });
    } catch (cause) {
      const error = handleError(cause, {
        source: 'authentication',
        context: { operation: 'login' },
      });
      setError('root', { message: error.userMessage, type: 'server' });
    }
  };

  return (
    <AuthFormMotion
      className="auth-login-form max-w-[500px]"
      noValidate
      onSubmit={handleSubmit(submit)}
    >
      <AuthMotionItem className="flex justify-center lg:justify-start">
        <AuthLogo />
      </AuthMotionItem>

      <AuthMotionItem>
        <AuthHeader
          className="auth-login-header mt-8 lg:mt-[52px]"
          subtitle="سفر آینده‌ات همین‌جا ادامه داره"
          title={
            <>
              <span className="block">خوش برگشتی</span>
              <span className="block">به واند وارد شوید</span>
            </>
          }
          titleClassName="auth-login-title text-[34px] sm:text-[38px] lg:text-[42px]"
        />
      </AuthMotionItem>

      <div className="mt-8 space-y-3">
        <AuthMotionItem>
          <AuthField
            autoComplete="email"
            error={errors.email?.message}
            icon={Mail}
            id="login-email"
            inputMode="email"
            label="ایمیل"
            placeholder="ایمیل"
            type="email"
            {...register('email')}
          />
        </AuthMotionItem>

        <AuthMotionItem>
          <PasswordField
            autoComplete="current-password"
            error={errors.password?.message}
            id="login-password"
            label="رمز عبور"
            placeholder="رمز عبور"
            {...register('password')}
          />
        </AuthMotionItem>
      </div>

      <AuthMotionItem className="mt-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
        <label
          className="inline-flex cursor-pointer items-center gap-2.5 text-foreground"
          htmlFor="remember-me"
        >
          <Checkbox id="remember-me" {...register('remember')} />
          <span>مرا به خاطر بسپار</span>
        </label>
        <button
          className="rounded-md font-semibold text-primary outline-none transition-colors hover:text-primary/80 focus-visible:ring-4 focus-visible:ring-ring/15"
          onClick={() => toast.info('بازیابی رمز عبور در حال حاضر در دسترس نیست.')}
          type="button"
        >
          رمز عبور را فراموش کرده‌اید؟
        </button>
      </AuthMotionItem>

      <AuthMotionItem className="mt-6">
        <FormError error={errors.root?.message} />
        <Button
          aria-busy={isSubmitting}
          className={cn('auth-submit-button', errors.root && 'mt-3')}
          disabled={isSubmitting}
          size="auth"
          type="submit"
        >
          {isSubmitting ? 'در حال ورود…' : 'ورود'}
        </Button>
      </AuthMotionItem>

      <AuthMotionItem className="mt-6 flex flex-wrap items-baseline justify-center gap-2 text-[15px] leading-6 text-muted-foreground">
        <span>حساب کاربری ندارید؟</span>
        <Link
          className="rounded-md font-bold text-primary outline-none hover:text-primary/80 focus-visible:ring-4 focus-visible:ring-ring/15"
          to="/signup"
        >
          ثبت‌نام
        </Link>
      </AuthMotionItem>
    </AuthFormMotion>
  );
}
