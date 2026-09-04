import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, KeyRound, LockKeyhole, ShieldCheck, Smartphone } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { AuthField } from '@/components/auth/auth-field';
import { PasswordField } from '@/components/auth/password-field';
import { VerificationPanel } from '@/components/auth/verification-panel';
import { FormError } from '@/components/errors/form-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ERROR_CODES } from '@/errors/error-codes';
import { authApi, type AuthTransitionResult } from '@/features/auth/auth-api';
import { useAuth } from '@/features/auth/auth-context';
import { createAuthOperationGate } from '@/features/auth/auth-flow';
import type { AuthChannel, CodeSentResult, SecurityPurpose } from '@/features/auth/types';
import { useAppError } from '@/hooks/use-app-error';
import { cn } from '@/lib/utils';
import {
  authEmailSchema,
  authPhoneSchema,
  passwordResetSchema,
  reauthSchema,
  type PasswordResetValues,
  type ReauthValues,
} from '@/schemas/auth.schema';

const purposes = [
  { value: 'change_password', label: 'تغییر رمز عبور', icon: LockKeyhole },
  { value: 'change_email', label: 'تغییر ایمیل', icon: AtSign },
  { value: 'change_phone', label: 'تغییر موبایل', icon: Smartphone },
] as const;
const contactChangeDestinations = {
  email: { email: 'ایمیل جدید' },
  sms: { sms: 'شماره جدید' },
} as const;

function ReauthForm({ onComplete, purpose }: { onComplete: () => void; purpose: SecurityPurpose }) {
  const { applySnapshot, refreshSession } = useAuth();
  const { clearError, handleError } = useAppError();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<ReauthValues>({
    defaultValues: { currentPassword: '' },
    mode: 'onTouched',
    resolver: zodResolver(reauthSchema),
  });

  async function submit(values: ReauthValues) {
    clearError();
    try {
      const result = await authApi.reauthenticate({ purpose, ...values });
      applySnapshot(result.snapshot);
      if (result.status === 'REAUTHENTICATED') onComplete();
    } catch (cause) {
      const error = handleError(cause, {
        source: 'authentication',
        context: { operation: 'reauthenticate', purpose },
      });
      if (error.code === ERROR_CODES.AUTH_INVALID_CREDENTIALS) {
        setError('currentPassword', { message: 'رمز عبور فعلی صحیح نیست.', type: 'server' });
      } else {
        setError('root', { message: error.userMessage, type: 'server' });
      }
      if (error.code === ERROR_CODES.AUTH_PREAUTH_INVALID) void refreshSession();
    }
  }

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(submit)}>
      <p className="text-sm leading-7 text-muted-foreground">
        برای شروع این تغییر، رمز عبور فعلی خود را وارد کنید.
      </p>
      <PasswordField
        autoComplete="current-password"
        dir="ltr"
        error={errors.currentPassword?.message}
        id="settings-current-password"
        label="رمز عبور فعلی"
        placeholder="رمز عبور فعلی"
        {...register('currentPassword')}
      />
      <FormError error={errors.root?.message} />
      <Button aria-busy={isSubmitting} disabled={isSubmitting} type="submit">
        {isSubmitting ? 'در حال بررسی…' : 'ادامه'}
      </Button>
    </form>
  );
}

function PasswordChangeForm({ onDone }: { onDone: () => void }) {
  const { applySnapshot } = useAuth();
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
      const result = await authApi.changePassword(values);
      applySnapshot(result.snapshot);
      toast.success('رمز عبور با موفقیت تغییر کرد.');
      onDone();
    } catch (cause) {
      const error = handleError(cause, {
        source: 'authentication',
        context: { operation: 'change-password' },
      });
      setError('root', { message: error.userMessage, type: 'server' });
      if (
        error.code === ERROR_CODES.AUTH_REAUTH_REQUIRED ||
        error.code === ERROR_CODES.AUTH_PREAUTH_INVALID
      ) {
        onDone();
      }
    }
  }

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(submit)}>
      <PasswordField
        autoComplete="new-password"
        dir="ltr"
        error={errors.password?.message}
        id="settings-new-password"
        label="رمز عبور جدید"
        placeholder="حداقل ۸ نویسه"
        {...register('password')}
      />
      <PasswordField
        autoComplete="new-password"
        dir="ltr"
        error={errors.passwordConfirmation?.message}
        id="settings-new-password-confirmation"
        label="تکرار رمز عبور جدید"
        placeholder="تکرار رمز عبور جدید"
        {...register('passwordConfirmation')}
      />
      <FormError error={errors.root?.message} />
      <Button aria-busy={isSubmitting} disabled={isSubmitting} type="submit">
        {isSubmitting ? 'در حال تغییر…' : 'تغییر رمز عبور'}
      </Button>
    </form>
  );
}

