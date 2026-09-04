import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserStatusBadge } from '@/features/users/components/user-status-badge';
import { VerificationStatus } from '@/features/users/components/verification-status';
import type { UserDetail } from '@/features/users/types/users.types';
import { formatDate } from '@/features/users/users-utils';

function Field({
  label,
  children,
  ltr = false,
}: {
  label: string;
  children: React.ReactNode;
  ltr?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        dir={ltr ? 'ltr' : undefined}
        className={ltr ? 'mt-1 text-end text-sm font-medium' : 'mt-1 text-sm font-medium'}
      >
        {children}
      </dd>
    </div>
  );
}

export function UserOverview({ user }: { user: UserDetail }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-xl border py-5 shadow-none ring-0">
        <CardHeader>
          <CardTitle className="text-base font-semibold">اطلاعات پایه</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="نام">{user.firstName}</Field>
            <Field label="نام خانوادگی">{user.lastName}</Field>
            <Field label="نام کاربری" ltr>
              @{user.username}
            </Field>
            <Field label="ایمیل" ltr>
              {user.email}
            </Field>
            <Field label="موبایل" ltr>
              {user.phone}
            </Field>
          </dl>
        </CardContent>
      </Card>
      <Card className="rounded-xl border py-5 shadow-none ring-0">
        <CardHeader>
          <CardTitle className="text-base font-semibold">وضعیت و فعالیت</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="وضعیت حساب">
              <UserStatusBadge status={user.status} />
            </Field>
            <Field label="تکمیل پروفایل">{user.profileCompletion.toLocaleString('fa-IR')}٪</Field>
            <Field label="تأیید ایمیل">
              <VerificationStatus
                verified={user.emailVerified}
                label={user.emailVerified ? 'تأییدشده' : 'تأییدنشده'}
              />
            </Field>
            <Field label="تأیید موبایل">
              <VerificationStatus
                verified={user.phoneVerified}
                label={user.phoneVerified ? 'تأییدشده' : 'تأییدنشده'}
              />
            </Field>
            <Field label="تاریخ عضویت">{formatDate(user.createdAt, true)}</Field>
            <Field label="آخرین ورود">{formatDate(user.lastLoginAt, true)}</Field>
          </dl>
        </CardContent>
      </Card>
      <Card className="rounded-xl border py-5 shadow-none ring-0 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold">خلاصه تحصیلی</CardTitle>
        </CardHeader>
        <CardContent>
          {user.profile ? (
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="مقطع فعلی">{user.profile.currentDegree}</Field>
              <Field label="رشته فعلی" ltr>
                {user.profile.fieldId}
              </Field>
              <Field label="دانشگاه" ltr>
                {user.profile.universityId}
              </Field>
              <Field label="مقطع هدف">{user.profile.targetDegree}</Field>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              کاربر هنوز پروفایل اولیه خود را تکمیل نکرده است.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
