import { KeyRound, Mail, Smartphone } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

import { AuthField } from '@/components/auth/auth-field';
import { FormError } from '@/components/errors/form-error';
import { Button } from '@/components/ui/button';
import { ERROR_CODES } from '@/errors/error-codes';
import { getRetryAfterSeconds } from '@/features/auth/auth-api';
import {
  cooldownDeadline,
  cooldownRemaining,
  createAuthOperationGate,
} from '@/features/auth/auth-flow';
import type { AuthChannel, CodeSentResult } from '@/features/auth/types';
import { useAppError } from '@/hooks/use-app-error';
import { cn } from '@/lib/utils';
import { authCodeSchema } from '@/schemas/auth.schema';

type VerificationPanelProps = {
  channels: readonly AuthChannel[];
  destinations: Partial<Record<AuthChannel, string>>;
  initialReceipt?: CodeSentResult;
  lockedChannel?: AuthChannel;
  onRequest: (channel: AuthChannel, signal: AbortSignal) => Promise<CodeSentResult | void>;
  onVerify: (channel: AuthChannel, code: string, signal: AbortSignal) => Promise<void>;
  onInvalid?: () => void;
};

const channelDetails = {
  email: { label: 'ایمیل', action: 'ارسال کد به ایمیل', icon: Mail },
  sms: { label: 'پیامک', action: 'ارسال کد پیامکی', icon: Smartphone },
} as const;

