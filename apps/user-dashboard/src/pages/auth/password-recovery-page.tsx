import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { AuthField } from '@/components/auth/auth-field';
import { AuthMotionItem } from '@/components/auth/auth-form-motion';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthLogo } from '@/components/auth/auth-logo';
import { VerificationPanel } from '@/components/auth/verification-panel';
import { FormError } from '@/components/errors/form-error';
import { Button } from '@/components/ui/button';
import { authApi } from '@/features/auth/auth-api';
import { useAuth } from '@/features/auth/auth-context';
import type { AuthChannel } from '@/features/auth/types';
import { useAppError } from '@/hooks/use-app-error';
import { recoveryRequestSchema, type RecoveryRequestValues } from '@/schemas/auth.schema';

const recoveryOrder: readonly AuthChannel[] = ['email', 'sms'];

export function PasswordRecoveryPage() {
  const navigate = useNavigate();
  const { applySnapshot, preauth, refreshSession, state, termsVersion } = useAuth();
  const { clearError, handleError } = useAppError();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<RecoveryRequestValues>({
    defaultValues: { identifier: '' },
    mode: 'onTouched',
    resolver: zodResolver(recoveryRequestSchema),
  });

  const recovery = preauth?.type === 'password_reset' ? preauth : null;
  const recoveryChannel = recovery
    ? recoveryOrder.find(
        (channel) =>
          !recovery.completedChannels.includes(channel) &&
          recovery.allowedChannels.includes(channel),
      )
    : undefined;

  async function begin(values: RecoveryRequestValues) {
    clearError();
    try {
      const result = await authApi.forgotPassword(values.identifier);
      applySnapshot(result.snapshot);
    } catch (cause) {
      const error = handleError(cause, {
        source: 'authentication',
        context: { operation: 'password-recovery-start' },
      });
      setError('root', { message: error.userMessage, type: 'server' });
    }
  }

  async function verify(channel: AuthChannel, code: string, signal: AbortSignal) {
    const result = await authApi.verifyRecoveryCode(channel, code, signal);
    applySnapshot(result.snapshot);
    if (result.status === 'READY_FOR_PASSWORD_RESET') {
      navigate('/reset-password', { replace: true });
    }
  }

  const bootstrapError = state.status === 'anonymous' ? state.error : undefined;

  return (
    <div className="w-full max-w-[500px]">
      <AuthMotionItem className="flex justify-center lg:justify-start">
        <AuthLogo />
      </AuthMotionItem>
      <AuthMotionItem>
        <AuthHeader
          className="mt-7 lg:mt-9"
          subtitle="پاسخ این فرایند وجود یا نبود حساب را آشکار نمی‌کند."
          title="بازیابی رمز عبور"
          titleClassName="text-[30px] sm:text-[34px] lg:text-[38px]"
        />
      </AuthMotionItem>

      {recovery && recoveryChannel ? (
        <AuthMotionItem className="mt-6 rounded-2xl border border-border bg-card p-5">
          <div className="mb-5 flex items-center gap-3 text-sm font-bold text-foreground">
            <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
            {recoveryChannel === 'email'
              ? 'ابتدا ایمیل بازیابی را تأیید کنید.'
              : 'حالا شماره موبایل بازیابی را تأیید کنید.'}
          </div>
          <VerificationPanel
            channels={[recoveryChannel]}
            destinations={recovery.destinations}
            key={`recovery:${recovery.completedChannels.join(',')}`}
            lockedChannel={recoveryChannel}
            onRequest={(channel, signal) => authApi.requestRecoveryCode(channel, signal)}
            onInvalid={() => void refreshSession()}
            onVerify={verify}
          />
        </AuthMotionItem>
      ) : (
        <AuthMotionItem className="mt-7">
          <form className="space-y-5" noValidate onSubmit={handleSubmit(begin)}>
            <AuthField
              autoCapitalize="none"
              autoComplete="username"
              dir="ltr"
              error={errors.identifier?.message}
              icon={AtSign}
              id="recovery-identifier"
              label="نام کاربری یا ایمیل"
              placeholder="نام کاربری یا ایمیل"
              spellCheck={false}
              type="text"
              {...register('identifier')}
            />
            <FormError error={errors.root?.message ?? bootstrapError} />
            <Button
              aria-busy={isSubmitting}
              disabled={isSubmitting || !termsVersion}
              size="auth"
              type="submit"
            >
              {isSubmitting ? 'در حال ثبت درخواست…' : 'ادامه بازیابی'}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            رمز عبور را به یاد آوردید؟{' '}
            <Link
              className="rounded font-bold text-primary outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
              to="/login"
            >
              بازگشت به ورود
            </Link>
          </p>
        </AuthMotionItem>
      )}
    </div>
  );
}
