import { ArrowRightIcon, ShieldCheckIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatContentDate } from '@/features/content/shared/content-utils';
import { ContentLoading, ContentPage, InlineError } from '@/features/content/shared/content-ui';
import { useContentQuery } from '@/features/content/shared/use-content-query';
import { useAdminSession } from '@/features/users/hooks/use-users';
import { systemRepository } from '@/features/system/repository/system-repository';
import { SYSTEM_PERMISSIONS } from '@/features/system/types/system.types';
import { administrationRepository } from '../../repository/administration-repository';
import { auditActionLabels } from '../../shared/administration-utils';
import {
  ADMIN_PERMISSIONS,
  ADMIN_STATUS_LABELS,
  AdministrationValidationError,
  type AdminAccount,
  type AdminRole,
  type CanonicalPermissionKey,
  type PermissionRow,
  type UpdateAdminInput,
} from '../../types/administration.types';

export function AdminDetailPage() {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const session = useAdminSession();
  const actor = session.data?.user;
  const permissions = actor?.permissions ?? [];
  const canRead = permissions.includes(ADMIN_PERMISSIONS.adminsRead);
  const canUpdate = permissions.includes(ADMIN_PERMISSIONS.adminsUpdate);
  const canSuspend = permissions.includes(ADMIN_PERMISSIONS.adminsSuspend);
  const canSecurityRead = permissions.includes(SYSTEM_PERMISSIONS.securityRead);
  const canSecurityManage = permissions.includes(SYSTEM_PERMISSIONS.securityManage);
  const isPlatform =
    Boolean(actor?.adminRoles.includes('PLATFORM_ADMIN')) &&
    !actor?.adminRoles.includes('SUPER_ADMIN');
  const query = useContentQuery(
    useCallback(
      async (signal: AbortSignal) => {
        const admin = await administrationRepository.getAdmin(adminId!, signal);
        if (!admin)
          return {
            admin: null,
            roles: [],
            catalog: [],
            effective: [],
            audit: [],
            sessions: [],
            securityEvents: [],
          };
        const [roles, catalog, effective, byActor, byTarget, sessions, securityEvents] =
          await Promise.all([
            administrationRepository.listRoles(signal),
            administrationRepository.listPermissions(signal),
            administrationRepository.getEffectivePermissions(adminId!),
            administrationRepository.listAuditEvents({ actor: adminId, pageSize: 100 }, signal),
            administrationRepository.listAuditEvents({ search: adminId, pageSize: 100 }, signal),
            canSecurityRead ? systemRepository.listAdminSessions(signal) : Promise.resolve([]),
            canSecurityRead ? systemRepository.listSecurityEvents({}, signal) : Promise.resolve([]),
          ]);
        return {
          admin,
          roles,
          catalog,
          effective,
          audit: [
            ...new Map(
              [...byActor.items, ...byTarget.items].map((item) => [item.id, item]),
            ).values(),
          ].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
          sessions: sessions.filter((item) => item.adminId === adminId),
          securityEvents: securityEvents.filter((item) => item.adminId === adminId),
        };
      },
      [adminId, canSecurityRead],
    ),
    canRead && Boolean(adminId),
  );
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
        <InlineError
          message={session.error ?? query.error!}
          onRetry={() => {
            session.refetch();
            query.refetch();
          }}
        />
      </main>
    );
  if (!canRead)
    return (
      <main className="min-w-0 flex-1 p-6">
        <InlineError message="دسترسی مشاهده ادمین‌ها را ندارید." />
      </main>
    );
  const data = query.data;
  const admin = data?.admin;
  if (!data || !admin)
    return (
      <main className="min-w-0 flex-1 p-6">
        <InlineError message="ادمین موردنظر پیدا نشد." />
      </main>
    );
  async function status(action: 'suspend' | 'reactivate' | 'revoke') {
    const target = admin!;
    const message =
      action === 'suspend'
        ? `حساب «${target.displayName}» تعلیق شود؟`
        : action === 'revoke'
          ? `دعوت «${target.displayName}» لغو شود؟`
          : `حساب «${target.displayName}» فعال شود؟`;
    if (!window.confirm(message)) return;
    try {
      if (action === 'suspend') await administrationRepository.suspendAdmin(target.id, actor!.id);
      else if (action === 'reactivate')
        await administrationRepository.reactivateAdmin(target.id, actor!.id);
      else {
        await administrationRepository.revokeInvitation(target.id, actor!.id);
        navigate('/administration/admins');
        return;
      }
      setNotice('تغییر وضعیت ثبت شد.');
      query.refetch();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'عملیات انجام نشد.');
    }
  }
  return (
    <ContentPage
      title={admin.displayName}
      description={admin.email}
      action={
        <Button variant="outline" render={<Link to="/administration/admins" />}>
          <ArrowRightIcon data-icon="inline-start" />
          بازگشت
        </Button>
      }
    >
      {notice && <div className="border bg-background p-3 text-xs">{notice}</div>}
      <AdminDetailView
        key={`${admin.id}-${admin.updatedAt}`}
        admin={admin}
        roles={data.roles}
        catalog={data.catalog}
        effective={data.effective}
        audit={data.audit}
        sessions={data.sessions}
        securityEvents={data.securityEvents}
        actorId={actor!.id}
        canUpdate={canUpdate && !(isPlatform && admin.roleIds.includes('SUPER_ADMIN'))}
        canSuspend={canSuspend && !(isPlatform && admin.roleIds.includes('SUPER_ADMIN'))}
        canAssignSuper={!isPlatform}
        canSecurityRead={canSecurityRead}
        canSecurityManage={canSecurityManage}
        onChanged={() => query.refetch()}
        onNotice={setNotice}
        onStatus={status}
      />
    </ContentPage>
  );
}

