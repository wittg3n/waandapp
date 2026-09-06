import { useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { ContentLoading, ContentPage, InlineError } from '@/features/content/shared/content-ui';
import { formatContentDate } from '@/features/content/shared/content-utils';
import { useContentQuery } from '@/features/content/shared/use-content-query';
import { useAdminSession } from '@/features/users/hooks/use-users';
import { systemRepository } from '../../repository/system-repository';
import {
  SERVICE_STATUS_LABELS,
  SYSTEM_PERMISSIONS,
  type ServiceStatus,
} from '../../types/system.types';
export function HealthPage() {
  const session = useAdminSession();
  const canRead = session.data?.user?.permissions.includes(SYSTEM_PERMISSIONS.healthRead) ?? false;
  const query = useContentQuery(
    useCallback((signal: AbortSignal) => systemRepository.getHealth(signal), []),
    canRead,
  );
  const items = query.data ?? [];
  const latest = items
    .map((item) => item.lastCheckedAt)
    .sort()
    .at(-1);
  return (
    <ContentPage
      title="سلامت سرویس"
      description="وضعیت فعلی داده‌های محلی سرویس‌ها؛ این مقادیر متریک تولید واقعی نیستند."
    >
      {!session.loading && !canRead ? (
        <InlineError message="دسترسی مشاهده سلامت سرویس را ندارید." />
      ) : query.error ? (
        <InlineError message={query.error} onRetry={query.refetch} />
      ) : query.loading ? (
        <ContentLoading />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="سرویس‌های سالم"
              value={items.filter((item) => item.status === 'HEALTHY').length}
            />
            <Metric
              label="دارای اختلال"
              value={items.filter((item) => item.status === 'DEGRADED').length}
            />
            <Metric
              label="از دسترس خارج"
              value={items.filter((item) => item.status === 'DOWN').length}
            />
            <Card className="p-4 shadow-none ring-0">
              <p className="text-xs text-muted-foreground">آخرین بررسی</p>
              <p className="mt-2 text-sm font-medium">{formatContentDate(latest)}</p>
            </Card>
          </section>
          <div className="max-w-full overflow-x-auto border bg-background">
            <table className="w-full min-w-[760px] text-xs">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="p-3 text-start">سرویس</th>
                  <th className="p-3 text-start">وضعیت</th>
                  <th className="p-3 text-start">زمان پاسخ</th>
                  <th className="p-3 text-start">آپ‌تایم</th>
                  <th className="p-3 text-start">آخرین بررسی</th>
                  <th className="p-3 text-start">پیام</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3">
                      <Status value={item.status} />
                    </td>
                    <td className="p-3">
                      {item.latencyMs === undefined
                        ? '—'
                        : `${item.latencyMs.toLocaleString('fa-IR')} ms`}
                    </td>
                    <td className="p-3">
                      {item.uptimePercent === undefined
                        ? '—'
                        : `${item.uptimePercent.toLocaleString('fa-IR')}٪`}
                    </td>
                    <td className="p-3">{formatContentDate(item.lastCheckedAt)}</td>
                    <td className="p-3 text-muted-foreground">{item.message ?? '—'}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-sm text-muted-foreground">
                      اطلاعاتی برای سلامت سرویس‌ها ثبت نشده است.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </ContentPage>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4 shadow-none ring-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value.toLocaleString('fa-IR')}</p>
    </Card>
  );
}
function Status({ value }: { value: ServiceStatus }) {
  return (
    <span
      className={`px-2 py-1 ${value === 'HEALTHY' ? 'bg-success/10 text-success' : value === 'DEGRADED' ? 'bg-warning/10 text-warning' : value === 'DOWN' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}
    >
      {SERVICE_STATUS_LABELS[value]}
    </span>
  );
}
