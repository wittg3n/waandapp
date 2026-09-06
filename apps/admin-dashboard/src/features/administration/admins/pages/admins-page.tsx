import { PlusIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminSession } from '@/features/users/hooks/use-users';
import { formatContentDate } from '@/features/content/shared/content-utils';
import {
  ContentPage,
  ContentTable,
  ContentToolbar,
  InlineError,
  selectClassName,
  type ContentColumn,
} from '@/features/content/shared/content-ui';
import { useContentQuery } from '@/features/content/shared/use-content-query';
import { administrationRepository } from '../../repository/administration-repository';
import {
  ADMIN_PERMISSIONS,
  ADMIN_STATUS_LABELS,
  AdministrationValidationError,
  type AdminRow,
  type AdminStatus,
  type InviteAdminInput,
  type RoleRow,
} from '../../types/administration.types';

export function AdminsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const session = useAdminSession();
  const permissions = session.data?.user?.permissions ?? [];
  const canRead = permissions.includes(ADMIN_PERMISSIONS.adminsRead);
  const canCreate = permissions.includes(ADMIN_PERMISSIONS.adminsCreate);
  const canUpdate = permissions.includes(ADMIN_PERMISSIONS.adminsUpdate);
  const canSuspend = permissions.includes(ADMIN_PERMISSIONS.adminsSuspend);
  const isPlatform =
    Boolean(session.data?.user?.adminRoles.includes('PLATFORM_ADMIN')) &&
    !session.data?.user?.adminRoles.includes('SUPER_ADMIN');
  const [invite, setInvite] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const query = useContentQuery(
    useCallback(
      (signal: AbortSignal) =>
        administrationRepository.listAdmins(
          {
            search: params.get('search') || undefined,
            status: (params.get('status') || undefined) as AdminStatus | undefined,
            role: params.get('role') || undefined,
            mfa: params.has('mfa') ? params.get('mfa') === 'true' : undefined,
            sort: (params.get('sort') || 'createdAt') as
              'displayName' | 'createdAt' | 'lastLoginAt',
            page: Number(params.get('page')) || 1,
            pageSize: (Number(params.get('pageSize')) || 20) as 20 | 50 | 100,
          },
          signal,
        ),
      [params],
    ),
    canRead,
  );
  const roles = useContentQuery(
    useCallback((signal: AbortSignal) => administrationRepository.listRoles(signal), []),
    canRead,
  );
  function change(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setParams(next);
  }
  async function suspend(admin: AdminRow) {
    if (!window.confirm(`حساب «${admin.displayName}» تعلیق شود؟`)) return;
    try {
      await administrationRepository.suspendAdmin(admin.id, session.data!.user!.id);
      query.refetch();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'عملیات انجام نشد.');
    }
  }
  async function reactivate(admin: AdminRow) {
    try {
      await administrationRepository.reactivateAdmin(admin.id, session.data!.user!.id);
      query.refetch();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'عملیات انجام نشد.');
    }
  }
  async function revoke(admin: AdminRow) {
    if (!window.confirm(`دعوت «${admin.displayName}» لغو شود؟`)) return;
    try {
      await administrationRepository.revokeInvitation(admin.id, session.data!.user!.id);
      query.refetch();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'عملیات انجام نشد.');
    }
  }
  const columns: ContentColumn<AdminRow>[] = [
    {
      key: 'admin',
      title: 'ادمین',
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.avatarUrl ? (
            <img src={item.avatarUrl} alt="" className="size-9 shrink-0 object-cover" />
          ) : (
            <span className="grid size-9 shrink-0 place-items-center bg-muted font-medium">
              {item.displayName
                .split(' ')
                .map((part) => part[0])
                .join('')
                .slice(0, 2)}
            </span>
          )}
          <div>
            <p className="font-medium">{item.displayName}</p>
            <p className="mt-1 text-[11px] text-muted-foreground" dir="ltr">
              {item.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'roles',
      title: 'نقش‌ها',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.roles.map((role) => (
            <span key={role.id} className="bg-muted px-2 py-1">
              {role.nameFa}
            </span>
          ))}
        </div>
      ),
    },
    { key: 'status', title: 'وضعیت', render: (item) => <Status status={item.status} /> },
    {
      key: 'mfa',
      title: 'احراز هویت دومرحله‌ای',
      render: (item) => (item.mfaEnabled ? 'فعال' : 'غیرفعال'),
    },
    { key: 'login', title: 'آخرین ورود', render: (item) => formatContentDate(item.lastLoginAt) },
    { key: 'created', title: 'تاریخ ایجاد', render: (item) => formatContentDate(item.createdAt) },
    {
      key: 'actions',
      title: 'عملیات',
      render: (item) => (
        <div className="flex gap-1" onClick={(event) => event.stopPropagation()}>
          <Button
            size="xs"
            variant="ghost"
            render={<Link to={`/administration/admins/${item.id}`} />}
          >
            مشاهده
          </Button>
          {canSuspend &&
            item.status === 'ACTIVE' &&
            !(isPlatform && item.roleIds.includes('SUPER_ADMIN')) && (
              <Button
                size="xs"
                variant="destructive"
                disabled={item.id === session.data?.user?.id}
                onClick={() => void suspend(item)}
              >
                تعلیق
              </Button>
            )}
          {canSuspend &&
            item.status === 'SUSPENDED' &&
            !(isPlatform && item.roleIds.includes('SUPER_ADMIN')) && (
              <Button size="xs" variant="outline" onClick={() => void reactivate(item)}>
                فعال‌سازی
              </Button>
            )}
          {canUpdate &&
            item.status === 'INVITED' &&
            !(isPlatform && item.roleIds.includes('SUPER_ADMIN')) && (
              <Button size="xs" variant="destructive" onClick={() => void revoke(item)}>
                لغو دعوت
              </Button>
            )}
        </div>
      ),
    },
  ];
  return (
    <ContentPage
      title="ادمین‌ها"
      description="مدیریت حساب‌های دارای دسترسی به پنل مدیریت واند"
      action={
        canCreate ? (
          <Button onClick={() => setInvite(true)}>
            <PlusIcon data-icon="inline-start" />
            دعوت ادمین
          </Button>
        ) : undefined
      }
    >
      {notice && <InlineError message={notice} />}{' '}
      {!session.loading && !canRead ? (
        <InlineError message="دسترسی مشاهده ادمین‌ها را ندارید." />
      ) : (
        <>
          <ContentToolbar
            params={params}
            total={query.data?.total ?? 0}
            onChange={change}
            onReset={() => setParams({})}
          >
            <select
              className={selectClassName}
              value={params.get('status') ?? ''}
              onChange={(e) => change('status', e.target.value)}
            >
              <option value="">همه وضعیت‌ها</option>
              {Object.entries(ADMIN_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className={selectClassName}
              value={params.get('role') ?? ''}
              onChange={(e) => change('role', e.target.value)}
            >
              <option value="">همه نقش‌ها</option>
              {roles.data?.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.nameFa}
                </option>
              ))}
            </select>
            <select
              className={selectClassName}
              value={params.get('mfa') ?? ''}
              onChange={(e) => change('mfa', e.target.value)}
            >
              <option value="">همه وضعیت‌های MFA</option>
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </select>
            <select
              className={selectClassName}
              value={params.get('sort') ?? 'createdAt'}
              onChange={(e) => change('sort', e.target.value)}
            >
              <option value="createdAt">تاریخ ایجاد</option>
              <option value="displayName">نام</option>
              <option value="lastLoginAt">آخرین ورود</option>
            </select>
            <select
              className={selectClassName}
              value={params.get('pageSize') ?? '20'}
              onChange={(e) => change('pageSize', e.target.value)}
            >
              <option value="20">۲۰ در صفحه</option>
              <option value="50">۵۰ در صفحه</option>
              <option value="100">۱۰۰ در صفحه</option>
            </select>
          </ContentToolbar>
          <ContentTable
            result={query.data}
            loading={session.loading || query.loading}
            error={query.error}
            columns={columns}
            onRowClick={(item) => navigate(`/administration/admins/${item.id}`)}
            onRetry={query.refetch}
            onPageChange={(page) => change('page', String(page))}
          />
        </>
      )}{' '}
      {invite && roles.data && (
        <InviteDialog
          roles={roles.data}
          actorId={session.data!.user!.id}
          canAssignSuper={!isPlatform}
          onClose={() => setInvite(false)}
          onSaved={() => {
            setInvite(false);
            setNotice('دعوت ادمین ثبت شد.');
            query.refetch();
          }}
        />
      )}
    </ContentPage>
  );
}
function Status({ status }: { status: AdminStatus }) {
  return (
    <span
      className={`px-2 py-1 text-xs ${status === 'ACTIVE' ? 'bg-success/10 text-success' : status === 'SUSPENDED' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}
    >
      {ADMIN_STATUS_LABELS[status]}
    </span>
  );
}
function InviteDialog({
  roles,
  actorId,
  canAssignSuper,
  onClose,
  onSaved,
}: {
  roles: RoleRow[];
  actorId: string;
  canAssignSuper: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<InviteAdminInput>({ displayName: '', email: '', roleIds: [] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await administrationRepository.inviteAdmin(form, actorId);
      onSaved();
    } catch (error) {
      setErrors(
        error instanceof AdministrationValidationError
          ? error.fields
          : { form: error instanceof Error ? error.message : 'ثبت دعوت انجام نشد.' },
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      open
      dir="rtl"
      className="fixed inset-0 z-50 m-auto w-[min(34rem,calc(100%-2rem))] border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/40"
    >
      <form onSubmit={(event) => void submit(event)}>
        <header className="border-b p-4">
          <h2 className="font-medium">دعوت ادمین</h2>
          <p className="text-xs text-muted-foreground">
            دعوت فقط در مخزن محلی ثبت می‌شود و ایمیلی ارسال نمی‌شود.
          </p>
        </header>
        <div className="grid gap-4 p-4">
          <Field label="نام نمایشی" error={errors.displayName}>
            <Input
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            />
          </Field>
          <Field label="ایمیل" error={errors.email}>
            <Input
              dir="ltr"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <fieldset>
            <legend className="text-xs font-medium">نقش‌ها</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {roles.map((role) => (
                <label key={role.id} className="flex items-center gap-2 border p-2 text-xs">
                  <input
                    type="checkbox"
                    disabled={!canAssignSuper && role.id === 'SUPER_ADMIN'}
                    checked={form.roleIds.includes(role.id)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        roleIds: e.target.checked
                          ? [...form.roleIds, role.id]
                          : form.roleIds.filter((id) => id !== role.id),
                      })
                    }
                  />
                  {role.nameFa}
                </label>
              ))}
            </div>
            {errors.roleIds && <p className="mt-1 text-xs text-destructive">{errors.roleIds}</p>}
          </fieldset>
          {errors.form && <p className="text-xs text-destructive">{errors.form}</p>}
        </div>
        <footer className="flex justify-end gap-2 border-t p-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'در حال ثبت' : 'ثبت دعوت'}
          </Button>
        </footer>
      </form>
    </dialog>
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
      <span className="font-medium">{label}</span>
      {children}
      {error && <span className="text-destructive">{error}</span>}
    </label>
  );
}
