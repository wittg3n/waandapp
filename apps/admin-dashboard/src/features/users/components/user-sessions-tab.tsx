import { SignOutIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function UserSessionsTab({
  canRevoke,
  onRevokeAll,
}: {
  canRevoke: boolean;
  onRevokeAll: () => void;
}) {
  return (
    <Card className="rounded-xl border py-5 shadow-none ring-0">
      <CardHeader>
        <CardTitle className="text-base font-semibold">نشست‌های کاربر</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="font-medium">فهرست نشست‌های جداگانه ذخیره نمی‌شود</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            سامانه فعلی نشست‌ها را در MongoDB نگه می‌دارد و ابطال امن همه نشست‌های یک کاربر را با
            افزایش نسخه نشست پشتیبانی می‌کند؛ API فعلی متادیتای امنی برای فهرست یا ابطال یک نشست
            مشخص ارائه نمی‌دهد.
          </p>
        </div>
        {canRevoke ? (
          <Button variant="destructive" className="mt-4" onClick={onRevokeAll}>
            <SignOutIcon data-icon="inline-start" />
            ابطال همه نشست‌ها
          </Button>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            دسترسی ابطال نشست‌های کاربران را ندارید.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
