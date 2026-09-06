import { PlusIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ContentLoading,
  ContentPage,
  InlineError,
  selectClassName,
} from '@/features/content/shared/content-ui';
import { formatContentDate } from '@/features/content/shared/content-utils';
import { useContentQuery } from '@/features/content/shared/use-content-query';
import { useAdminSession } from '@/features/users/hooks/use-users';
import { administrationRepository } from '@/features/administration/repository/administration-repository';
import { systemRepository } from '../../repository/system-repository';
import {
  SYSTEM_PERMISSIONS,
  SystemValidationError,
  type BlockIpInput,
  type LoginAttemptReason,
  type SecurityEventStatus,
  type SecuritySeverity,
} from '../../types/system.types';
const eventStatusLabels = { OPEN: 'باز', ACKNOWLEDGED: 'تأییدشده', RESOLVED: 'حل‌شده' } as const;
const severityLabels = { INFO: 'اطلاعاتی', WARNING: 'هشدار', CRITICAL: 'بحرانی' } as const;
const sessionLabels = { ACTIVE: 'فعال', REVOKED: 'لغوشده', EXPIRED: 'منقضی' } as const;
const attemptLabels = {
  SUCCESS: 'موفق',
  INVALID_CREDENTIALS: 'اطلاعات ورود نامعتبر',
  MFA_FAILED: 'خطای MFA',
  ACCOUNT_SUSPENDED: 'حساب تعلیق‌شده',
  RATE_LIMITED: 'محدودیت نرخ',
} as const;
export function SecurityPage() {
  const session = useAdminSession();
  const permissions = session.data?.user?.permissions ?? [];
  const canRead = permissions.includes(SYSTEM_PERMISSIONS.securityRead);
  const canManage = permissions.includes(SYSTEM_PERMISSIONS.securityManage);
  const query = useContentQuery(
    useCallback(async (signal: AbortSignal) => {
      const [sessions, attempts, events, blocked, admins] = await Promise.all([
        systemRepository.listAdminSessions(signal),
        systemRepository.listLoginAttempts({}, signal),
        systemRepository.listSecurityEvents({}, signal),
        systemRepository.listBlockedIps(signal),
        administrationRepository.listAdmins({ pageSize: 100 }, signal),
      ]);
      return { sessions, attempts, events, blocked, admins: admins.items };
    }, []),
    canRead,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [blockOpen, setBlockOpen] = useState(false);
  const [attemptReason, setAttemptReason] = useState<LoginAttemptReason | ''>('');
  const [attemptResult, setAttemptResult] = useState('');
  const [eventStatus, setEventStatus] = useState<SecurityEventStatus | ''>('');
  const [eventSeverity, setEventSeverity] = useState<SecuritySeverity | ''>('');
  if (session.loading || query.loading)
    return (
      <main className="min-w-0 flex-1 p-6">
        <ContentLoading />
      </main>
    );
  if (session.error || query.error)
    return (
      <main className="min-w-0 flex-1 p-6">
        <InlineError message={session.error ?? query.error!} onRetry={query.refetch} />
      </main>
    );
  if (!canRead)
    return (
      <main className="min-w-0 flex-1 p-6">
        <InlineError message="دسترسی مشاهده امنیت را ندارید." />
      </main>
    );
  const data = query.data!;
  const name = (id: string) => data.admins.find((item) => item.id === id)?.displayName ?? id;
  const failed24 = data.attempts.filter(
    (item) => !item.successful && item.createdAt >= '2026-09-05T08:30:00.000Z',
  ).length;
  const active = data.sessions.filter((item) => item.status === 'ACTIVE').length;
  const open = data.events.filter((item) => item.status !== 'RESOLVED').length;
  const critical = data.events.filter(
    (item) => item.severity === 'CRITICAL' && item.status !== 'RESOLVED',
  ).length;
  const attempts = data.attempts.filter(
    (item) =>
      (!attemptReason || item.reason === attemptReason) &&
      (!attemptResult || String(item.successful) === attemptResult),
  );
  const events = data.events.filter(
    (item) =>
      (!eventStatus || item.status === eventStatus) &&
      (!eventSeverity || item.severity === eventSeverity),
  );
  async function revoke(id: string, current: boolean) {
    if (!window.confirm(current ? 'این نشست جاری به‌صورت جداگانه لغو شود؟' : 'این نشست لغو شود؟'))
      return;
    try {
      await systemRepository.revokeSession(id, session.data!.user!.id, current);
      setNotice('نشست لغو شد.');
      query.refetch();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'لغو نشست انجام نشد.');
    }
  }
  async function revokeAll(adminId: string) {
    const current = data.sessions.some(
      (item) => item.adminId === adminId && item.status === 'ACTIVE' && item.isCurrent,
    );
    if (!window.confirm('همه نشست‌های غیرجاری این ادمین لغو شوند؟')) return;
    let includeCurrent = false;
    if (current) includeCurrent = window.confirm('نشست جاری نیز لغو شود؟ این تأیید جداگانه است.');
    try {
      const count = await systemRepository.revokeAllSessions(
        adminId,
        session.data!.user!.id,
        includeCurrent,
      );
      setNotice(`${count.toLocaleString('fa-IR')} نشست لغو شد.`);
      query.refetch();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'لغو نشست‌ها انجام نشد.');
    }
  }
  async function eventAction(id: string, action: 'ack' | 'resolve') {
    try {
      if (action === 'ack')
        await systemRepository.acknowledgeSecurityEvent(id, session.data!.user!.id);
      else await systemRepository.resolveSecurityEvent(id, session.data!.user!.id);
      setNotice('وضعیت رویداد امنیتی ثبت شد.');
      query.refetch();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'عملیات انجام نشد.');
    }
  }
  async function unblock(id: string, ip: string) {
    if (!window.confirm(`مسدودسازی ${ip} لغو شود؟`)) return;
    try {
      await systemRepository.unblockIp(id, session.data!.user!.id);
      setNotice('مسدودسازی IP لغو شد.');
      query.refetch();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'عملیات انجام نشد.');
    }
  }
  return (
    <ContentPage
      title="امنیت"
      description="نشست‌های ادمین، تلاش‌های ورود، رویدادهای امنیتی و IPهای مسدود"
    >
      {notice && <div className="border bg-background p-3 text-xs">{notice}</div>}
      <Tabs defaultValue="overview">
        <TabsList variant="line" className="max-w-full overflow-x-auto">
          <TabsTrigger value="overview">نمای کلی</TabsTrigger>
          <TabsTrigger value="sessions">نشست‌های ادمین</TabsTrigger>
          <TabsTrigger value="attempts">تلاش‌های ورود</TabsTrigger>
          <TabsTrigger value="events">رویدادهای امنیتی</TabsTrigger>
          <TabsTrigger value="ips">IPهای مسدود</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="نشست‌های فعال" value={active} />
            <Metric label="تلاش‌های ناموفق ۲۴ ساعت" value={failed24} />
            <Metric label="رویدادهای باز" value={open} />
            <Metric label="رویدادهای بحرانی" value={critical} />
          </section>
        </TabsContent>
        <TabsContent value="sessions">
          <div className="max-w-full overflow-x-auto border bg-background">
            <table className="w-full min-w-[900px] text-xs">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="p-3 text-start">ادمین</th>
                  <th className="p-3 text-start">وضعیت</th>
                  <th className="p-3 text-start">مرورگر / سیستم</th>
                  <th className="p-3 text-start">دستگاه</th>
                  <th className="p-3 text-start">IP</th>
                  <th className="p-3 text-start">آخرین فعالیت</th>
                  <th className="p-3 text-start">انقضا</th>
                  <th className="p-3 text-start">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.sessions.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3">
                      <Link
                        className="hover:underline"
                        to={`/administration/admins/${item.adminId}`}
                      >
                        {name(item.adminId)}
                      </Link>
                      {item.isCurrent && <span className="ms-1 text-success">جاری</span>}
                    </td>
                    <td className="p-3">{sessionLabels[item.status]}</td>
                    <td className="p-3">
                      {item.browser} · {item.os}
                    </td>
                    <td className="p-3">{item.deviceType}</td>
                    <td className="p-3 font-mono" dir="ltr">
                      {item.ipAddress}
                    </td>
                    <td className="p-3">{formatContentDate(item.lastActiveAt)}</td>
                    <td className="p-3">{formatContentDate(item.expiresAt)}</td>
                    <td className="p-3">
                      {canManage && item.status === 'ACTIVE' && (
                        <div className="flex gap-1">
                          <Button
                            size="xs"
                            variant="destructive"
                            onClick={() => void revoke(item.id, item.isCurrent)}
                          >
                            لغو نشست
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => void revokeAll(item.adminId)}
                          >
                            لغو همه
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {data.sessions.length === 0 && (
                  <EmptyRow columns={8} message="نشستی ثبت نشده است." />
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="attempts">
          <section className="mb-3 flex flex-wrap gap-2 border bg-background p-3">
            <select
              className={selectClassName}
              value={attemptResult}
              onChange={(e) => setAttemptResult(e.target.value)}
            >
              <option value="">همه نتایج</option>
              <option value="true">موفق</option>
              <option value="false">ناموفق</option>
            </select>
            <select
              className={selectClassName}
              value={attemptReason}
              onChange={(e) => setAttemptReason(e.target.value as LoginAttemptReason | '')}
            >
              <option value="">همه دلایل</option>
              {Object.entries(attemptLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </section>
          <div className="max-w-full overflow-x-auto border bg-background">
            <table className="w-full min-w-[720px] text-xs">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="p-3 text-start">ایمیل</th>
                  <th className="p-3 text-start">نتیجه</th>
                  <th className="p-3 text-start">دلیل</th>
                  <th className="p-3 text-start">IP</th>
                  <th className="p-3 text-start">مرورگر</th>
                  <th className="p-3 text-start">زمان</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attempts.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3" dir="ltr">
                      {item.email}
                    </td>
                    <td className={`p-3 ${item.successful ? 'text-success' : 'text-destructive'}`}>
                      {item.successful ? 'موفق' : 'ناموفق'}
                    </td>
                    <td className="p-3">{attemptLabels[item.reason]}</td>
                    <td className="p-3 font-mono" dir="ltr">
                      {item.ipAddress}
                    </td>
                    <td className="p-3">{item.browser}</td>
                    <td className="p-3">{formatContentDate(item.createdAt)}</td>
                  </tr>
                ))}
                {attempts.length === 0 && (
                  <EmptyRow columns={6} message="تلاش ورودی با این فیلتر پیدا نشد." />
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="events">
          <section className="mb-3 flex flex-wrap gap-2 border bg-background p-3">
            <select
              className={selectClassName}
              value={eventStatus}
              onChange={(e) => setEventStatus(e.target.value as SecurityEventStatus | '')}
            >
              <option value="">همه وضعیت‌ها</option>
              {Object.entries(eventStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className={selectClassName}
              value={eventSeverity}
              onChange={(e) => setEventSeverity(e.target.value as SecuritySeverity | '')}
            >
              <option value="">همه شدت‌ها</option>
              {Object.entries(severityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </section>
          <div className="grid gap-3">
            {events.map((item) => (
              <Card key={item.id} className="p-4 shadow-none ring-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{item.titleFa}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{item.descriptionFa}</p>
                    <p className="mt-2 text-xs">
                      {severityLabels[item.severity]} · {eventStatusLabels[item.status]} ·{' '}
                      {formatContentDate(item.detectedAt)}
                    </p>
                  </div>
                  {canManage && item.status !== 'RESOLVED' && (
                    <div className="flex gap-2">
                      {item.status === 'OPEN' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void eventAction(item.id, 'ack')}
                        >
                          تأیید
                        </Button>
                      )}
                      <Button size="sm" onClick={() => void eventAction(item.id, 'resolve')}>
                        حل رویداد
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {events.length === 0 && (
              <Card className="p-10 text-center text-sm text-muted-foreground shadow-none ring-0">
                رویداد امنیتی با این فیلتر پیدا نشد.
              </Card>
            )}
          </div>
        </TabsContent>
        <TabsContent value="ips">
          <div className="mb-3 flex justify-end">
            {canManage && (
              <Button onClick={() => setBlockOpen(true)}>
                <PlusIcon data-icon="inline-start" />
                مسدودسازی IP
              </Button>
            )}
          </div>
          <div className="max-w-full overflow-x-auto border bg-background">
            <table className="w-full min-w-[720px] text-xs">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="p-3 text-start">IP</th>
                  <th className="p-3 text-start">دلیل</th>
                  <th className="p-3 text-start">وضعیت</th>
                  <th className="p-3 text-start">ایجاد</th>
                  <th className="p-3 text-start">انقضا</th>
                  <th className="p-3 text-start">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.blocked.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-mono" dir="ltr">
                      {item.ipAddress}
                    </td>
                    <td className="p-3">{item.reason}</td>
                    <td className="p-3">{item.status === 'ACTIVE' ? 'فعال' : 'منقضی'}</td>
                    <td className="p-3">{formatContentDate(item.createdAt)}</td>
                    <td className="p-3">{formatContentDate(item.expiresAt)}</td>
                    <td className="p-3">
                      {canManage && item.status === 'ACTIVE' && (
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => void unblock(item.id, item.ipAddress)}
                        >
                          رفع مسدودی
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {data.blocked.length === 0 && (
                  <EmptyRow columns={6} message="نشانی مسدودی ثبت نشده است." />
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
      {blockOpen && (
        <BlockDialog
          actorId={session.data!.user!.id}
          currentIp={data.sessions.find((item) => item.isCurrent)?.ipAddress}
          onClose={() => setBlockOpen(false)}
          onSaved={() => {
            setBlockOpen(false);
            setNotice('نشانی IP مسدود شد.');
            query.refetch();
          }}
        />
      )}
    </ContentPage>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4 shadow-none ring-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value.toLocaleString('fa-IR')}</p>
    </Card>
  );
}
function EmptyRow({ columns, message }: { columns: number; message: string }) {
  return (
    <tr>
      <td colSpan={columns} className="p-10 text-center text-sm text-muted-foreground">
        {message}
      </td>
    </tr>
  );
}
function BlockDialog({
  actorId,
  currentIp,
  onClose,
  onSaved,
}: {
  actorId: string;
  currentIp?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<BlockIpInput>({ ipAddress: '', reason: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    let confirmCurrent = false;
    if (form.ipAddress.trim() === currentIp) {
      confirmCurrent = window.confirm(
        'این IP متعلق به نشست جاری است. با مسدودسازی صریح آن ادامه می‌دهید؟',
      );
      if (!confirmCurrent) return;
    }
    if (!window.confirm(`نشانی ${form.ipAddress} مسدود شود؟`)) return;
    setBusy(true);
    setErrors({});
    try {
      await systemRepository.blockIp({ ...form, confirmCurrent }, actorId);
      onSaved();
    } catch (error) {
      setErrors(
        error instanceof SystemValidationError
          ? error.fields
          : { form: error instanceof Error ? error.message : 'مسدودسازی انجام نشد.' },
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      open
      dir="rtl"
      className="fixed inset-0 z-50 m-auto w-[min(32rem,calc(100%-2rem))] border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/40"
    >
      <form onSubmit={(event) => void submit(event)}>
        <header className="border-b p-4">
          <h2 className="font-medium">مسدودسازی IP</h2>
        </header>
        <div className="grid gap-4 p-4">
          <label className="grid gap-1.5 text-xs">
            <span>نشانی IPv4</span>
            <Input
              dir="ltr"
              value={form.ipAddress}
              onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
            />
            {errors.ipAddress && <span className="text-destructive">{errors.ipAddress}</span>}
          </label>
          <label className="grid gap-1.5 text-xs">
            <span>دلیل</span>
            <Input
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
            {errors.reason && <span className="text-destructive">{errors.reason}</span>}
          </label>
          <label className="grid gap-1.5 text-xs">
            <span>انقضای اختیاری</span>
            <Input
              type="datetime-local"
              onChange={(e) =>
                setForm({
                  ...form,
                  expiresAt: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                })
              }
            />
          </label>
          {errors.form && <p className="text-xs text-destructive">{errors.form}</p>}
        </div>
        <footer className="flex justify-end gap-2 border-t p-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'در حال ثبت' : 'مسدودسازی'}
          </Button>
        </footer>
      </form>
    </dialog>
  );
}
