import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { AuthFormMotion, AuthMotionItem } from '@/components/auth/auth-form-motion';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthLogo } from '@/components/auth/auth-logo';
import { PasswordField } from '@/components/auth/password-field';
import { FormError } from '@/components/errors/form-error';
import { Button } from '@/components/ui/button';
import { ERROR_CODES } from '@/errors/error-codes';
import { authApi } from '@/features/auth/auth-api';
import { useAuth } from '@/features/auth/auth-context';
import { useAppError } from '@/hooks/use-app-error';
import { passwordResetSchema, type PasswordResetValues } from '@/schemas/auth.schema';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { refreshSession } = useAuth();
  const { clearError, handleError } = useAppError();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<PasswordResetValues>({
    defaultValues: { password: '', passwordConfirmation: '' },
    mode: 'onTouched',
    resolver: zodResolver(passwordResetSchema),
  });

  async function submit(values: PasswordResetValues) {
    clearError();
    try {
      await authApi.resetPassword(values);
      await refreshSession();
      toast.success('رمز عبور تغییر کرد؛ اکنون با رمز جدید وارد شوید.');
      navigate('/login', { replace: true });
    } catch (cause) {
      const error = handleError(cause, {
        source: 'authentication',
        context: { operation: 'password-reset' },
      });
      setError('root', { message: error.userMessage, type: 'server' });
      if (error.code === ERROR_CODES.AUTH_PREAUTH_INVALID) void refreshSession();
    }
  }

  return (
    <AuthFormMotion className="max-w-[500px]" noValidate onSubmit={handleSubmit(submit)}>
      <AuthMotionItem className="flex justify-center lg:justify-start">
        <AuthLogo />
      </AuthMotionItem>
      <AuthMotionItem>
        <AuthHeader
          className="mt-7 lg:mt-10"
          subtitle="رمز جدید باید بین ۱۲ تا ۱۲۸ نویسه باشد."
          title="انتخاب رمز عبور جدید"
          titleClassName="text-[30px] sm:text-[34px] lg:text-[38px]"
        />
      </AuthMotionItem>
      <div className="mt-7 space-y-3">
        <AuthMotionItem>
          <PasswordField
            autoComplete="new-password"
            dir="ltr"
            error={errors.password?.message}
            id="reset-password"
            label="رمز عبور جدید"
            placeholder="رمز عبور جدید"
            {...register('password')}
          />
        </AuthMotionItem>
        <AuthMotionItem>
          <PasswordField
            autoComplete="new-password"
            dir="ltr"
            error={errors.passwordConfirmation?.message}
            id="reset-password-confirmation"
            label="تکرار رمز عبور جدید"
            placeholder="تکرار رمز عبور جدید"
            {...register('passwordConfirmation')}
          />
        </AuthMotionItem>
      </div>
      <AuthMotionItem className="mt-6">
        <FormError error={errors.root?.message} />
        <Button
          aria-busy={isSubmitting}
          className={errors.root ? 'mt-3' : undefined}
          disabled={isSubmitting}
          size="auth"
          type="submit"
        >
          {isSubmitting ? 'در حال تغییر…' : 'تغییر رمز عبور'}
        </Button>
      </AuthMotionItem>
    </AuthFormMotion>
  );
}
