import { PlusIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  ContentLoading,
  ContentPage,
  InlineError,
  selectClassName,
} from '@/features/content/shared/content-ui';
import { formatContentDate } from '@/features/content/shared/content-utils';
import { useContentQuery } from '@/features/content/shared/use-content-query';
import { administrationRepository } from '@/features/administration/repository/administration-repository';
import { useAdminSession } from '@/features/users/hooks/use-users';
import { systemRepository } from '../../repository/system-repository';
import {
  SYSTEM_PERMISSIONS,
  SystemValidationError,
  type FeatureFlag,
  type FeatureFlagInput,
  type FeatureOwner,
  type FeatureRolloutStrategy,
} from '../../types/system.types';

const strategyLabels: Record<FeatureRolloutStrategy, string> = {
  ALL: 'همه کاربران',
  PERCENTAGE: 'درصدی',
  ADMINS_ONLY: 'فقط ادمین‌ها',
};
const ownerLabels: Record<FeatureOwner, string> = {
  PRODUCT: 'محصول',
  DATA: 'داده',
  CONTENT: 'محتوا',
  PLATFORM: 'پلتفرم',
};
const empty: FeatureFlagInput = {
  key: '',
  nameFa: '',
  descriptionFa: '',
  enabled: false,
  rollout: { strategy: 'ADMINS_ONLY' },
  owner: 'PRODUCT',
};

