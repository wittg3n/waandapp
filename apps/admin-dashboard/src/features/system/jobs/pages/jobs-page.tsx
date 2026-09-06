import { useCallback, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ContentPage,
  ContentTable,
  ContentToolbar,
  InlineError,
  selectClassName,
  type ContentColumn,
} from '@/features/content/shared/content-ui';
import { formatContentDate } from '@/features/content/shared/content-utils';
import { useContentQuery } from '@/features/content/shared/use-content-query';
import { useAdminSession } from '@/features/users/hooks/use-users';
import { systemRepository } from '../../repository/system-repository';
import {
  JOB_STATUS_LABELS,
  JOB_TYPE_LABELS,
  SYSTEM_PERMISSIONS,
  type BackgroundJob,
  type JobStatus,
  type JobType,
} from '../../types/system.types';
export function JobsPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const session = useAdminSession();
  const permissions = session.data?.user?.permissions ?? [];
  const canRead = permissions.includes(SYSTEM_PERMISSIONS.jobsRead);
  const canRetry = permissions.includes(SYSTEM_PERMISSIONS.jobsRetry);
  const canCancel = permissions.includes(SYSTEM_PERMISSIONS.jobsCancel);
  const [notice, setNotice] = useState<string | null>(null);
  const query = useContentQuery(
    useCallback(
      (signal: AbortSignal) =>
        systemRepository.listJobs(
          {
            search: params.get('search') || undefined,
            status: (params.get('status') || undefined) as JobStatus | undefined,
            type: (params.get('type') || undefined) as JobType | undefined,
            date: params.get('date') || undefined,
            page: Number(params.get('page')) || 1,
            pageSize: (Number(params.get('pageSize')) || 20) as 20 | 50 | 100,
          },
          signal,
        ),
      [params],
    ),
    canRead,
  );
  function change(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setParams(next);
  }
  async function action(job: BackgroundJob, kind: 'retry' | 'cancel') {
    if (
      !window.confirm(
        kind === 'retry' ? `جاب «${job.title}» دوباره اجرا شود؟` : `جاب «${job.title}» لغو شود؟`,
      )
    )
      return;
    try {
      if (kind === 'retry') await systemRepository.retryJob(job.id, session.data!.user!.id);
      else await systemRepository.cancelJob(job.id, session.data!.user!.id);
      setNotice(kind === 'retry' ? 'جاب با موفقیت دوباره اجرا شد.' : 'جاب لغو شد.');
      query.refetch();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'عملیات انجام نشد.');
    }
  }
  const columns: ContentColumn<BackgroundJob>[] = [
    {
      key: 'job',
      title: 'جاب',
      render: (item) => (
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="font-mono text-[10px] text-muted-foreground" dir="ltr">
            {item.id}
          </p>
        </div>
      ),
    },
    { key: 'type', title: 'نوع', render: (item) => JOB_TYPE_LABELS[item.type] },
    { key: 'status', title: 'وضعیت', render: (item) => <Status value={item.status} /> },
    {
      key: 'progress',
      title: 'پیشرفت',
      render: (item) => (
        <div className="w-28">
          <div className="h-1.5 bg-muted">
            <div className="h-full bg-primary" style={{ width: `${item.progress ?? 0}%` }} />
          </div>
          <span>{(item.progress ?? 0).toLocaleString('fa-IR')}٪</span>
        </div>
      ),
    },
    {
      key: 'attempts',
      title: 'تلاش',
      render: (item) =>
        `${item.attempts.toLocaleString('fa-IR')} / ${item.maxAttempts.toLocaleString('fa-IR')}`,
    },
    { key: 'start', title: 'زمان شروع', render: (item) => formatContentDate(item.startedAt) },
    { key: 'end', title: 'زمان پایان', render: (item) => formatContentDate(item.completedAt) },
    {
      key: 'related',
      title: 'مرتبط با',
      render: (item) =>
        item.relatedEntity?.href ? (
          <Link className="hover:underline" to={item.relatedEntity.href}>
            {item.relatedEntity.label}
          </Link>
        ) : (
          (item.relatedEntity?.label ?? '—')
        ),
    },
    {
      key: 'actions',
      title: 'عملیات',
      render: (item) => (
        <div className="flex gap-1" onClick={(event) => event.stopPropagation()}>
          <Button size="xs" variant="ghost" render={<Link to={`/system/jobs/${item.id}`} />}>
            مشاهده
          </Button>
          {item.status === 'FAILED' && canRetry && (
            <Button
              size="xs"
              variant="outline"
              disabled={item.attempts >= item.maxAttempts}
              onClick={() => void action(item, 'retry')}
            >
              تلاش مجدد
            </Button>
          )}
          {(item.status === 'QUEUED' || item.status === 'RUNNING') && canCancel && (
            <Button size="xs" variant="destructive" onClick={() => void action(item, 'cancel')}>
              لغو
            </Button>
          )}
        </div>
      ),
    },
  ];
  return (
    <ContentPage title="جاب‌ها" description="عملیات پس‌زمینه ایجادشده توسط بخش‌های مالک">
      {notice && <div className="border bg-background p-3 text-xs">{notice}</div>}
      {!session.loading && !canRead ? (
        <InlineError message="دسترسی مشاهده جاب‌ها را ندارید." />
      ) : (
        <>
          <ContentToolbar
            params={params}
            total={query.data?.total ?? 0}
            onChange={change}
            onReset={() => setParams({})}
          >
            <select
              className={selectClassName}
              value={params.get('status') ?? ''}
              onChange={(e) => change('status', e.target.value)}
            >
              <option value="">همه وضعیت‌ها</option>
              {Object.entries(JOB_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className={selectClassName}
              value={params.get('type') ?? ''}
              onChange={(e) => change('type', e.target.value)}
            >
              <option value="">همه انواع</option>
              {Object.entries(JOB_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input
              className={selectClassName}
              type="date"
              value={params.get('date') ?? ''}
              onChange={(e) => change('date', e.target.value)}
            />
            <select
              className={selectClassName}
              value={params.get('pageSize') ?? '20'}
              onChange={(e) => change('pageSize', e.target.value)}
            >
              <option value="20">۲۰ در صفحه</option>
              <option value="50">۵۰ در صفحه</option>
              <option value="100">۱۰۰ در صفحه</option>
            </select>
          </ContentToolbar>
          <ContentTable
            result={query.data}
            loading={session.loading || query.loading}
            error={query.error}
            columns={columns}
            onRowClick={(item) => navigate(`/system/jobs/${item.id}`)}
            onRetry={query.refetch}
            onPageChange={(page) => change('page', String(page))}
          />
        </>
      )}
    </ContentPage>
  );
}
function Status({ value }: { value: JobStatus }) {
  return (
    <span
      className={`px-2 py-1 ${value === 'SUCCEEDED' ? 'bg-success/10 text-success' : value === 'FAILED' ? 'bg-destructive/10 text-destructive' : value === 'RUNNING' || value === 'QUEUED' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}
    >
      {JOB_STATUS_LABELS[value]}
    </span>
  );
}
