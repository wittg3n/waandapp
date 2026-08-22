import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { AuthMotionItem } from '@/components/auth/auth-form-motion';
import { AuthHeader } from '@/components/auth/auth-header';
import { AuthLogo } from '@/components/auth/auth-logo';
import { VerificationPanel } from '@/components/auth/verification-panel';
import { authApi } from '@/features/auth/auth-api';
import { useAuth } from '@/features/auth/auth-context';
import { destinationForAuthState } from '@/features/auth/auth-routing';
import type { AuthChannel } from '@/features/auth/types';

const signupOrder: readonly AuthChannel[] = ['email', 'sms'];

export function VerifyPage() {
  const navigate = useNavigate();
  const { applySnapshot, preauth, refreshSession } = useAuth();

  if (!preauth || preauth.type === 'password_reset' || preauth.type === 'step_up') return null;

  const signupChannel =
    preauth.type === 'signup'
      ? signupOrder.find(
          (channel) =>
            !preauth.completedChannels.includes(channel) &&
            preauth.allowedChannels.includes(channel),
        )
      : undefined;
  const channels = signupChannel ? [signupChannel] : preauth.allowedChannels;

  async function verify(channel: AuthChannel, code: string, signal: AbortSignal) {
    const result =
      preauth?.type === 'signup'
        ? await authApi.verifyRegistrationCode(channel, code, signal)
        : await authApi.verifySecondStep(channel, code, signal);
    const nextState = applySnapshot(result.snapshot);
    if (result.status === 'AUTHENTICATED' && nextState.status !== 'loading') {
      navigate(destinationForAuthState(nextState), { replace: true });
    }
  }

  return (
    <div className="w-full max-w-[500px]">
      <AuthMotionItem className="flex justify-center lg:justify-start">
        <AuthLogo />
      </AuthMotionItem>
      <AuthMotionItem>
        <AuthHeader
          className="mt-7 lg:mt-9"
          subtitle={
            preauth.type === 'signup'
              ? signupChannel === 'email'
                ? 'ابتدا مالکیت ایمیل خود را تأیید کنید.'
                : 'حالا مالکیت شماره موبایل خود را تأیید کنید.'
              : 'ورود فقط پس از تأیید مرحله دوم کامل می‌شود.'
          }
          title={preauth.type === 'signup' ? 'تأیید اطلاعات تماس' : 'مرحله دوم ورود'}
          titleClassName="text-[30px] sm:text-[34px] lg:text-[38px]"
        />
      </AuthMotionItem>
      <AuthMotionItem className="mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="mb-5 flex items-center gap-3 text-sm font-bold text-foreground">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck aria-hidden="true" className="size-5" />
          </span>
          اطلاعات مقصد به‌صورت محافظت‌شده نمایش داده می‌شود.
        </div>
        <VerificationPanel
          channels={channels}
          destinations={preauth.destinations}
          key={`${preauth.type}:${preauth.stage}:${preauth.completedChannels.join(',')}`}
          lockedChannel={signupChannel}
          onRequest={(channel, signal) =>
            preauth.type === 'signup'
              ? authApi.requestRegistrationCode(channel, signal)
              : authApi.requestSecondStep(channel, signal)
          }
          onInvalid={() => void refreshSession()}
          onVerify={verify}
        />
      </AuthMotionItem>
    </div>
  );
}
