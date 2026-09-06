import { ArrowRightIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ContentLoading, ContentPage, InlineError } from '@/features/content/shared/content-ui';
import { useContentQuery } from '@/features/content/shared/use-content-query';
import { useAdminSession } from '@/features/users/hooks/use-users';
import { administrationRepository } from '../../repository/administration-repository';
import {
  ADMIN_PERMISSIONS,
  PERMISSION_GROUP_LABELS,
  type AdminRole,
  type CanonicalPermissionKey,
  type PermissionGroup,
  type PermissionRow,
} from '../../types/administration.types';
export function RoleDetailPage() {
  const { roleId } = useParams();
  const session = useAdminSession();
  const permissions = session.data?.user?.permissions ?? [];
  const canRead = permissions.includes(ADMIN_PERMISSIONS.rolesRead);
  const canManage = permissions.includes(ADMIN_PERMISSIONS.rolesManage);
  const query = useContentQuery(
    useCallback(
      async (signal: AbortSignal) => {
        const [role, catalog, admins] = await Promise.all([
          administrationRepository.getRole(roleId!, signal),
          administrationRepository.listPermissions(signal),
          administrationRepository.listAdmins({ role: roleId, pageSize: 100 }, signal),
        ]);
        return { role, catalog, admins: admins.items };
      },
      [roleId],
    ),
    canRead && Boolean(roleId),
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
        <InlineError message={session.error ?? query.error!} onRetry={query.refetch} />
      </main>
    );
  if (!canRead)
    return (
      <main className="min-w-0 flex-1 p-6">
        <InlineError message="دسترسی مشاهده نقش‌ها را ندارید." />
      </main>
    );
  if (!query.data?.role)
    return (
      <main className="min-w-0 flex-1 p-6">
        <InlineError message="نقش موردنظر پیدا نشد." />
      </main>
    );
  return (
    <ContentPage
      title={query.data.role.nameFa}
      description={query.data.role.descriptionFa}
      action={
        <Button variant="outline" render={<Link to="/administration/roles" />}>
          <ArrowRightIcon data-icon="inline-start" />
          بازگشت
        </Button>
      }
    >
      {notice && <div className="border bg-background p-3 text-xs">{notice}</div>}
      <RoleEditor
        key={query.data.role.updatedAt}
        role={query.data.role}
        catalog={query.data.catalog}
        admins={query.data.admins}
        canManage={canManage}
        actorId={session.data!.user!.id}
        onSaved={() => {
          setNotice('نقش به‌روزرسانی شد.');
          query.refetch();
        }}
        onError={setNotice}
      />
    </ContentPage>
  );
}
function RoleEditor({
  role,
  catalog,
  admins,
  canManage,
  actorId,
  onSaved,
  onError,
}: {
  role: AdminRole;
  catalog: PermissionRow[];
  admins: Awaited<ReturnType<typeof administrationRepository.listAdmins>>['items'];
  canManage: boolean;
  actorId: string;
  onSaved: () => void;
  onError: (value: string) => void;
}) {
  const immutable = role.key === 'SUPER_ADMIN' || !canManage;
  const initial = role.permissionKeys.includes('*')
    ? catalog.map((item) => item.key)
    : role.permissionKeys.filter((item): item is CanonicalPermissionKey => item !== '*');
  const [name, setName] = useState(role.nameFa);
  const [description, setDescription] = useState(role.descriptionFa);
  const [selected, setSelected] = useState<CanonicalPermissionKey[]>(initial);
  const [busy, setBusy] = useState(false);
  const groups = Object.keys(PERMISSION_GROUP_LABELS) as PermissionGroup[];
  function toggle(key: CanonicalPermissionKey, checked: boolean) {
    setSelected(
      checked ? [...new Set([...selected, key])] : selected.filter((item) => item !== key),
    );
  }
  function group(group: PermissionGroup, checked: boolean) {
    const keys = catalog.filter((item) => item.group === group).map((item) => item.key);
    setSelected(
      checked
        ? [...new Set([...selected, ...keys])]
        : selected.filter((item) => !keys.includes(item)),
    );
  }
  async function save() {
    setBusy(true);
    try {
      await administrationRepository.updateRole(
        role.id,
        { nameFa: name, descriptionFa: description, permissionKeys: selected },
        actorId,
      );
      onSaved();
    } catch (error) {
      onError(error instanceof Error ? error.message : 'ذخیره انجام نشد.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <Card className="grid gap-4 p-5 shadow-none ring-0 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs">
            <span>نام نقش</span>
            <Input value={name} disabled={immutable} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="grid gap-1.5 text-xs">
            <span>کلید تغییرناپذیر</span>
            <Input dir="ltr" value={role.key} disabled />
          </label>
          <label className="grid gap-1.5 text-xs sm:col-span-2">
            <span>توضیح</span>
            <textarea
              className="min-h-20 border bg-background p-2"
              value={description}
              disabled={immutable}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <div className="text-xs">
            <span className="text-muted-foreground">نوع: </span>
            {role.isSystem ? 'سیستمی' : 'سفارشی'}
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">تعداد دسترسی: </span>
            {selected.length.toLocaleString('fa-IR')}
          </div>
        </Card>
        {groups.map((groupName) => {
          const items = catalog.filter((item) => item.group === groupName);
          return (
            <Card key={groupName} className="p-5 shadow-none ring-0">
              <header className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-medium">{PERMISSION_GROUP_LABELS[groupName]}</h2>
                {!immutable && (
                  <div className="flex gap-1">
                    <Button size="xs" variant="ghost" onClick={() => group(groupName, true)}>
                      انتخاب گروه
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => group(groupName, false)}>
                      پاک‌کردن گروه
                    </Button>
                  </div>
                )}
              </header>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {items.map((permission) => (
                  <label key={permission.key} className="flex items-start gap-2 border p-3 text-xs">
                    <input
                      type="checkbox"
                      disabled={immutable}
                      checked={selected.includes(permission.key)}
                      onChange={(e) => toggle(permission.key, e.target.checked)}
                    />
                    <span>
                      <strong className="block">{permission.labelFa}</strong>
                      <span className="mt-1 block text-muted-foreground">
                        {permission.descriptionFa}
                      </span>
                      <code className="mt-1 block text-[10px]" dir="ltr">
                        {permission.key}
                      </code>
                    </span>
                  </label>
                ))}
              </div>
            </Card>
          );
        })}
        {!immutable && (
          <div className="sticky bottom-0 border bg-background p-3">
            <Button disabled={busy} onClick={() => void save()}>
              {busy ? 'در حال ذخیره' : 'ذخیره نقش'}
            </Button>
          </div>
        )}
      </div>
      <aside>
        <Card className="p-5 shadow-none ring-0">
          <h2 className="font-medium">ادمین‌های دارای نقش</h2>
          <div className="mt-3 space-y-2">
            {admins.length ? (
              admins.map((admin) => (
                <Link
                  key={admin.id}
                  to={`/administration/admins/${admin.id}`}
                  className="block border p-3 text-xs hover:bg-muted/40"
                >
                  <strong className="block">{admin.displayName}</strong>
                  <span className="text-muted-foreground" dir="ltr">
                    {admin.email}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">این نقش به ادمینی اختصاص ندارد.</p>
            )}
          </div>
        </Card>
        {role.key === 'SUPER_ADMIN' && (
          <p className="mt-3 border p-3 text-xs text-muted-foreground">
            دسترسی کامل مدیر ارشد تغییرناپذیر است.
          </p>
        )}
      </aside>
    </div>
  );
}
