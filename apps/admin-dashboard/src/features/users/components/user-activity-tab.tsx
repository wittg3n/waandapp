import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserAuditEntry } from '@/features/users/types/users.types';
import { formatDate } from '@/features/users/users-utils';

const actionLabels: Record<string, string> = {
  USER_SUSPENDED: 'کاربر تعلیق شد',
  USER_BANNED: 'کاربر مسدود شد',
  USER_ACTIVATED: 'کاربر دوباره فعال شد',
  USER_UPDATED: 'اطلاعات کاربر ویرایش شد',
  USER_EMAIL_VERIFICATION_RESET: 'تأیید ایمیل بازنشانی شد',
  USER_PHONE_VERIFICATION_RESET: 'تأیید موبایل بازنشانی شد',
  USER_SESSIONS_REVOKED: 'نشست‌های کاربر باطل شد',
  USER_ROLES_UPDATED: 'نقش‌های مدیریتی تغییر کرد',
};

export function UserActivityTab({
  canRead,
  loading,
  error,
  entries,
  onRetry,
}: {
  canRead: boolean;
  loading: boolean;
  error: string | null;
  entries: UserAuditEntry[];
  onRetry: () => void;
}) {
  return (
    <Card className="rounded-xl border py-5 shadow-none ring-0">
      <CardHeader>
        <CardTitle className="text-base font-semibold">فعالیت‌ها و گزارش ممیزی</CardTitle>
      </CardHeader>
      <CardContent>
        {!canRead ? (
          <p className="text-sm text-muted-foreground">دسترسی مشاهده گزارش ممیزی را ندارید.</p>
        ) : loading ? (
          <p className="text-sm text-muted-foreground">در حال دریافت فعالیت‌ها…</p>
        ) : error ? (
          <div>
            <p className="text-sm text-destructive">{error}</p>
            <button type="button" className="mt-2 text-sm underline" onClick={onRetry}>
              تلاش دوباره
            </button>
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            فعالیت مدیریتی ثبت‌شده‌ای برای این کاربر وجود ندارد.
          </p>
        ) : (
          <ol className="divide-y">
            {entries.map((entry) => {
              const actor = entry.actor
                ? `${entry.actor.firstName} ${entry.actor.lastName}`.trim() || entry.actor.username
                : entry.actorType === 'SYSTEM'
                  ? 'سامانه'
                  : 'مدیر';
              return (
                <li key={entry.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium">
                      {actionLabels[entry.action] ?? 'عملیات مدیریتی روی کاربر'}
                    </p>
                    <time className="text-xs text-muted-foreground">
                      {formatDate(entry.createdAt, true)}
                    </time>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">انجام‌دهنده: {actor}</p>
                  {entry.reason && (
                    <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-xs leading-5">
                      دلیل: {entry.reason}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
