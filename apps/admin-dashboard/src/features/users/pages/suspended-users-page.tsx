import { UsersDirectory } from '@/features/users/components/users-directory';

export function SuspendedUsersPage() {
  return (
    <UsersDirectory
      title="کاربران تعلیق‌شده"
      description="بررسی حساب‌های تعلیق‌شده و فعال‌سازی مجدد با ثبت دلیل"
      presetStatus="suspended"
    />
  );
}