function AdminDetailView({
  admin,
  roles,
  catalog,
  effective,
  audit,
  sessions,
  securityEvents,
  actorId,
  canUpdate,
  canSuspend,
  canAssignSuper,
  canSecurityRead,
  canSecurityManage,
  onChanged,
  onNotice,
  onStatus,
}: {
  admin: AdminAccount;
  roles: AdminRole[];
  catalog: PermissionRow[];
  effective: Array<{ key: CanonicalPermissionKey; roleIds: string[] }>;
  audit: Awaited<ReturnType<typeof administrationRepository.listAuditEvents>>['items'];
  sessions: Awaited<ReturnType<typeof systemRepository.listAdminSessions>>;
  securityEvents: Awaited<ReturnType<typeof systemRepository.listSecurityEvents>>;
  actorId: string;
  canUpdate: boolean;
  canSuspend: boolean;
  canAssignSuper: boolean;
  canSecurityRead: boolean;
  canSecurityManage: boolean;
  onChanged: () => void;
  onNotice: (message: string) => void;
  onStatus: (action: 'suspend' | 'reactivate' | 'revoke') => Promise<void>;
}) {
  const [form, setForm] = useState<UpdateAdminInput>({
    displayName: admin.displayName,
    email: admin.email,
    roleIds: [...admin.roleIds],
  });
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  async function save() {
    setBusy(true);
    setErrors({});
    try {
      await administrationRepository.updateAdmin(admin.id, form, actorId);
      onNotice('اطلاعات ادمین ذخیره شد.');
      onChanged();
    } catch (error) {
      setErrors(
        error instanceof AdministrationValidationError
          ? error.fields
          : { form: error instanceof Error ? error.message : 'ذخیره انجام نشد.' },
      );
    } finally {
      setBusy(false);
    }
  }
  async function revokeSession(id: string, current: boolean) {
    if (
      !window.confirm(
        current
          ? 'نشست جاری لغو شود؟ این اقدام دسترسی فعلی را در قرارداد محلی لغو می‌کند.'
          : 'این نشست لغو شود؟',
      )
    )
      return;
    try {
      await systemRepository.revokeSession(id, actorId, current);
      onNotice('نشست لغو شد.');
      onChanged();
    } catch (error) {
      onNotice(error instanceof Error ? error.message : 'لغو نشست انجام نشد.');
    }
  }
  const assigned = roles.filter((role) => admin.roleIds.includes(role.id));
  return (
    <>
      <Card className="flex flex-col gap-4 p-5 shadow-none ring-0 sm:flex-row sm:items-center">
        {admin.avatarUrl ? (
          <img src={admin.avatarUrl} alt="" className="size-16 shrink-0 object-cover" />
        ) : (
          <div className="grid size-16 place-items-center bg-muted text-xl font-semibold">
            {admin.displayName
              .split(' ')
              .map((item) => item[0])
              .join('')
              .slice(0, 2)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold">{admin.displayName}</h2>
          <p className="text-xs text-muted-foreground" dir="ltr">
            {admin.email}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="bg-muted px-2 py-1">{ADMIN_STATUS_LABELS[admin.status]}</span>
            {assigned.map((role) => (
              <span key={role.id} className="bg-muted px-2 py-1">
                {role.nameFa}
              </span>
            ))}
            <span className="bg-muted px-2 py-1">MFA: {admin.mfaEnabled ? 'فعال' : 'غیرفعال'}</span>
            <span className="bg-muted px-2 py-1">
              آخرین ورود: {formatContentDate(admin.lastLoginAt)}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canSuspend && admin.status === 'ACTIVE' && (
            <Button
              variant="destructive"
              disabled={admin.id === actorId}
              onClick={() => void onStatus('suspend')}
            >
              تعلیق
            </Button>
          )}
          {canSuspend && admin.status === 'SUSPENDED' && (
            <Button variant="outline" onClick={() => void onStatus('reactivate')}>
              فعال‌سازی
            </Button>
          )}
          {canUpdate && admin.status === 'INVITED' && (
            <Button variant="destructive" onClick={() => void onStatus('revoke')}>
              لغو دعوت
            </Button>
          )}
        </div>
      </Card>
      <Tabs defaultValue="overview">
        <TabsList variant="line" className="max-w-full overflow-x-auto">
          <TabsTrigger value="overview">نمای کلی</TabsTrigger>
          <TabsTrigger value="roles">نقش‌ها و دسترسی‌ها</TabsTrigger>
          <TabsTrigger value="security">امنیت</TabsTrigger>
          <TabsTrigger value="activity">فعالیت‌ها</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card className="grid gap-4 p-5 shadow-none ring-0 sm:grid-cols-2">
            <Info label="وضعیت" value={ADMIN_STATUS_LABELS[admin.status]} />
            <Info label="ایجاد" value={formatContentDate(admin.createdAt)} />
            <Info label="آخرین بروزرسانی" value={formatContentDate(admin.updatedAt)} />
            <Info label="آخرین ورود" value={formatContentDate(admin.lastLoginAt)} />
            {canUpdate && (
              <>
                <label className="grid gap-1.5 text-xs">
                  <span>نام نمایشی</span>
                  <Input
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  />
                  {errors.displayName && (
                    <span className="text-destructive">{errors.displayName}</span>
                  )}
                </label>
                <label className="grid gap-1.5 text-xs">
                  <span>ایمیل</span>
                  <Input
                    dir="ltr"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  {errors.email && <span className="text-destructive">{errors.email}</span>}
                </label>
              </>
            )}
            {errors.form && <p className="text-xs text-destructive">{errors.form}</p>}
          </Card>
        </TabsContent>
        <TabsContent value="roles">
          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="p-5 shadow-none ring-0">
              <h3 className="font-medium">نقش‌های اختصاص‌یافته</h3>
              <div className="mt-3 grid gap-2">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-start gap-2 border p-3 text-xs">
                    <input
                      type="checkbox"
                      disabled={
                        !canUpdate ||
                        (!canAssignSuper && role.id === 'SUPER_ADMIN') ||
                        (admin.id === actorId && role.id === 'SUPER_ADMIN')
                      }
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
                    <span>
                      <strong className="block">{role.nameFa}</strong>
                      <span className="text-muted-foreground" dir="ltr">
                        {role.key}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              {errors.roleIds && <p className="mt-2 text-xs text-destructive">{errors.roleIds}</p>}
              {canUpdate && (
                <Button className="mt-4" disabled={busy} onClick={() => void save()}>
                  {busy ? 'در حال ذخیره' : 'ذخیره نقش‌ها'}
                </Button>
              )}
            </Card>
            <Card className="p-5 shadow-none ring-0">
              <h3 className="font-medium">دسترسی‌های مؤثر</h3>
              <div className="mt-3 max-h-[34rem] space-y-2 overflow-y-auto">
                {effective.map((item) => {
                  const permission = catalog.find((entry) => entry.key === item.key);
                  return (
                    <div key={item.key} className="border p-3 text-xs">
                      <p className="font-medium">{permission?.labelFa ?? item.key}</p>
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground" dir="ltr">
                        {item.key}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        منبع:{' '}
                        {item.roleIds
                          .map((id) => roles.find((role) => role.id === id)?.nameFa ?? id)
                          .join('، ')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="security">
          {!canSecurityRead ? (
            <InlineError message="دسترسی مشاهده اطلاعات امنیتی ادمین را ندارید." />
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              <Card className="p-5 shadow-none ring-0">
                <h3 className="flex items-center gap-2 font-medium">
                  <ShieldCheckIcon />
                  نشست‌های ادمین
                </h3>
                <div className="mt-3 space-y-2">
                  {sessions.length ? (
                    sessions.map((item) => (
                      <div key={item.id} className="border p-3 text-xs">
                        <div className="flex justify-between gap-2">
                          <span>
                            {item.browser} · {item.os}
                          </span>
                          <span>{item.status}</span>
                        </div>
                        <p className="mt-1 text-muted-foreground" dir="ltr">
                          {item.ipAddress}
                        </p>
                        {canSecurityManage && item.status === 'ACTIVE' && (
                          <Button
                            className="mt-2"
                            size="xs"
                            variant="destructive"
                            onClick={() => void revokeSession(item.id, item.isCurrent)}
                          >
                            لغو نشست{item.isCurrent ? ' جاری' : ''}
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">نشستی ثبت نشده است.</p>
                  )}
                </div>
              </Card>
              <Card className="p-5 shadow-none ring-0">
                <h3 className="font-medium">رویدادهای امنیتی اخیر</h3>
                <div className="mt-3 space-y-2">
                  {securityEvents.length ? (
                    securityEvents.map((item) => (
                      <div key={item.id} className="border p-3 text-xs">
                        <p className="font-medium">{item.titleFa}</p>
                        <p className="mt-1 text-muted-foreground">{item.descriptionFa}</p>
                        <p className="mt-1">
                          {item.status} · {formatContentDate(item.detectedAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">رویدادی ثبت نشده است.</p>
                  )}
                </div>
              </Card>
            </div>
          )}
        </TabsContent>
        <TabsContent value="activity">
          <Card className="divide-y p-0 shadow-none ring-0">
            {audit.length ? (
              audit.map((item) => (
                <div key={item.id} className="p-4 text-xs">
                  <div className="flex justify-between gap-3">
                    <span className="font-medium">{auditActionLabels[item.action]}</span>
                    <time className="text-muted-foreground">
                      {formatContentDate(item.occurredAt)}
                    </time>
                  </div>
                  <p className="mt-1 text-muted-foreground">{item.summaryFa}</p>
                </div>
              ))
            ) : (
              <p className="p-8 text-center text-muted-foreground">فعالیتی ثبت نشده است.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
