import { WarningCircleIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmationDialog } from '@/features/users/components/confirmation-dialog';
import { OperationToast } from '@/features/users/components/operation-toast';
import { UserAccountTab } from '@/features/users/components/user-account-tab';
import { UserActivityTab } from '@/features/users/components/user-activity-tab';
import { UserDataTab } from '@/features/users/components/user-data-tab';
import { UserHeader } from '@/features/users/components/user-header';
import { UserOverview } from '@/features/users/components/user-overview';
import { UserSessionsTab } from '@/features/users/components/user-sessions-tab';
import { useAdminSession, useUserAudit, useUserDetail } from '@/features/users/hooks/use-users';
import { usersRepository } from '@/features/users/services/users-repository';
import { USER_PERMISSIONS, type UserStatusAction } from '@/features/users/types/users.types';
import { fullName } from '@/features/users/users-utils';

const tabs = ['overview', 'account', 'sessions', 'activity', 'data'] as const;
type UserTab = (typeof tabs)[number];
type PendingOperation =
  | { type: 'status'; status: UserStatusAction }
  | { type: 'verification'; channel: 'email' | 'phone' }
  | { type: 'sessions' };

export function UserDetailPage() {
  const { userId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const currentTab: UserTab = tabs.includes(requestedTab as UserTab)
    ? (requestedTab as UserTab)
    : 'overview';
  const session = useAdminSession();
  const permissions = session.data?.user?.permissions ?? [];
  const canRead = permissions.includes(USER_PERMISSIONS.read);
  const canUpdate = permissions.includes(USER_PERMISSIONS.update);
  const canSuspend = permissions.includes(USER_PERMISSIONS.suspend);
  const canBan = permissions.includes(USER_PERMISSIONS.ban);
  const canRevokeSessions = permissions.includes(USER_PERMISSIONS.sessionsRevoke);
  const canReadAudit = permissions.includes(USER_PERMISSIONS.auditRead);
  const detail = useUserDetail(userId, canRead);
  const audit = useUserAudit(userId, canRead && canReadAudit);
  const [operation, setOperation] = useState<PendingOperation | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  async function updateUser(input: { firstName?: string; lastName?: string; reason: string }) {
    if (!userId) return;
    await usersRepository.update(userId, input);
    setToast('اطلاعات کاربر ذخیره شد.');
    detail.refetch();
    audit.refetch();
  }

  async function confirmOperation(reason: string) {
    if (!userId || !operation) return;
    setMutating(true);
    setOperationError(null);
    try {
      if (operation.type === 'status') {
        await usersRepository.changeStatus(userId, operation.status, reason);
        setToast(
          operation.status === 'active'
            ? 'کاربر دوباره فعال شد.'
            : operation.status === 'banned'
              ? 'کاربر مسدود شد.'
              : 'کاربر تعلیق شد.',
        );
      } else if (operation.type === 'verification') {
        await usersRepository.resetVerification(userId, operation.channel, reason);
        setToast(
          operation.channel === 'email' ? 'تأیید ایمیل بازنشانی شد.' : 'تأیید موبایل بازنشانی شد.',
        );
      } else {
        await usersRepository.revokeAllSessions(userId, reason);
        setToast('همه نشست‌های کاربر باطل شد.');
      }
      setOperation(null);
      detail.refetch();
      audit.refetch();
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'عملیات انجام نشد.');
    } finally {
      setMutating(false);
    }
  }

  const operationCopy = (() => {
    if (!operation) return { title: '', confirmLabel: '', destructive: false };
    if (operation.type === 'status') {
      if (operation.status === 'active') {
        return {
          title: 'فعال‌سازی مجدد کاربر',
          confirmLabel: 'فعال‌سازی مجدد',
          destructive: false,
        };
      }
      return operation.status === 'banned'
        ? { title: 'مسدود کردن کاربر', confirmLabel: 'مسدود کردن', destructive: true }
        : { title: 'تعلیق کاربر', confirmLabel: 'تعلیق کاربر', destructive: true };
    }
    if (operation.type === 'verification') {
      return {
        title: operation.channel === 'email' ? 'بازنشانی تأیید ایمیل' : 'بازنشانی تأیید موبایل',
        confirmLabel: 'بازنشانی تأیید',
        destructive: true,
      };
    }
    return { title: 'ابطال همه نشست‌ها', confirmLabel: 'ابطال نشست‌ها', destructive: true };
  })();

  return (
    <div className="min-w-0 flex-1 bg-muted/20">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 p-4 sm:p-6 lg:p-8">
        {session.loading || detail.loading ? (
          <div className="rounded-xl border bg-card p-8 text-sm text-muted-foreground">
            در حال دریافت اطلاعات کاربر…
          </div>
        ) : session.error || !session.data?.user ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
            <p className="font-medium">اطلاعات دسترسی مدیریت بارگذاری نشد</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {session.error ?? 'برای مشاهده کاربر وارد حساب مدیریت شوید.'}
            </p>
          </div>
        ) : !canRead ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <WarningCircleIcon className="mx-auto size-8 text-warning" />
            <p className="mt-3 font-medium">دسترسی مشاهده کاربران را ندارید</p>
          </div>
        ) : detail.error || !detail.data ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
            <p className="font-medium">اطلاعات کاربر دریافت نشد</p>
            <p className="mt-1 text-sm text-muted-foreground">{detail.error}</p>
            <Button variant="outline" className="mt-4" onClick={detail.refetch}>
              تلاش دوباره
            </Button>
          </div>
        ) : (
          <>
            <UserHeader
              user={detail.data}
              canSuspend={canSuspend}
              canBan={canBan}
              onStatusAction={(status) => setOperation({ type: 'status', status })}
            />
            <Tabs
              value={currentTab}
              onValueChange={(value) => setSearchParams(value === 'overview' ? {} : { tab: value })}
            >
              <TabsList className="max-w-full justify-start overflow-x-auto rounded-lg">
                <TabsTrigger value="overview">نمای کلی</TabsTrigger>
                <TabsTrigger value="account">حساب و تأیید</TabsTrigger>
                <TabsTrigger value="sessions">نشست‌ها</TabsTrigger>
                <TabsTrigger value="activity">فعالیت‌ها</TabsTrigger>
                <TabsTrigger value="data">داده‌های کاربر</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <UserOverview user={detail.data} />
              </TabsContent>
              <TabsContent value="account">
                <UserAccountTab
                  key={detail.data.updatedAt}
                  user={detail.data}
                  canUpdate={canUpdate}
                  canSuspend={canSuspend}
                  canBan={canBan}
                  onUpdate={updateUser}
                  onResetVerification={(channel) => setOperation({ type: 'verification', channel })}
                  onStatusAction={(status) => setOperation({ type: 'status', status })}
                />
              </TabsContent>
              <TabsContent value="sessions">
                <UserSessionsTab
                  canRevoke={canRevokeSessions}
                  onRevokeAll={() => setOperation({ type: 'sessions' })}
                />
              </TabsContent>
              <TabsContent value="activity">
                <UserActivityTab
                  canRead={canReadAudit}
                  loading={audit.loading}
                  error={audit.error}
                  entries={audit.data?.items ?? []}
                  onRetry={audit.refetch}
                />
              </TabsContent>
              <TabsContent value="data">
                <UserDataTab profile={detail.data.profile} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {operation && (
        <ConfirmationDialog
          open
          title={operationCopy.title}
          description={
            detail.data
              ? `${fullName(detail.data)} با شناسه ${detail.data.username} و ایمیل ${detail.data.email}`
              : ''
          }
          confirmLabel={operationCopy.confirmLabel}
          destructive={operationCopy.destructive}
          busy={mutating}
          error={operationError}
          onCancel={() => {
            setOperation(null);
            setOperationError(null);
          }}
          onConfirm={confirmOperation}
        />
      )}
      <OperationToast message={toast} onDismiss={dismissToast} />
    </div>
  );
}