function ContactChangeForm({
  channel,
  onDone,
  onExpired,
  previousDestination,
}: {
  channel: AuthChannel;
  onDone: () => void;
  onExpired: () => void;
  previousDestination?: string;
}) {
  const { applySnapshot } = useAuth();
  const { clearError, error, handleError } = useAppError();
  const [destination, setDestination] = useState(channel === 'sms' ? '+98' : '');
  const [pendingDestination, setPendingDestination] = useState<string | null>(null);
  const [initialReceipt, setInitialReceipt] = useState<CodeSentResult>();
  const [fieldError, setFieldError] = useState<string>();
  const [requesting, setRequesting] = useState(false);
  const operationGateRef = useRef<ReturnType<typeof createAuthOperationGate> | null>(null);
  operationGateRef.current ??= createAuthOperationGate();
  const operationGate = operationGateRef.current;

  useEffect(() => () => operationGate.cancel(), [operationGate]);

  function completeChange(result: AuthTransitionResult) {
    applySnapshot(result.snapshot);
    toast.success(channel === 'email' ? 'ایمیل تغییر کرد.' : 'شماره موبایل تغییر کرد.');
    onDone();
  }

  async function continueToVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    const parsed = (channel === 'email' ? authEmailSchema : authPhoneSchema).safeParse(destination);
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? 'مقدار واردشده معتبر نیست.');
      return;
    }
    setFieldError(undefined);
    const operation = operationGate.start();
    setRequesting(true);
    try {
      const result = await authApi.requestContactChange(channel, parsed.data, operation.signal);
      if (!operationGate.isCurrent(operation)) return;
      if (result.status === 'CODE_SENT') {
        setPendingDestination(parsed.data);
        setInitialReceipt(result);
      } else {
        completeChange(result);
      }
    } catch (cause) {
      if (!operationGate.isCurrent(operation)) return;
      const requestError = handleError(cause, {
        source: 'authentication',
        context: { operation: 'request-contact-change', channel },
      });
      if (
        requestError.code === ERROR_CODES.AUTH_REAUTH_REQUIRED ||
        requestError.code === ERROR_CODES.AUTH_PREAUTH_INVALID
      ) {
        onExpired();
      }
    } finally {
      if (operationGate.isCurrent(operation)) {
        operationGate.finish(operation);
        setRequesting(false);
      }
    }
  }

  if (pendingDestination) {
    return (
      <VerificationPanel
        channels={[channel]}
        destinations={contactChangeDestinations[channel]}
        initialReceipt={initialReceipt}
        lockedChannel={channel}
        onInvalid={onExpired}
        onRequest={async (_, signal) => {
          const result = await authApi.requestContactChange(channel, pendingDestination, signal);
          if (result.status === 'CODE_SENT') return result;
          completeChange(result);
        }}
        onVerify={async (selected, code) => {
          try {
            const result = await authApi.verifyContactChange(selected, code);
            completeChange(result);
          } catch (cause) {
            handleError(cause, {
              source: 'authentication',
              context: { operation: 'verify-contact-change', channel },
            });
            throw cause;
          }
        }}
      />
    );
  }

  const isEmail = channel === 'email';
  return (
    <form className="space-y-4" noValidate onSubmit={continueToVerification}>
      <p className="text-sm leading-7 text-muted-foreground">
        {previousDestination ? (
          <>
            برای ادامه با <bdi className="font-bold text-foreground">{previousDestination}</bdi>،
            همان {isEmail ? 'ایمیل' : 'شماره'} را دوباره وارد کنید.
          </>
        ) : isEmail ? (
          'ایمیل جدید را وارد کنید؛ در صورت نیاز کد تأیید ارسال می‌شود.'
        ) : (
          'شماره جدید را با کد کشور وارد کنید؛ در صورت نیاز کد تأیید ارسال می‌شود.'
        )}
      </p>
      <AuthField
        autoCapitalize="none"
        autoComplete={isEmail ? 'email' : 'tel'}
        dir="ltr"
        error={fieldError}
        icon={isEmail ? AtSign : Smartphone}
        id={isEmail ? 'settings-new-email' : 'settings-new-phone'}
        inputMode={isEmail ? 'email' : 'tel'}
        label={isEmail ? 'ایمیل جدید' : 'شماره موبایل جدید با کد کشور'}
        onChange={(event) => {
          setDestination(event.currentTarget.value);
          setFieldError(undefined);
        }}
        placeholder={isEmail ? 'name@example.com' : '+989121234567'}
        spellCheck={false}
        type={isEmail ? 'email' : 'tel'}
        value={destination}
      />
      <FormError error={error} />
      <Button aria-busy={requesting} disabled={requesting} type="submit">
        {requesting ? 'در حال بررسی…' : 'ادامه'}
      </Button>
    </form>
  );
}

