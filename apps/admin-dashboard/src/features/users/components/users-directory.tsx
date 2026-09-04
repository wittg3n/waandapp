import { WarningCircleIcon } from '@phosphor-icons/react';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/features/users/components/confirmation-dialog';
import { OperationToast } from '@/features/users/components/operation-toast';
import { UsersTable } from '@/features/users/components/users-table';
import { UsersToolbar } from '@/features/users/components/users-toolbar';
import { useAdminSession, useUsers } from '@/features/users/hooks/use-users';
import { usersApi } from '@/features/users/services/users-api';
import {
  USER_PERMISSIONS,
  type ManagedUser,
  type UserSortField,
  type UserStatusAction,
} from '@/features/users/types/users.types';
import { fullName } from '@/features/users/users-utils';

interface UsersDirectoryProps {
  title: string;
  description: string;
  presetStatus?: 'suspended';
}

export function UsersDirectory({ title, description, presetStatus }: UsersDirectoryProps) {
  const [params, setParams] = useSearchParams();
  const session = useAdminSession();
  const canRead = Boolean(session.data?.user?.permissions.includes(USER_PERMISSIONS.read));
  const canSuspend = Boolean(session.data?.user?.permissions.includes(USER_PERMISSIONS.suspend));
  const canBan = Boolean(
    usersApi.supportsBan && session.data?.user?.permissions.includes(USER_PERMISSIONS.ban),
  );
  const query = useMemo(() => {
    const value = new URLSearchParams(params);
    value.set('page', value.get('page') ?? '1');
    value.set('pageSize', '25');
    if (presetStatus) value.set('status', presetStatus);
    return value.toString();
  }, [params, presetStatus]);
  const users = useUsers(query, canRead);
  const [statusAction, setStatusAction] = useState<{
    user: ManagedUser;
    status: UserStatusAction;
  } | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  function changeParam(name: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    if (name !== 'page') next.set('page', '1');
    setParams(next);
  }

  function changeSort(field: UserSortField) {
    const currentField = params.get('sortBy') ?? 'createdAt';
    const currentOrder = params.get('sortOrder') ?? 'desc';
    const next = new URLSearchParams(params);
    next.set('sortBy', field);
    next.set('sortOrder', currentField === field && currentOrder === 'desc' ? 'asc' : 'desc');
    next.set('page', '1');
    setParams(next);
  }

  async function confirmStatus(reason: string) {
    if (!statusAction) return;
    setMutating(true);
    setMutationError(null);
    try {
      await usersApi.changeStatus(statusAction.user.id, statusAction.status, reason);
      setToast(
        statusAction.status === 'active'
          ? 'کاربر دوباره فعال شد.'
          : statusAction.status === 'banned'
            ? 'کاربر مسدود شد.'
            : 'کاربر تعلیق شد.',
      );
      setStatusAction(null);
      users.refetch();
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : 'عملیات انجام نشد.');
    } finally {
      setMutating(false);
    }
  }

  const effectiveParams = new URLSearchParams(query);
  const sortBy = (effectiveParams.get('sortBy') ?? 'createdAt') as UserSortField;
  const sortOrder = (effectiveParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc';

  return (
    <div className="min-w-0 flex-1 bg-muted/20">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 p-4 sm:p-6 lg:p-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        {session.loading ? (
          <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">
            در حال بررسی دسترسی…
          </div>
        ) : session.error || !session.data?.user ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
            <p className="font-medium">نشست مدیریت در دسترس نیست</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {session.error ?? 'برای مشاهده کاربران وارد حساب مدیریت شوید.'}
            </p>
            <Button variant="outline" className="mt-4" onClick={session.refetch}>
              تلاش دوباره
            </Button>
          </div>
        ) : !canRead ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <WarningCircleIcon className="mx-auto size-8 text-warning" />
            <p className="mt-3 font-medium">دسترسی مشاهده کاربران را ندارید</p>
          </div>
        ) : (
          <>
            <UsersToolbar
              key={effectiveParams.get('search') ?? ''}
              params={effectiveParams}
              total={users.data?.pagination.total ?? 0}
              statusLocked={Boolean(presetStatus)}
              supportsBan={usersApi.supportsBan}
              onChange={changeParam}
              onClear={() => setParams({})}
            />
            {users.error ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
                <p className="font-medium">دریافت کاربران انجام نشد</p>
                <p className="mt-1 text-sm text-muted-foreground">{users.error}</p>
                <Button variant="outline" className="mt-4" onClick={users.refetch}>
                  تلاش دوباره
                </Button>
              </div>
            ) : (
              <UsersTable
                users={users.data?.items ?? []}
                pagination={users.data?.pagination ?? null}
                loading={users.loading}
                sortBy={sortBy}
                sortOrder={sortOrder}
                canSuspend={canSuspend}
                canBan={canBan}
                onSort={changeSort}
                onPageChange={(page) => changeParam('page', String(page))}
                onStatusAction={(user, status) => setStatusAction({ user, status })}
              />
            )}
          </>
        )}
      </div>

      {statusAction && (
        <ConfirmationDialog
          open
          title={
            statusAction.status === 'active'
              ? 'فعال‌سازی مجدد کاربر'
              : statusAction.status === 'banned'
                ? 'مسدود کردن کاربر'
                : 'تعلیق کاربر'
          }
          description={`${fullName(statusAction.user)} با شناسه ${statusAction.user.username} و ایمیل ${statusAction.user.email}`}
          confirmLabel={
            statusAction.status === 'active'
              ? 'فعال‌سازی مجدد'
              : statusAction.status === 'banned'
                ? 'مسدود کردن'
                : 'تعلیق کاربر'
          }
          destructive={statusAction.status !== 'active'}
          busy={mutating}
          error={mutationError}
          onCancel={() => {
            setStatusAction(null);
            setMutationError(null);
          }}
          onConfirm={confirmStatus}
        />
      )}
      <OperationToast message={toast} onDismiss={dismissToast} />
    </div>
  );
}
