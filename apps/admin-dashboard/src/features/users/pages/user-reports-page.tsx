import { ChartBarIcon } from '@phosphor-icons/react';

import { Card, CardContent } from '@/components/ui/card';

export function UserReportsPage() {
  return (
    <div className="min-w-0 flex-1 bg-muted/20">
      <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">گزارش‌های کاربران</h1>
        <p className="mt-1 text-sm text-muted-foreground">گزارش‌های ثبت‌شده درباره کاربران عادی</p>
        <Card className="mt-5 rounded-xl border py-0 shadow-none ring-0">
          <CardContent className="py-16 text-center">
            <ChartBarIcon className="mx-auto size-9 text-muted-foreground" />
            <p className="mt-4 font-medium">سامانه گزارش کاربران هنوز در دسترس نیست</p>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              در مدل‌ها و API فعلی واند دامنه‌ای برای گزارش کاربران وجود ندارد. این صفحه برای اتصال
              به سامانه واقعی گزارش‌ها آماده نگه داشته شده است.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
