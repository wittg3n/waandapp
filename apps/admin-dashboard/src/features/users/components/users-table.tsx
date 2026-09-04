import { CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserActionsMenu } from '@/features/users/components/user-actions-menu';
import { UserStatusBadge } from '@/features/users/components/user-status-badge';
import { VerificationStatus } from '@/features/users/components/verification-status';
import type {
  ManagedUser,
  Pagination,
  SortOrder,
  UserSortField,
  UserStatusAction,
} from '@/features/users/types/users.types';
import { formatDate, fullName, userInitials } from '@/features/users/users-utils';

interface UsersTableProps {
  users: ManagedUser[];
  pagination: Pagination | null;
  loading: boolean;
  sortBy: UserSortField;
  sortOrder: SortOrder;
  canSuspend: boolean;
  canBan: boolean;
  onSort: (field: UserSortField) => void;
  onPageChange: (page: number) => void;
  onStatusAction: (user: ManagedUser, status: UserStatusAction) => void;
}

function SortButton({
  field,
  label,
  sortBy,
  sortOrder,
  onSort,
}: {
  field: UserSortField;
  label: string;
  sortBy: UserSortField;
  sortOrder: SortOrder;
  onSort: (field: UserSortField) => void;
}) {
  const active = sortBy === field;
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 hover:text-foreground"
      onClick={() => onSort(field)}
    >
      {label}
      {active && (sortOrder === 'asc' ? <CaretUpIcon /> : <CaretDownIcon />)}
    </button>
  );
}

export function UsersTable({
  users,
  pagination,
  loading,
  sortBy,
  sortOrder,
  canSuspend,
  canBan,
  onSort,
  onPageChange,
  onStatusAction,
}: UsersTableProps) {
  const navigate = useNavigate();

  return (
    <Card className="rounded-xl border py-0 shadow-none ring-0">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[980px] border-collapse text-xs">
          <thead className="border-b bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-start font-medium">
                <SortButton
                  field="firstName"
                  label="کاربر"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-4 py-3 text-start font-medium">
                <SortButton
                  field="email"
                  label="ایمیل و موبایل"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-4 py-3 text-start font-medium">تأیید</th>
              <th className="px-4 py-3 text-start font-medium">
                <SortButton
                  field="status"
                  label="وضعیت حساب"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-4 py-3 text-start font-medium">تکمیل پروفایل</th>
              <th className="px-4 py-3 text-start font-medium">
                <SortButton
                  field="createdAt"
                  label="تاریخ عضویت"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="px-4 py-3 text-start font-medium">
                <SortButton
                  field="lastLoginAt"
                  label="آخرین ورود"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
              </th>
              <th className="w-12 px-3 py-3">
                <span className="sr-only">عملیات</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading
              ? Array.from({ length: 6 }, (_, index) => (
                  <tr key={index}>
                    <td colSpan={8} className="px-4 py-3">
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </td>
                  </tr>
                ))
              : users.map((user) => (
                  <tr
                    key={user.id}
                    tabIndex={0}
                    className="cursor-pointer transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
                    onClick={() => navigate(`/users/${user.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') navigate(`/users/${user.id}`);
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                          {userInitials(user)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{fullName(user)}</p>
                          <p dir="ltr" className="mt-0.5 truncate text-end text-muted-foreground">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p dir="ltr" className="text-end">
                        {user.email}
                      </p>
                      <p dir="ltr" className="mt-1 text-end text-muted-foreground">
                        {user.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1.5">
                        <VerificationStatus verified={user.emailVerified} label="ایمیل" />
                        <VerificationStatus verified={user.phoneVerified} label="موبایل" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-foreground"
                            style={{ width: `${user.profileCompletion}%` }}
                          />
                        </div>
                        <span>{user.profileCompletion.toLocaleString('fa-IR')}٪</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(user.lastLoginAt, true)}
                    </td>
                    <td className="px-3 py-3" onClick={(event) => event.stopPropagation()}>
                      <UserActionsMenu
                        user={user}
                        canSuspend={canSuspend}
                        canBan={canBan}
                        onStatusAction={onStatusAction}
                      />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y md:hidden">
        {loading
          ? Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="m-4 h-32 rounded-lg" />
            ))
          : users.map((user) => (
              <article
                key={user.id}
                tabIndex={0}
                className="p-4 focus-visible:bg-muted/40 focus-visible:outline-none"
                onClick={() => navigate(`/users/${user.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') navigate(`/users/${user.id}`);
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                    {userInitials(user)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{fullName(user)}</p>
                        <p dir="ltr" className="truncate text-end text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                      <span onClick={(event) => event.stopPropagation()}>
                        <UserActionsMenu
                          user={user}
                          canSuspend={canSuspend}
                          canBan={canBan}
                          onStatusAction={onStatusAction}
                        />
                      </span>
                    </div>
                    <p dir="ltr" className="mt-3 truncate text-end">
                      {user.email}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <UserStatusBadge status={user.status} />
                      <VerificationStatus
                        verified={user.emailVerified && user.phoneVerified}
                        label="تأیید هویت"
                      />
                      <span className="text-muted-foreground">
                        پروفایل {user.profileCompletion.toLocaleString('fa-IR')}٪
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
      </div>

      {!loading && users.length === 0 && (
        <div className="px-4 py-16 text-center">
          <p className="font-medium">کاربری با این شرایط پیدا نشد</p>
          <p className="mt-1 text-xs text-muted-foreground">
            فیلترها یا عبارت جست‌وجو را تغییر دهید.
          </p>
        </div>
      )}

      {pagination && pagination.pageCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
          <span className="text-xs text-muted-foreground">
            صفحه {pagination.page.toLocaleString('fa-IR')} از{' '}
            {pagination.pageCount.toLocaleString('fa-IR')}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1 || loading}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              قبلی
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.pageCount || loading}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              بعدی
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
