import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentLoading, ContentPage, InlineError } from '@/features/content/shared/content-ui';
import { useContentQuery } from '@/features/content/shared/use-content-query';
import { useAdminSession } from '@/features/users/hooks/use-users';
import { systemRepository } from '../../repository/system-repository';
import {
  SYSTEM_PERMISSIONS,
  SystemValidationError,
  type SettingsSection,
  type SystemSettings,
} from '../../types/system.types';

const sections: [SettingsSection, string][] = [
  ['GENERAL', 'عمومی'],
  ['AUTHENTICATION', 'احراز هویت'],
  ['EMAIL', 'ایمیل'],
  ['SMS', 'پیامک'],
  ['SEO', 'SEO'],
  ['BLOG', 'وبلاگ'],
  ['MAINTENANCE', 'حالت نگهداری'],
];

export function SettingsPage() {
  const session = useAdminSession();
  const permissions = session.data?.user?.permissions ?? [];
  const canRead = permissions.includes(SYSTEM_PERMISSIONS.settingsRead);
  const canManage = permissions.includes(SYSTEM_PERMISSIONS.settingsManage);
  const query = useContentQuery(
    useCallback((signal: AbortSignal) => systemRepository.getSettings(signal), []),
    canRead,
  );
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
        <InlineError message="دسترسی مشاهده تنظیمات را ندارید." />
      </main>
    );
  if (!query.data || !session.data?.user)
    return (
      <main className="min-w-0 flex-1 p-6">
        <InlineError message="تنظیمات در دسترس نیست." onRetry={query.refetch} />
      </main>
    );
  return (
    <SettingsEditor initial={query.data} actorId={session.data.user.id} canManage={canManage} />
  );
}

