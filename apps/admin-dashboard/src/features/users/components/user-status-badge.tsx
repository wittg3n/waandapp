import { cn } from '@/lib/utils';
import type { UserStatus } from '@/features/users/types/users.types';
import { userStatusLabels } from '@/features/users/users-utils';

const statusClassName: Record<UserStatus, string> = {
  pending_verification: 'bg-warning/10 text-warning',
  active: 'bg-success/10 text-success',
  suspended: 'bg-destructive/10 text-destructive',
  banned: 'bg-destructive text-destructive-foreground',
  deleted: 'bg-muted text-muted-foreground',
};

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-md px-2 py-1 text-xs font-medium',
        statusClassName[status],
      )}
    >
      {userStatusLabels[status]}
    </span>
  );
}
