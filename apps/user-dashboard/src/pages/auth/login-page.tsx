import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { AuthField } from '@/components/auth/auth-field';
import { AuthFormMotion, AuthMotionItem } from '@/components/auth/auth-form-motion';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthLogo } from '@/components/auth/auth-logo';
import { PasswordField } from '@/components/auth/password-field';
import { FormError } from '@/components/errors/form-error';
import { Button } from '@/components/ui/button';
import { authApi } from '@/features/auth/auth-api';
import { useAuth } from '@/features/auth/auth-context';
import { destinationForAuthState } from '@/features/auth/auth-routing';
import { useAppError } from '@/hooks/use-app-error';
import { cn } from '@/lib/utils';
import { loginSchema, type LoginFormValues } from '@/schemas/auth.schema';

export function LoginPage() {
  const navigate = useNavigate();
  const { applySnapshot, state, termsVersion } = useAuth();
  const { clearError, handleError } = useAppError();
  const {
    clearErrors,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginFormValues>({
    defaultValues: { identifier: '', password: '' },
    mode: 'onTouched',
    resolver: zodResolver(loginSchema),
  });

  async function submit(values: LoginFormValues) {
    clearErrors('root');
    clearError();
    try {
      const result = await authApi.login(values);
      const nextState = applySnapshot(result.snapshot);
      if (nextState.status !== 'loading') {
        navigate(destinationForAuthState(nextState), { replace: true });
      }
    } catch (cause) {
      const error = handleError(cause, {
        source: 'authentication',
        context: { operation: 'password-login' },
      });
      const fieldMessage = error.fieldErrors?.identifier?.[0] ?? error.fieldErrors?.password?.[0];
      setError('root', { message: fieldMessage ?? error.userMessage, type: 'server' });
    }
  }

  const bootstrapError = state.status === 'anonymous' ? state.error : undefined;

  return (
    <AuthFormMotion
      className="auth-login-form max-w-[500px]"
      noValidate
      onSubmit={handleSubmit(submit)}
    >
      <AuthMotionItem className="flex justify-start lg:justify-start">
        <AuthLogo />
      </AuthMotionItem>

      <AuthMotionItem>
        <AuthHeader
          className="auth-login-header mt-8 lg:mt-[52px]"
          subtitle="نام کاربری یا ایمیل و رمز عبور خود را وارد کنید."
          title={
            <>
              <span className="block">خوش برگشتی</span>
              <span className="block">به وآند وارد شوید</span>
            </>
          }
          titleClassName="auth-login-title text-[34px] sm:text-[38px] lg:text-[42px]"
        />
      </AuthMotionItem>

      <div className="mt-8 space-y-3">
        <AuthMotionItem>
          <AuthField
            autoCapitalize="none"
            autoComplete="username"
            dir="ltr"
            error={errors.identifier?.message}
            icon={AtSign}
            id="login-identifier"
            label="نام کاربری یا ایمیل"
            placeholder="نام کاربری یا ایمیل"
            spellCheck={false}
            type="text"
            {...register('identifier')}
          />
        </AuthMotionItem>

        <AuthMotionItem>
          <PasswordField
            autoComplete="current-password"
            dir="ltr"
            error={errors.password?.message}
            id="login-password"
            label="رمز عبور"
            placeholder="رمز عبور"
            {...register('password')}
          />
        </AuthMotionItem>
      </div>

      <AuthMotionItem className="mt-3.5 flex justify-end text-sm">
        <Link
          className="rounded-md font-semibold text-primary outline-none transition-colors hover:text-primary/80 focus-visible:ring-4 focus-visible:ring-ring/15"
          to="/forgot-password"
        >
          رمز عبور را فراموش کرده‌اید؟
        </Link>
      </AuthMotionItem>

      <AuthMotionItem className="mt-6">
        <FormError error={errors.root?.message ?? bootstrapError} />
        <Button
          aria-busy={isSubmitting}
          className={cn('auth-submit-button', (errors.root || bootstrapError) && 'mt-3')}
          disabled={isSubmitting || !termsVersion}
          size="auth"
          type="submit"
        >
          {isSubmitting ? 'در حال بررسی…' : 'ورود'}
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
