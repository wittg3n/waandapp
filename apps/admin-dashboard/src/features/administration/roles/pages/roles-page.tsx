import { CopyIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ContentPage,
  ContentTable,
  InlineError,
  type ContentColumn,
} from '@/features/content/shared/content-ui';
import { formatContentDate } from '@/features/content/shared/content-utils';
import { useContentQuery } from '@/features/content/shared/use-content-query';
import { useAdminSession } from '@/features/users/hooks/use-users';
import { administrationRepository } from '../../repository/administration-repository';
import {
  ADMIN_PERMISSIONS,
  AdministrationValidationError,
  type RoleRow,
} from '../../types/administration.types';
export function RolesPage() {
  const navigate = useNavigate();
  const session = useAdminSession();
  const permissions = session.data?.user?.permissions ?? [];
  const canRead = permissions.includes(ADMIN_PERMISSIONS.rolesRead);
  const canManage = permissions.includes(ADMIN_PERMISSIONS.rolesManage);
  const query = useContentQuery(
    useCallback((signal: AbortSignal) => administrationRepository.listRoles(signal), []),
    canRead,
  );
  const [create, setCreate] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  async function duplicate(role: RoleRow) {
    try {
      const copy = await administrationRepository.duplicateRole(role.id, session.data!.user!.id);
      navigate(`/administration/roles/${copy.id}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'تکثیر انجام نشد.');
    }
  }
  async function remove(role: RoleRow) {
    if (!window.confirm(`نقش «${role.nameFa}» حذف شود؟`)) return;
    try {
      await administrationRepository.deleteRole(role.id, session.data!.user!.id);
      query.refetch();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'حذف انجام نشد.');
    }
  }
  const columns: ContentColumn<RoleRow>[] = [
    {
      key: 'role',
      title: 'نقش',
      render: (item) => (
        <div>
          <p className="font-medium">{item.nameFa}</p>
          <p className="font-mono text-[10px] text-muted-foreground" dir="ltr">
            {item.key}
          </p>
        </div>
      ),
    },
    { key: 'type', title: 'نوع', render: (item) => (item.isSystem ? 'سیستمی' : 'سفارشی') },
    {
      key: 'permissions',
      title: 'تعداد دسترسی',
      render: (item) => item.permissionCount.toLocaleString('fa-IR'),
    },
    {
      key: 'admins',
      title: 'تعداد ادمین',
      render: (item) => item.adminCount.toLocaleString('fa-IR'),
    },
    {
      key: 'updated',
      title: 'آخرین بروزرسانی',
      render: (item) => formatContentDate(item.updatedAt),
    },
    {
      key: 'actions',
      title: 'عملیات',
      render: (item) => (
        <div className="flex gap-1" onClick={(event) => event.stopPropagation()}>
          <Button
            size="xs"
            variant="ghost"
            render={<Link to={`/administration/roles/${item.id}`} />}
          >
            مشاهده
          </Button>
          {canManage && item.key !== 'SUPER_ADMIN' && (
            <Button
              size="xs"
              variant="outline"
              render={<Link to={`/administration/roles/${item.id}`} />}
            >
              ویرایش
            </Button>
          )}
          {canManage && (
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => void duplicate(item)}
              aria-label="تکثیر"
            >
              <CopyIcon />
            </Button>
          )}
          {canManage && !item.isSystem && (
            <span
              title={
                item.adminCount > 0
                  ? `این نقش به ${item.adminCount.toLocaleString('fa-IR')} ادمین اختصاص داده شده است.`
                  : undefined
              }
            >
              <Button
                size="icon-xs"
                variant="destructive"
                disabled={item.adminCount > 0}
                onClick={() => void remove(item)}
                aria-label="حذف"
              >
                <TrashIcon />
              </Button>
            </span>
          )}
        </div>
      ),
    },
  ];
  const result = query.data
    ? {
        items: query.data,
        page: 1,
        pageSize: query.data.length,
        total: query.data.length,
        pageCount: 1,
      }
    : null;
  return (
    <ContentPage
      title="نقش‌ها"
      description="بسته‌های دسترسی اختصاص‌یافته به حساب‌های مدیریتی"
      action={
        canManage ? (
          <Button onClick={() => setCreate(true)}>
            <PlusIcon data-icon="inline-start" />
            نقش جدید
          </Button>
        ) : undefined
      }
    >
      {notice && <InlineError message={notice} />}{' '}
      {!session.loading && !canRead ? (
        <InlineError message="دسترسی مشاهده نقش‌ها را ندارید." />
      ) : (
        <ContentTable
          result={result}
          loading={session.loading || query.loading}
          error={query.error}
          columns={columns}
          onRowClick={(item) => navigate(`/administration/roles/${item.id}`)}
          onRetry={query.refetch}
          onPageChange={() => undefined}
        />
      )}{' '}
      {create && (
        <CreateRoleDialog
          actorId={session.data!.user!.id}
          onClose={() => setCreate(false)}
          onCreated={(id) => navigate(`/administration/roles/${id}`)}
        />
      )}
    </ContentPage>
  );
}
function CreateRoleDialog({
  actorId,
  onClose,
  onCreated,
}: {
  actorId: string;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [key, setKey] = useState('CUSTOM_');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const role = await administrationRepository.createRole(
        { key, nameFa: name, descriptionFa: description, permissionKeys: [] },
        actorId,
      );
      onCreated(role.id);
    } catch (error) {
      setErrors(
        error instanceof AdministrationValidationError
          ? error.fields
          : { form: error instanceof Error ? error.message : 'ایجاد نقش انجام نشد.' },
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
          <h2 className="font-medium">نقش جدید</h2>
          <p className="text-xs text-muted-foreground">
            دسترسی‌ها پس از ایجاد در صفحه نقش انتخاب می‌شوند.
          </p>
        </header>
        <div className="grid gap-4 p-4">
          <label className="grid gap-1.5 text-xs">
            <span>نام نقش</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            {errors.nameFa && <span className="text-destructive">{errors.nameFa}</span>}
          </label>
          <label className="grid gap-1.5 text-xs">
            <span>کلید تغییرناپذیر</span>
            <Input
              dir="ltr"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/gu, ''))}
            />
            {errors.key && <span className="text-destructive">{errors.key}</span>}
          </label>
          <label className="grid gap-1.5 text-xs">
            <span>توضیح</span>
            <textarea
              className="min-h-24 border bg-background p-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          {errors.form && <p className="text-xs text-destructive">{errors.form}</p>}
        </div>
        <footer className="flex justify-end gap-2 border-t p-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'در حال ایجاد' : 'ایجاد نقش'}
          </Button>
        </footer>
      </form>
    </dialog>
  );
}
