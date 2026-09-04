import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserStatusBadge } from '@/features/users/components/user-status-badge';
import { VerificationStatus } from '@/features/users/components/verification-status';
import type { UserDetail, UserStatusAction } from '@/features/users/types/users.types';

interface UserAccountTabProps {
  user: UserDetail;
  canUpdate: boolean;
  canSuspend: boolean;
  canBan: boolean;
  onUpdate: (input: { firstName?: string; lastName?: string; reason: string }) => Promise<void>;
  onResetVerification: (channel: 'email' | 'phone') => void;
  onStatusAction: (status: UserStatusAction) => void;
}

export function UserAccountTab({
  user,
  canUpdate,
  canSuspend,
  canBan,
  onUpdate,
  onResetVerification,
  onStatusAction,
}: UserAccountTabProps) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-xl border py-5 shadow-none ring-0">
        <CardHeader>
          <CardTitle className="text-base font-semibold">ویرایش اطلاعات مجاز</CardTitle>
        </CardHeader>
        <CardContent>
          {canUpdate ? (
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                setError(null);
                try {
                  await onUpdate({ firstName, lastName, reason });
                  setReason('');
                } catch (caught) {
                  setError(caught instanceof Error ? caught.message : 'ویرایش انجام نشد.');
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  نام
                  <Input
                    className="mt-1.5 rounded-lg"
                    value={firstName}
                    maxLength={80}
                    required
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                </label>
                <label className="text-sm">
                  نام خانوادگی
                  <Input
                    className="mt-1.5 "
                    value={lastName}
                    maxLength={120}
                    required
                    onChange={(event) => setLastName(event.target.value)}
                  />
                </label>
              </div>
              <label className="block text-sm">
                دلیل ویرایش
                <Input
                  className="mt-1.5 "
                  value={reason}
                  maxLength={500}
                  required
                  onChange={(event) => setReason(event.target.value)}
                />
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={busy || !reason.trim()}>
                {busy ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">دسترسی ویرایش کاربران را ندارید.</p>
          )}
        </CardContent>
      </Card>

      <Card className=" border py-5 shadow-none ring-0">
        <CardHeader>
          <CardTitle className="text-base font-semibold">تأیید راه‌های ارتباطی</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-3  border p-3">
            <VerificationStatus verified={user.emailVerified} label="ایمیل" />
            {canUpdate && user.emailVerified && (
              <Button variant="outline" size="sm" onClick={() => onResetVerification('email')}>
                بازنشانی تأیید ایمیل
              </Button>
            )}
          </div>
          <div className="flex items-center justify-between gap-3  border p-3">
            <VerificationStatus verified={user.phoneVerified} label="موبایل" />
            {canUpdate && user.phoneVerified && (
              <Button variant="outline" size="sm" onClick={() => onResetVerification('phone')}>
                بازنشانی تأیید موبایل
              </Button>
            )}
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            بازنشانی تأیید، نشست‌های کاربر را باطل و حساب را به وضعیت «در انتظار» منتقل می‌کند. کد
            تأییدی نمایش داده نمی‌شود.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border py-5 shadow-none ring-0 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold">وضعیت حساب</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <UserStatusBadge status={user.status} />
          {canSuspend && user.status === 'active' && (
            <Button variant="destructive" onClick={() => onStatusAction('suspended')}>
              تعلیق کاربر
            </Button>
          )}
          {canBan && user.status === 'active' && (
            <Button variant="destructive" onClick={() => onStatusAction('banned')}>
              مسدود کردن کاربر
            </Button>
          )}
          {canSuspend && user.status === 'suspended' && (
            <Button onClick={() => onStatusAction('active')}>فعال‌سازی مجدد</Button>
          )}
          {canBan && user.status === 'banned' && (
            <Button onClick={() => onStatusAction('active')}>فعال‌سازی مجدد</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
