import type { UserStatus } from '@/features/users/types/users.types';

export const userStatusLabels: Record<UserStatus, string> = {
  pending_verification: 'در انتظار',
  active: 'فعال',
  suspended: 'تعلیق‌شده',
  banned: 'مسدود',
  deleted: 'حذف‌شده',
};

export function fullName(user: { firstName: string; lastName: string }) {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function formatDate(value: string | null, includeTime = false) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    ...(includeTime ? { timeStyle: 'short' as const } : {}),
  }).format(new Date(value));
}

export function userInitials(user: { firstName: string; lastName: string }) {
  return `${user.firstName.at(0) ?? ''}${user.lastName.at(0) ?? ''}` || 'و';
}
