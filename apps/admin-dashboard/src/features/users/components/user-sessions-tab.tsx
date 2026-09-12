import { SignOutIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminRequest } from '@/features/authentication/admin-api';
import { useContentQuery } from '@/features/content/shared/use-content-query';

type Session = { id: string; scope: string; createdAt: number; lastSeenAt: number };
export function UserSessionsTab({
  userId,
  canRevoke,
  onRevokeAll,
}: {
  userId: string;
  canRevoke: boolean;
  onRevokeAll: () => void;
}) {
  const query = useContentQuery(
    useCallback(
      (signal: AbortSignal) =>
        adminRequest<{ sessions: Session[] }>(`/users/${encodeURIComponent(userId)}/sessions`, {
          signal,
        }),
      [userId],
    ),
    canRevoke,
  );
  const [error, setError] = useState('');
  async function revoke(id: string) {
    setError('');
    try {
      await adminRequest(`/users/${encodeURIComponent(userId)}/sessions/${id}`, {
        method: 'DELETE',
        body: { reason: 'ابطال نشست از صفحه مدیریت کاربر' },
      });
      query.refetch();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ابطال انجام نشد.');
    }
  }
  return (
    <Card className="rounded-xl border py-5 shadow-none ring-0">
      <CardHeader>
        <CardTitle className="text-base font-semibold">نشست‌های کاربر</CardTitle>
      </CardHeader>
      <CardContent>
        {query.loading && <p role="status">در حال دریافت نشست‌ها…</p>}
        {(error || query.error) && (
          <p role="alert" className="text-destructive">
            {error || query.error}
          </p>
        )}
        {query.data?.sessions.length === 0 && <p>نشست فعالی وجود ندارد.</p>}
        <ul className="space-y-3">
          {query.data?.sessions.map((session) => (
            <li
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              key={session.id}
            >
              <div>
                <p>{session.scope === 'admin' ? 'مدیریت' : 'داشبورد کاربر'}</p>
                <p className="text-sm text-muted-foreground">
                  آخرین فعالیت: {new Date(session.lastSeenAt).toLocaleString('fa-IR')}
                </p>
              </div>
              <Button variant="outline" onClick={() => void revoke(session.id)}>
                ابطال نشست
              </Button>
            </li>
          ))}
        </ul>
        {canRevoke ? (
          <Button variant="destructive" className="mt-4" onClick={onRevokeAll}>
            <SignOutIcon data-icon="inline-start" />
            ابطال همه نشست‌ها
          </Button>
        ) : (
          <p className="text-muted-foreground">دسترسی مدیریت نشست‌ها را ندارید.</p>
        )}
      </CardContent>
    </Card>
  );
}
