import { ArrowRightIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ContentLoading, ContentPage, InlineError } from '@/features/content/shared/content-ui';
import { formatContentDate } from '@/features/content/shared/content-utils';
import { useContentQuery } from '@/features/content/shared/use-content-query';
import { useAdminSession } from '@/features/users/hooks/use-users';
import { systemRepository } from '../../repository/system-repository';
import { JOB_STATUS_LABELS, JOB_TYPE_LABELS, SYSTEM_PERMISSIONS } from '../../types/system.types';
export function JobDetailPage() {
  const { jobId } = useParams();
  const session = useAdminSession();
  const permissions = session.data?.user?.permissions ?? [];
  const canRead = permissions.includes(SYSTEM_PERMISSIONS.jobsRead);
  const canRetry = permissions.includes(SYSTEM_PERMISSIONS.jobsRetry);
  const canCancel = permissions.includes(SYSTEM_PERMISSIONS.jobsCancel);
  const query = useContentQuery(
    useCallback((signal: AbortSignal) => systemRepository.getJob(jobId!, signal), [jobId]),
    canRead && Boolean(jobId),
  );
  const [notice, setNotice] = useState<string | null>(null);
  if (session.loading || query.loading)
    return (
      <main className="min-w-0 flex-1 p-6">
        <ContentLoading />
      </main>
    );
  if (session.error || query.error)
    return (
      <main className="min-w-0 flex-1 p-6">
        <InlineError message={session.error ?? query.error!} onRetry={query.refetch} />
      </main>
    );
  if (!canRead)
    return (
      <main className="min-w-0 flex-1 p-6">
        <InlineError message="دسترسی مشاهده جاب‌ها را ندارید." />
      </main>
    );
  if (!query.data)
    return (
      <main className="min-w-0 flex-1 p-6">
        <InlineError message="جاب موردنظر پیدا نشد." />
      </main>
    );
  const job = query.data;
  async function action(kind: 'retry' | 'cancel') {
    if (!window.confirm(kind === 'retry' ? 'این جاب ناموفق دوباره اجرا شود؟' : 'این جاب لغو شود؟'))
      return;
    try {
      if (kind === 'retry') await systemRepository.retryJob(job.id, session.data!.user!.id);
      else await systemRepository.cancelJob(job.id, session.data!.user!.id);
      setNotice(kind === 'retry' ? 'جاب دوباره اجرا و تکمیل شد.' : 'جاب لغو شد.');
      query.refetch();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'عملیات انجام نشد.');
    }
  }
  return (
    <ContentPage
      title={job.title}
      description={job.id}
      action={
        <Button variant="outline" render={<Link to="/system/jobs" />}>
          <ArrowRightIcon data-icon="inline-start" />
          بازگشت
        </Button>
      }
    >
      {notice && <div className="border bg-background p-3 text-xs">{notice}</div>}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-5 shadow-none ring-0">
          <h2 className="font-medium">جزئیات جاب</h2>
          <dl className="mt-4 grid grid-cols-[8rem_1fr] gap-3 text-xs">
            <dt className="text-muted-foreground">شناسه</dt>
            <dd dir="ltr">{job.id}</dd>
            <dt className="text-muted-foreground">نوع</dt>
            <dd>{JOB_TYPE_LABELS[job.type]}</dd>
            <dt className="text-muted-foreground">وضعیت</dt>
            <dd>{JOB_STATUS_LABELS[job.status]}</dd>
            <dt className="text-muted-foreground">پیشرفت</dt>
            <dd>{(job.progress ?? 0).toLocaleString('fa-IR')}٪</dd>
            <dt className="text-muted-foreground">تلاش</dt>
            <dd>
              {job.attempts.toLocaleString('fa-IR')} / {job.maxAttempts.toLocaleString('fa-IR')}
            </dd>
            <dt className="text-muted-foreground">ایجاد</dt>
            <dd>{formatContentDate(job.createdAt)}</dd>
            <dt className="text-muted-foreground">شروع</dt>
            <dd>{formatContentDate(job.startedAt)}</dd>
            <dt className="text-muted-foreground">پایان</dt>
            <dd>{formatContentDate(job.completedAt)}</dd>
            <dt className="text-muted-foreground">اجراکننده</dt>
            <dd>
              {job.triggeredByAdminId ? (
                <Link
                  className="hover:underline"
                  to={`/administration/admins/${job.triggeredByAdminId}`}
                >
                  {job.triggeredByAdminId}
                </Link>
              ) : (
                'سیستم'
              )}
            </dd>
            <dt className="text-muted-foreground">مرتبط با</dt>
            <dd>
              {job.relatedEntity?.href ? (
                <Link className="hover:underline" to={job.relatedEntity.href}>
                  {job.relatedEntity.label}
                </Link>
              ) : (
                (job.relatedEntity?.label ?? '—')
              )}
            </dd>
            <dt className="text-muted-foreground">خلاصه امن</dt>
            <dd>{job.payloadSummary ?? '—'}</dd>
            <dt className="text-muted-foreground">خطا</dt>
            <dd className="text-destructive">{job.errorMessage ?? '—'}</dd>
          </dl>
        </Card>
        <aside className="space-y-5">
          <Card className="p-5 shadow-none ring-0">
            <h2 className="font-medium">عملیات</h2>
            <div className="mt-3 grid gap-2">
              {job.status === 'FAILED' && canRetry && (
                <Button
                  disabled={job.attempts >= job.maxAttempts}
                  onClick={() => void action('retry')}
                >
                  تلاش مجدد
                </Button>
              )}
              {(job.status === 'QUEUED' || job.status === 'RUNNING') && canCancel && (
                <Button variant="destructive" onClick={() => void action('cancel')}>
                  لغو جاب
                </Button>
              )}
              {job.status === 'FAILED' && job.attempts >= job.maxAttempts && (
                <p className="text-xs text-muted-foreground">حداکثر تعداد تلاش تکمیل شده است.</p>
              )}
            </div>
          </Card>
          <Card className="p-5 shadow-none ring-0">
            <h2 className="font-medium">خط زمانی</h2>
            <ol className="mt-3 space-y-3 text-xs">
              <li className="border-s-2 ps-3">
                <strong>ایجاد جاب</strong>
                <p className="text-muted-foreground">{formatContentDate(job.createdAt)}</p>
              </li>
              {job.startedAt && (
                <li className="border-s-2 ps-3">
                  <strong>شروع اجرا</strong>
                  <p className="text-muted-foreground">{formatContentDate(job.startedAt)}</p>
                </li>
              )}
              {job.completedAt && (
                <li className="border-s-2 ps-3">
                  <strong>{job.status === 'CANCELLED' ? 'لغو' : 'پایان اجرا'}</strong>
                  <p className="text-muted-foreground">{formatContentDate(job.completedAt)}</p>
                </li>
              )}
            </ol>
          </Card>
        </aside>
      </div>
    </ContentPage>
  );
}
