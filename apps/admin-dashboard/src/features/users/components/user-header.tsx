import { ArrowRightIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { UserActionsMenu } from '@/features/users/components/user-actions-menu';
import { UserStatusBadge } from '@/features/users/components/user-status-badge';
import type { UserDetail, UserStatusAction } from '@/features/users/types/users.types';
import { formatDate, fullName, userInitials } from '@/features/users/users-utils';

interface UserHeaderProps {
  user: UserDetail;
  canSuspend: boolean;
  canBan: boolean;
  onStatusAction: (status: UserStatusAction) => void;
}

export function UserHeader({ user, canSuspend, canBan, onStatusAction }: UserHeaderProps) {
  return (
    <div>
      <Button variant="ghost" size="sm" className="mb-3 px-0" render={<Link to="/users" />}>
        <ArrowRightIcon data-icon="inline-start" />
        بازگشت به کاربران
      </Button>
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold">
          {userInitials(user)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold sm:text-2xl">{fullName(user)}</h1>
            <UserStatusBadge status={user.status} />
          </div>
          <p dir="ltr" className="mt-1 w-fit text-sm text-muted-foreground">
            @{user.username}
          </p>
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <div>
              <dt className="inline">شناسه: </dt>
              <dd dir="ltr" className="inline select-all">
                {user.id}
              </dd>
            </div>
            <div>
              <dt className="inline">عضویت: </dt>
              <dd className="inline">{formatDate(user.createdAt)}</dd>
            </div>
            <div>
              <dt className="inline">آخرین ورود: </dt>
              <dd className="inline">{formatDate(user.lastLoginAt, true)}</dd>
            </div>
          </dl>
        </div>
        <UserActionsMenu
          user={user}
          canSuspend={canSuspend}
          canBan={canBan}
          onStatusAction={(_user, status) => onStatusAction(status)}
        />
      </div>
    </div>
  );
}