export function SettingsPage() {
  const { preauth, refreshSession } = useAuth();
  const [purpose, setPurpose] = useState<SecurityPurpose>('change_password');
  const [readyPurpose, setReadyPurpose] = useState<SecurityPurpose | null>(null);

  useEffect(() => {
    document.title = 'وآند | امنیت حساب';
  }, []);

  useEffect(() => {
    if (preauth?.type !== 'step_up' || !preauth.purpose) {
      setReadyPurpose(null);
      return;
    }
    setPurpose(preauth.purpose);
    if (preauth.stage === 'reauthenticated' || preauth.stage === 'new_contact_verification') {
      setReadyPurpose(preauth.purpose);
    } else {
      setReadyPurpose(null);
    }
  }, [preauth]);

  const activeStepUp = preauth?.type === 'step_up' ? preauth : null;
  const secondStep = activeStepUp?.stage === 'second_step' ? activeStepUp : null;

  return (
    <div className="mx-auto w-full max-w-[920px] py-7 sm:py-10">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck aria-hidden="true" className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-foreground">امنیت حساب</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              تغییر اطلاعات حساس فقط پس از تأیید دوباره هویت انجام می‌شود.
            </p>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>انتخاب تغییر امنیتی</CardTitle>
          <CardDescription>رمز عبور، ایمیل یا شماره موبایل حساب را مدیریت کنید.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3" role="group" aria-label="نوع تغییر امنیتی">
            {purposes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  aria-pressed={purpose === item.value}
                  className={cn(
                    'min-h-12 rounded-xl border px-3 text-sm font-bold outline-none transition focus-visible:ring-4 focus-visible:ring-ring/15',
                    purpose === item.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40',
                  )}
                  disabled={Boolean(activeStepUp)}
                  key={item.value}
                  onClick={() => {
                    setPurpose(item.value);
                    setReadyPurpose(null);
                  }}
                  type="button"
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon aria-hidden="true" className="size-4" />
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <KeyRound aria-hidden="true" className="size-5 text-primary" />
            تأیید و اعمال تغییر
          </CardTitle>
          <CardDescription>
            هیچ ایمیل یا شماره‌ای از مسیر ویرایش مستقیم پروفایل تغییر نمی‌کند.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-xl">
          {secondStep ? (
            <VerificationPanel
              channels={secondStep.allowedChannels}
              destinations={secondStep.destinations}
              key={`step-up:${secondStep.purpose ?? purpose}`}
              onRequest={(channel, signal) => authApi.requestSecondStep(channel, signal)}
              onInvalid={() => void refreshSession()}
              onVerify={async (channel, code, signal) => {
                const result = await authApi.verifySecondStep(channel, code, signal);
                await refreshSession();
                setReadyPurpose(result.purpose ?? purpose);
              }}
            />
          ) : readyPurpose === purpose ? (
            purpose === 'change_password' ? (
              <PasswordChangeForm onDone={() => setReadyPurpose(null)} />
            ) : (
              <ContactChangeForm
                channel={purpose === 'change_email' ? 'email' : 'sms'}
                onDone={() => setReadyPurpose(null)}
                onExpired={() => {
                  setReadyPurpose(null);
                  void refreshSession();
                }}
                previousDestination={
                  activeStepUp?.stage === 'new_contact_verification'
                    ? activeStepUp.destinations[purpose === 'change_email' ? 'email' : 'sms']
                    : undefined
                }
              />
            )
          ) : (
            <ReauthForm onComplete={() => setReadyPurpose(purpose)} purpose={purpose} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
