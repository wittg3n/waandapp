import { useState, type FormEvent } from 'react';
import { adminRequest } from './admin-api';
import { useAdminSession } from './admin-session-context';

export default function AdminLogin() {
  const session = useAdminSession();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [channel, setChannel] = useState<'email' | 'sms'>('email');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const preauth = session.data?.preauth;
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await adminRequest(preauth ? '/auth/second-step/verify' : '/auth/login', {
        method: 'POST',
        body: preauth ? { channel, code } : { identifier, password },
      });
      setPassword('');
      setCode('');
      session.refetch();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ورود انجام نشد.');
    } finally {
      setBusy(false);
    }
  }
  async function sendCode() {
    setBusy(true);
    setError('');
    try {
      await adminRequest('/auth/second-step/request', { method: 'POST', body: { channel } });
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ارسال انجام نشد.');
    } finally {
      setBusy(false);
    }
  }
  const field = 'w-full rounded-lg border bg-background px-3 py-2';
  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 p-6" dir="rtl">
      <form
        className="w-full max-w-sm space-y-5 rounded-2xl border bg-background p-7 shadow-sm"
        onSubmit={submit}
      >
        <h1 className="text-xl font-semibold">ورود به مدیریت واند</h1>
        {preauth ? (
          <>
            <label className="block">
              روش تأیید
              <select
                className={field}
                value={channel}
                onChange={(event) => {
                  setChannel(event.target.value as 'email' | 'sms');
                  setSent(false);
                }}
                disabled={busy}
              >
                {preauth.allowedChannels.map((value) => (
                  <option key={value} value={value}>
                    {value === 'email' ? 'ایمیل' : 'پیامک'}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm" dir="ltr">
              {preauth.destinations[channel]}
            </p>
            <button
              className="underline"
              type="button"
              disabled={busy}
              onClick={() => void sendCode()}
            >
              ارسال کد تأیید
            </button>
            {sent && <p role="status">کد ارسال شد.</p>}
            <label className="block">
              کد تأیید
              <input
                className={field}
                dir="ltr"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </label>
          </>
        ) : (
          <>
            <label className="block">
              نام کاربری یا ایمیل
              <input
                className={field}
                dir="ltr"
                autoComplete="username"
                required
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
              />
            </label>
            <label className="block">
              رمز عبور
              <input
                className={field}
                dir="ltr"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
          </>
        )}
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        <button
          className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
          disabled={busy}
          type="submit"
        >
          {busy ? 'در حال بررسی…' : preauth ? 'تأیید و ورود' : 'ورود'}
        </button>
      </form>
    </main>
  );
}