export function VerificationPanel({
  channels,
  destinations,
  initialReceipt,
  lockedChannel,
  onRequest,
  onVerify,
  onInvalid,
}: VerificationPanelProps) {
  const availableChannels = useMemo(
    () => channels.filter((channel, index) => channels.indexOf(channel) === index),
    [channels],
  );
  const [selectedChannel, setSelectedChannel] = useState<AuthChannel>(
    lockedChannel ?? availableChannels[0] ?? 'email',
  );
  const [sentChannel, setSentChannel] = useState<AuthChannel | null>(
    initialReceipt?.channel ?? null,
  );
  const [maskedDestinations, setMaskedDestinations] = useState(() => ({
    ...destinations,
    ...(initialReceipt
      ? { [initialReceipt.channel]: initialReceipt.destinationMasked }
      : undefined),
  }));
  const [deadlines, setDeadlines] = useState<Partial<Record<AuthChannel, number>>>(() =>
    initialReceipt
      ? {
          [initialReceipt.channel]: cooldownDeadline(Date.now(), initialReceipt.retryAfterSeconds),
        }
      : {},
  );
  const [code, setCode] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const operationGateRef = useRef<ReturnType<typeof createAuthOperationGate> | null>(null);
  operationGateRef.current ??= createAuthOperationGate();
  const operationGate = operationGateRef.current;
  const { clearError, error, handleError } = useAppError();

  const channel = lockedChannel ?? selectedChannel;
  const remainingSeconds = cooldownRemaining(deadlines[channel] ?? 0, Math.max(now, Date.now()));
  const codeWasSent = sentChannel === channel;
  const destination = maskedDestinations[channel] ?? destinations[channel];

  useEffect(() => () => operationGate.cancel(), [operationGate]);

  useEffect(() => {
    const next = lockedChannel ?? availableChannels[0];
    if (!next || availableChannels.includes(channel)) return;
    setSelectedChannel(next);
    setSentChannel(null);
    setCode('');
  }, [availableChannels, channel, lockedChannel]);

  useEffect(() => {
    setMaskedDestinations((current) => ({
      ...current,
      ...destinations,
      ...(initialReceipt
        ? { [initialReceipt.channel]: initialReceipt.destinationMasked }
        : undefined),
    }));
  }, [destinations, initialReceipt]);

  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [remainingSeconds]);

  useEffect(() => {
    if (!codeWasSent) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [codeWasSent, channel]);

  function selectChannel(nextChannel: AuthChannel) {
    if (busy || lockedChannel) return;
    setSelectedChannel(nextChannel);
    setSentChannel(null);
    setCode('');
    setFieldError(undefined);
    clearError();
  }

  async function requestVerificationCode() {
    if (busy || remainingSeconds > 0 || !availableChannels.includes(channel)) return;
    const operation = operationGate.start();
    setBusy(true);
    setFieldError(undefined);
    clearError();
    try {
      const result = await onRequest(channel, operation.signal);
      if (!operationGate.isCurrent(operation) || !result) return;
      const currentTime = Date.now();
      setNow(currentTime);
      setDeadlines((current) => ({
        ...current,
        [channel]: cooldownDeadline(currentTime, result.retryAfterSeconds),
      }));
      setMaskedDestinations((current) => ({
        ...current,
        [channel]: result.destinationMasked,
      }));
      setSentChannel(channel);
      setCode('');
    } catch (cause) {
      if (!operationGate.isCurrent(operation)) return;
      const retryAfter = getRetryAfterSeconds(cause);
      if (retryAfter !== undefined) {
        const currentTime = Date.now();
        setNow(currentTime);
        setDeadlines((current) => ({
          ...current,
          [channel]: cooldownDeadline(currentTime, retryAfter),
        }));
      }
      const requestError = handleError(cause, {
        context: { operation: 'request-verification-code', channel },
      });
      if (
        requestError.code === ERROR_CODES.AUTH_PREAUTH_INVALID ||
        requestError.code === ERROR_CODES.AUTH_REAUTH_REQUIRED
      ) {
        onInvalid?.();
      }
    } finally {
      if (operationGate.isCurrent(operation)) {
        operationGate.finish(operation);
        setBusy(false);
      }
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!codeWasSent || busy) return;
    const parsed = authCodeSchema.safeParse(code);
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? 'کد تأیید معتبر نیست.');
      return;
    }

    const operation = operationGate.start();
    setBusy(true);
    setFieldError(undefined);
    clearError();
    try {
      await onVerify(channel, parsed.data, operation.signal);
    } catch (cause) {
      if (operationGate.isCurrent(operation)) {
        const verificationError = handleError(cause, {
          context: { operation: 'verify-code', channel },
        });
        if (
          verificationError.code === ERROR_CODES.AUTH_PREAUTH_INVALID ||
          verificationError.code === ERROR_CODES.AUTH_REAUTH_REQUIRED
        ) {
          onInvalid?.();
        }
      }
    } finally {
      if (operationGate.isCurrent(operation)) {
        operationGate.finish(operation);
        setBusy(false);
      }
    }
  }

  if (availableChannels.length === 0) {
    return <FormError error="روش تأیید قابل استفاده‌ای برای این فرایند وجود ندارد." />;
  }

  return (
    <form className="space-y-5" noValidate onSubmit={submit}>
      {!lockedChannel && availableChannels.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-foreground">روش دریافت کد</legend>
          <div className="grid grid-cols-2 gap-2" role="group">
            {availableChannels.map((value) => {
              const details = channelDetails[value];
              const Icon = details.icon;
              return (
                <button
                  aria-pressed={channel === value}
                  className={cn(
                    'min-h-12 rounded-xl border px-3 text-sm font-bold outline-none transition focus-visible:ring-4 focus-visible:ring-ring/15',
                    channel === value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40',
                  )}
                  disabled={busy}
                  key={value}
                  onClick={() => selectChannel(value)}
                  type="button"
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon aria-hidden="true" className="size-4" />
                    {details.label}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <p className="text-sm leading-7 text-muted-foreground">
        {codeWasSent ? (
          <>
            کد شش‌رقمی به <bdi className="font-bold text-foreground">{destination}</bdi> ارسال شد.
          </>
        ) : (
          <>
            کد فقط به {channelDetails[channel].label}{' '}
            <bdi className="font-bold text-foreground">{destination}</bdi> ارسال می‌شود.
          </>
        )}
      </p>

      {codeWasSent && (
        <AuthField
          autoComplete="one-time-code"
          className="text-center font-bold tracking-[0.45em]"
          dir="ltr"
          disabled={busy}
          error={fieldError}
          icon={KeyRound}
          id="verification-code"
          inputMode="numeric"
          label="کد تأیید شش‌رقمی"
          maxLength={12}
          onChange={(event) => {
            setCode(event.currentTarget.value);
            setFieldError(undefined);
          }}
          pattern="[0-9۰-۹٠-٩]*"
          placeholder="••••••"
          ref={inputRef}
          type="text"
          value={code}
        />
      )}

      <FormError error={error} />
      <p aria-live="polite" className="sr-only" role="status">
        {codeWasSent ? 'کد ارسال شد؛ کد شش‌رقمی را وارد کنید.' : 'روش دریافت کد آماده است.'}
      </p>

      {codeWasSent ? (
        <div className="space-y-3">
          <Button aria-busy={busy} className="w-full" disabled={busy} size="auth" type="submit">
            {busy ? 'در حال تأیید…' : 'تأیید کد'}
          </Button>
          <button
            className="w-full rounded-md text-sm font-semibold text-primary outline-none focus-visible:ring-4 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:text-muted-foreground"
            disabled={busy || remainingSeconds > 0}
            onClick={() => void requestVerificationCode()}
            type="button"
          >
            {remainingSeconds > 0
              ? `ارسال دوباره تا ${remainingSeconds.toLocaleString('fa-IR')} ثانیه`
              : 'ارسال دوباره کد'}
          </button>
        </div>
      ) : (
        <Button
          aria-busy={busy}
          className="w-full"
          disabled={busy || remainingSeconds > 0}
          onClick={() => void requestVerificationCode()}
          size="auth"
        >
          {busy
            ? 'در حال ارسال…'
            : remainingSeconds > 0
              ? `ارسال دوباره تا ${remainingSeconds.toLocaleString('fa-IR')} ثانیه`
              : channelDetails[channel].action}
        </Button>
      )}
    </form>
  );
}
