import { DotsThreeVerticalIcon, EyeIcon, ProhibitIcon, UserCheckIcon } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ManagedUser, UserStatusAction } from '@/features/users/types/users.types';

interface UserActionsMenuProps {
  user: ManagedUser;
  canSuspend: boolean;
  canBan: boolean;
  onStatusAction: (user: ManagedUser, status: UserStatusAction) => void;
}

export function UserActionsMenu({
  user,
  canSuspend,
  canBan,
  onStatusAction,
}: UserActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={`عملیات ${user.username}`} />}
        onClick={(event) => event.stopPropagation()}
      >
        <DotsThreeVerticalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link to={`/users/${user.id}`} />}>
          <EyeIcon />
          مشاهده کاربر
        </DropdownMenuItem>
        {canSuspend && user.status === 'active' && (
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onStatusAction(user, 'suspended');
            }}
          >
            <ProhibitIcon />
            تعلیق کاربر
          </DropdownMenuItem>
        )}
        {canBan && user.status === 'active' && (
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onStatusAction(user, 'banned');
            }}
          >
            <ProhibitIcon />
            مسدود کردن کاربر
          </DropdownMenuItem>
        )}
        {canSuspend && user.status === 'suspended' && (
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onStatusAction(user, 'active');
            }}
          >
            <UserCheckIcon />
            فعال‌سازی مجدد
          </DropdownMenuItem>
        )}
        {canBan && user.status === 'banned' && (
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onStatusAction(user, 'active');
            }}
          >
            <UserCheckIcon />
            فعال‌سازی مجدد
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