function SettingsEditor({
  initial,
  actorId,
  canManage,
}: {
  initial: SystemSettings;
  actorId: string;
  canManage: boolean;
}) {
  const [draft, setDraft] = useState(() => structuredClone(initial));
  const [saved, setSaved] = useState(() => structuredClone(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const dirty = (section: SettingsSection) =>
    JSON.stringify(draft[section]) !== JSON.stringify(saved[section]);
  const update = <K extends SettingsSection>(section: K, value: SystemSettings[K]) =>
    setDraft((current) => ({ ...current, [section]: value }));
  function reset(section: SettingsSection) {
    update(section, structuredClone(saved[section]));
    setErrors({});
    setNotice(null);
  }
  async function save(section: SettingsSection) {
    let confirmMaintenance = false;
    if (section === 'MAINTENANCE' && draft.MAINTENANCE.enabled && !saved.MAINTENANCE.enabled) {
      confirmMaintenance = window.confirm('حالت نگهداری فعال شود؟');
      if (!confirmMaintenance) return;
    }
    setBusy(true);
    setErrors({});
    try {
      switch (section) {
        case 'GENERAL':
          await systemRepository.updateSettings(section, draft.GENERAL, actorId);
          break;
        case 'AUTHENTICATION':
          await systemRepository.updateSettings(section, draft.AUTHENTICATION, actorId);
          break;
        case 'EMAIL':
          await systemRepository.updateSettings(section, draft.EMAIL, actorId);
          break;
        case 'SMS':
          await systemRepository.updateSettings(section, draft.SMS, actorId);
          break;
        case 'SEO':
          await systemRepository.updateSettings(section, draft.SEO, actorId);
          break;
        case 'BLOG':
          await systemRepository.updateSettings(section, draft.BLOG, actorId);
          break;
        case 'MAINTENANCE':
          await systemRepository.updateSettings(
            section,
            draft.MAINTENANCE,
            actorId,
            confirmMaintenance,
          );
          break;
      }
      setSaved((current) => ({ ...current, [section]: structuredClone(draft[section]) }));
      setNotice('تنظیمات ذخیره شد.');
    } catch (error) {
      setErrors(
        error instanceof SystemValidationError
          ? error.fields
          : { form: error instanceof Error ? error.message : 'ذخیره تنظیمات انجام نشد.' },
      );
    } finally {
      setBusy(false);
    }
  }
  const actions = (section: SettingsSection) => (
    <div className="flex items-center justify-end gap-2 border-t pt-4">
      <Button variant="ghost" disabled={!dirty(section) || busy} onClick={() => reset(section)}>
        بازنشانی تغییرات
      </Button>
      <Button disabled={!canManage || !dirty(section) || busy} onClick={() => void save(section)}>
        {busy ? 'در حال ذخیره' : 'ذخیره'}
      </Button>
    </div>
  );
  return (
    <ContentPage title="تنظیمات" description="پیکربندی عمومی و عملیاتی پنل واند">
      {notice && <div className="border bg-background p-3 text-xs">{notice}</div>}
      {errors.form && <p className="text-xs text-destructive">{errors.form}</p>}
      <Tabs defaultValue="GENERAL">
        <TabsList variant="line" className="max-w-full overflow-x-auto">
          {sections.map(([key, label]) => (
            <TabsTrigger key={key} value={key}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="GENERAL">
          <Panel disabled={!canManage}>
            <Field label="نام محصول" error={errors.productName}>
              <Input
                value={draft.GENERAL.productName}
                onChange={(e) =>
                  update('GENERAL', { ...draft.GENERAL, productName: e.target.value })
                }
              />
            </Field>
            <Field label="زبان پیش‌فرض">
              <Input value={draft.GENERAL.defaultLocale} disabled />
            </Field>
            <Field label="منطقه زمانی">
              <Input value={draft.GENERAL.timezone} disabled />
            </Field>
            <Field label="ایمیل پشتیبانی" error={errors.supportEmail}>
              <Input
                dir="ltr"
                type="email"
                value={draft.GENERAL.supportEmail}
                onChange={(e) =>
                  update('GENERAL', { ...draft.GENERAL, supportEmail: e.target.value })
                }
              />
            </Field>
            {actions('GENERAL')}
          </Panel>
        </TabsContent>
        <TabsContent value="AUTHENTICATION">
          <Panel disabled={!canManage}>
            <Toggle
              label="الزام MFA برای ادمین‌ها"
              value={draft.AUTHENTICATION.adminMfaRequired}
              onChange={(value) =>
                update('AUTHENTICATION', { ...draft.AUTHENTICATION, adminMfaRequired: value })
              }
            />
            <NumberField
              label="مدت نشست ادمین (ساعت)"
              value={draft.AUTHENTICATION.adminSessionHours}
              min={1}
              max={168}
              error={errors.adminSessionHours}
              onChange={(value) =>
                update('AUTHENTICATION', { ...draft.AUTHENTICATION, adminSessionHours: value })
              }
            />
            <NumberField
              label="مدت نشست کاربر (روز)"
              value={draft.AUTHENTICATION.userSessionDays}
              min={1}
              max={90}
              error={errors.userSessionDays}
              onChange={(value) =>
                update('AUTHENTICATION', { ...draft.AUTHENTICATION, userSessionDays: value })
              }
            />
            <NumberField
              label="حداکثر تلاش ورود"
              value={draft.AUTHENTICATION.maxLoginAttempts}
              min={3}
              max={20}
              error={errors.maxLoginAttempts}
              onChange={(value) =>
                update('AUTHENTICATION', { ...draft.AUTHENTICATION, maxLoginAttempts: value })
              }
            />
            <NumberField
              label="زمان قفل (دقیقه)"
              value={draft.AUTHENTICATION.lockoutMinutes}
              min={1}
              max={1440}
              error={errors.lockoutMinutes}
              onChange={(value) =>
                update('AUTHENTICATION', { ...draft.AUTHENTICATION, lockoutMinutes: value })
              }
            />
            {actions('AUTHENTICATION')}
          </Panel>
        </TabsContent>
        <TabsContent value="EMAIL">
          <Panel disabled={!canManage}>
            <Toggle
              label="فعال‌بودن ایمیل"
              value={draft.EMAIL.enabled}
              onChange={(value) => update('EMAIL', { ...draft.EMAIL, enabled: value })}
            />
            <Field label="نام فرستنده" error={errors.senderName}>
              <Input
                value={draft.EMAIL.senderName}
                onChange={(e) => update('EMAIL', { ...draft.EMAIL, senderName: e.target.value })}
              />
            </Field>
            <Field label="ایمیل فرستنده" error={errors.senderEmail}>
              <Input
                dir="ltr"
                type="email"
                value={draft.EMAIL.senderEmail}
                onChange={(e) => update('EMAIL', { ...draft.EMAIL, senderEmail: e.target.value })}
              />
            </Field>
            <Field label="ایمیل پاسخ" error={errors.replyToEmail}>
              <Input
                dir="ltr"
                type="email"
                value={draft.EMAIL.replyToEmail}
                onChange={(e) => update('EMAIL', { ...draft.EMAIL, replyToEmail: e.target.value })}
              />
            </Field>
            {actions('EMAIL')}
          </Panel>
        </TabsContent>
        <TabsContent value="SMS">
          <Panel disabled={!canManage}>
            <Toggle
              label="فعال‌بودن پیامک"
              value={draft.SMS.enabled}
              onChange={(value) => update('SMS', { ...draft.SMS, enabled: value })}
            />
            <Toggle
              label="پیامک رمز یک‌بارمصرف"
              value={draft.SMS.otpEnabled}
              onChange={(value) => update('SMS', { ...draft.SMS, otpEnabled: value })}
            />
            <Toggle
              label="پیامک اعلان‌ها"
              value={draft.SMS.notificationSmsEnabled}
              onChange={(value) => update('SMS', { ...draft.SMS, notificationSmsEnabled: value })}
            />
            {actions('SMS')}
          </Panel>
        </TabsContent>
        <TabsContent value="SEO">
          <Panel disabled={!canManage}>
            <Field label="نام سایت">
              <Input
                value={draft.SEO.siteName}
                onChange={(e) => update('SEO', { ...draft.SEO, siteName: e.target.value })}
              />
            </Field>
            <Field label="عنوان پیش‌فرض" error={errors.defaultTitle}>
              <Input
                value={draft.SEO.defaultTitle}
                onChange={(e) => update('SEO', { ...draft.SEO, defaultTitle: e.target.value })}
              />
            </Field>
            <Field label="توضیح پیش‌فرض" error={errors.defaultDescription}>
              <textarea
                className="min-h-24 border bg-background p-2 text-sm"
                value={draft.SEO.defaultDescription}
                onChange={(e) =>
                  update('SEO', { ...draft.SEO, defaultDescription: e.target.value })
                }
              />
            </Field>
            <Toggle
              label="اجازه نمایه‌سازی"
              value={draft.SEO.allowIndexing}
              onChange={(value) => update('SEO', { ...draft.SEO, allowIndexing: value })}
            />
            {actions('SEO')}
          </Panel>
        </TabsContent>
        <TabsContent value="BLOG">
          <Panel disabled={!canManage}>
            <NumberField
              label="تعداد نوشته در صفحه"
              value={draft.BLOG.postsPerPage}
              min={6}
              max={50}
              error={errors.postsPerPage}
              onChange={(value) => update('BLOG', { ...draft.BLOG, postsPerPage: value })}
            />
            <Toggle
              label="فعال‌بودن نظرات"
              value={draft.BLOG.commentsEnabled}
              onChange={(value) => update('BLOG', { ...draft.BLOG, commentsEnabled: value })}
            />
            <Toggle
              label="اجازه نظر مهمان"
              value={draft.BLOG.guestCommentsEnabled}
              onChange={(value) => update('BLOG', { ...draft.BLOG, guestCommentsEnabled: value })}
            />
            <Toggle
              label="نیاز به تأیید نظر"
              value={draft.BLOG.commentsRequireModeration}
              onChange={(value) =>
                update('BLOG', { ...draft.BLOG, commentsRequireModeration: value })
              }
            />
            {actions('BLOG')}
          </Panel>
        </TabsContent>
        <TabsContent value="MAINTENANCE">
          <Panel disabled={!canManage}>
            <Toggle
              label="حالت نگهداری"
              value={draft.MAINTENANCE.enabled}
              onChange={(value) => update('MAINTENANCE', { ...draft.MAINTENANCE, enabled: value })}
            />
            <Field label="پیام" error={errors.message}>
              <textarea
                className="min-h-24 border bg-background p-2 text-sm"
                value={draft.MAINTENANCE.message}
                onChange={(e) =>
                  update('MAINTENANCE', { ...draft.MAINTENANCE, message: e.target.value })
                }
              />
            </Field>
            <Toggle
              label="اجازه دسترسی ادمین"
              value={draft.MAINTENANCE.allowAdminAccess}
              onChange={(value) =>
                update('MAINTENANCE', { ...draft.MAINTENANCE, allowAdminAccess: value })
              }
            />
            {actions('MAINTENANCE')}
          </Panel>
        </TabsContent>
      </Tabs>
    </ContentPage>
  );
}

function Panel({ children, disabled }: { children: React.ReactNode; disabled: boolean }) {
  return (
    <fieldset disabled={disabled} className="contents">
      <Card className="grid max-w-3xl gap-5 p-5 shadow-none ring-0">{children}</Card>
    </fieldset>
  );
}
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-xs">
      <span>{label}</span>
      {children}
      {error && <span className="text-destructive">{error}</span>}
    </label>
  );
}
function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
function NumberField({
  label,
  value,
  min,
  max,
  error,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  error?: string;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label} error={error}>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}