export function FeatureFlagsPage() {
  const session = useAdminSession();
  const permissions = session.data?.user?.permissions ?? [];
  const canRead = permissions.includes(SYSTEM_PERMISSIONS.flagsRead);
  const canManage = permissions.includes(SYSTEM_PERMISSIONS.flagsManage);
  const query = useContentQuery(
    useCallback(async (signal: AbortSignal) => {
      const [flags, admins] = await Promise.all([
        systemRepository.listFeatureFlags(signal),
        administrationRepository.listAdmins({ pageSize: 100 }, signal),
      ]);
      return { flags, admins: admins.items };
    }, []),
    canRead,
  );
  const [editing, setEditing] = useState<FeatureFlag | null | undefined>(undefined);
  const [notice, setNotice] = useState<string | null>(null);
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
        <InlineError message="دسترسی مشاهده فلگ‌های ویژگی را ندارید." />
      </main>
    );
  const name = (id: string) => query.data!.admins.find((item) => item.id === id)?.displayName ?? id;
  async function toggle(flag: FeatureFlag) {
    const enablingAll = !flag.enabled && flag.rollout.strategy === 'ALL';
    const confirmAll = enablingAll || (flag.enabled && flag.rollout.strategy === 'ALL');
    if (
      !window.confirm(
        enablingAll ? 'این فلگ برای همه کاربران فعال شود؟' : 'وضعیت این فلگ تغییر کند؟',
      )
    )
      return;
    try {
      await systemRepository.updateFeatureFlag(
        flag.id,
        {
          nameFa: flag.nameFa,
          descriptionFa: flag.descriptionFa,
          enabled: !flag.enabled,
          rollout: flag.rollout,
          owner: flag.owner,
        },
        session.data!.user!.id,
        confirmAll,
      );
      setNotice('فلگ ویژگی به‌روزرسانی شد.');
      query.refetch();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'عملیات انجام نشد.');
    }
  }
  return (
    <ContentPage
      title="فلگ‌های ویژگی"
      description="مدیریت تدریجی قابلیت‌های محصول در قرارداد محلی پنل"
      action={
        canManage ? (
          <Button onClick={() => setEditing(null)}>
            <PlusIcon data-icon="inline-start" />
            فلگ جدید
          </Button>
        ) : undefined
      }
    >
      {notice && <div className="border bg-background p-3 text-xs">{notice}</div>}
      <Card className="min-w-0 overflow-hidden py-0 shadow-none ring-0">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[960px] text-xs">
            <thead className="border-b bg-muted/40 text-muted-foreground">
              <tr>
                <th className="p-3 text-start">ویژگی</th>
                <th className="p-3 text-start">key</th>
                <th className="p-3 text-start">وضعیت</th>
                <th className="p-3 text-start">انتشار</th>
                <th className="p-3 text-start">مالک</th>
                <th className="p-3 text-start">آخرین تغییر</th>
                <th className="p-3 text-start">تغییر‌دهنده</th>
                <th className="p-3 text-start">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {query.data!.flags.map((flag) => (
                <tr key={flag.id}>
                  <td className="p-3">
                    <p className="font-medium">{flag.nameFa}</p>
                    <p className="mt-1 text-muted-foreground">{flag.descriptionFa}</p>
                  </td>
                  <td className="p-3 font-mono" dir="ltr">
                    {flag.key}
                  </td>
                  <td className={`p-3 ${flag.enabled ? 'text-success' : 'text-muted-foreground'}`}>
                    {flag.enabled ? 'فعال' : 'غیرفعال'}
                  </td>
                  <td className="p-3">
                    {strategyLabels[flag.rollout.strategy]}
                    {flag.rollout.strategy === 'PERCENTAGE'
                      ? ` · ${flag.rollout.percentage?.toLocaleString('fa-IR')}٪`
                      : ''}
                  </td>
                  <td className="p-3">{ownerLabels[flag.owner]}</td>
                  <td className="p-3">{formatContentDate(flag.updatedAt)}</td>
                  <td className="p-3">{name(flag.updatedByAdminId)}</td>
                  <td className="p-3">
                    {canManage && (
                      <div className="flex gap-1">
                        <Button size="xs" variant="outline" onClick={() => setEditing(flag)}>
                          ویرایش
                        </Button>
                        <Button
                          size="xs"
                          variant={flag.enabled ? 'destructive' : 'default'}
                          onClick={() => void toggle(flag)}
                        >
                          {flag.enabled ? 'غیرفعال‌کردن' : 'فعال‌کردن'}
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {query.data!.flags.length === 0 && (
          <p className="p-10 text-center text-sm text-muted-foreground">فلگی ثبت نشده است.</p>
        )}
      </Card>
      {editing !== undefined && (
        <FlagDialog
          flag={editing}
          actorId={session.data!.user!.id}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            setNotice(editing ? 'فلگ ویژگی به‌روزرسانی شد.' : 'فلگ ویژگی ایجاد شد.');
            query.refetch();
          }}
        />
      )}
    </ContentPage>
  );
}

function FlagDialog({
  flag,
  actorId,
  onClose,
  onSaved,
}: {
  flag: FeatureFlag | null;
  actorId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FeatureFlagInput>(
    flag
      ? {
          key: flag.key,
          nameFa: flag.nameFa,
          descriptionFa: flag.descriptionFa,
          enabled: flag.enabled,
          rollout: flag.rollout,
          owner: flag.owner,
        }
      : empty,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    let confirmAll = false;
    if (
      (flag?.enabled && flag.rollout.strategy === 'ALL') ||
      (form.enabled &&
        form.rollout.strategy === 'ALL' &&
        (!flag || !flag.enabled || flag.rollout.strategy !== 'ALL'))
    ) {
      confirmAll = window.confirm('این تغییر برای فلگی که همه کاربران را پوشش می‌دهد اعمال شود؟');
      if (!confirmAll) return;
    }
    setBusy(true);
    setErrors({});
    try {
      if (flag)
        await systemRepository.updateFeatureFlag(
          flag.id,
          {
            nameFa: form.nameFa,
            descriptionFa: form.descriptionFa,
            enabled: form.enabled,
            rollout: form.rollout,
            owner: form.owner,
          },
          actorId,
          confirmAll,
        );
      else await systemRepository.createFeatureFlag(form, actorId, confirmAll);
      onSaved();
    } catch (error) {
      setErrors(
        error instanceof SystemValidationError
          ? error.fields
          : { form: error instanceof Error ? error.message : 'ذخیره انجام نشد.' },
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      open
      dir="rtl"
      className="fixed inset-0 z-50 m-auto w-[min(38rem,calc(100%-2rem))] border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/40"
    >
      <form onSubmit={(event) => void submit(event)}>
        <header className="border-b p-4">
          <h2 className="font-medium">{flag ? 'ویرایش فلگ' : 'فلگ جدید'}</h2>
        </header>
        <div className="grid gap-4 p-4 sm:grid-cols-2">
          <Field label="نام ویژگی" error={errors.nameFa}>
            <Input
              value={form.nameFa}
              onChange={(e) => setForm({ ...form, nameFa: e.target.value })}
            />
          </Field>
          <Field label="کلید" error={errors.key}>
            <Input
              dir="ltr"
              disabled={Boolean(flag)}
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value })}
            />
          </Field>
          <Field label="توضیح" className="sm:col-span-2">
            <Input
              value={form.descriptionFa}
              onChange={(e) => setForm({ ...form, descriptionFa: e.target.value })}
            />
          </Field>
          <Field label="مالک">
            <select
              className={selectClassName}
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value as FeatureOwner })}
            >
              {Object.entries(ownerLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="روش انتشار">
            <select
              className={selectClassName}
              value={form.rollout.strategy}
              onChange={(e) => {
                const strategy = e.target.value as FeatureRolloutStrategy;
                setForm({
                  ...form,
                  rollout:
                    strategy === 'PERCENTAGE'
                      ? { strategy, percentage: form.rollout.percentage ?? 0 }
                      : { strategy },
                });
              }}
            >
              {Object.entries(strategyLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          {form.rollout.strategy === 'PERCENTAGE' && (
            <Field label="درصد انتشار" error={errors.percentage}>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.rollout.percentage ?? 0}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rollout: { strategy: 'PERCENTAGE', percentage: Number(e.target.value) },
                  })
                }
              />
            </Field>
          )}
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
            />
            فعال
          </label>
          {errors.form && <p className="sm:col-span-2 text-xs text-destructive">{errors.form}</p>}
        </div>
        <footer className="flex justify-end gap-2 border-t p-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'در حال ذخیره' : 'ذخیره'}
          </Button>
        </footer>
      </form>
    </dialog>
  );
}
function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`grid gap-1.5 text-xs ${className ?? ''}`}>
      <span>{label}</span>
      {children}
      {error && <span className="text-destructive">{error}</span>}
    </label>
  );
}
