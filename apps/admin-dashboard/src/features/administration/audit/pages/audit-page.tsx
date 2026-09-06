import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { administrationRepository } from '../../repository/administration-repository';
import {
  auditActionLabels,
  auditDomainLabels,
  auditTargetHref,
  safeDisplay,
} from '../../shared/administration-utils';
import {
  ADMIN_PERMISSIONS,
  type AuditAction,
  type AuditDomain,
  type AuditEvent,
  type AuditResult,
} from '../../types/administration.types';
export function AuditPage() {
  const [params, setParams] = useSearchParams();
  const session = useAdminSession();
  const canRead = session.data?.user?.permissions.includes(ADMIN_PERMISSIONS.auditRead) ?? false;
  const [selected, setSelected] = useState<AuditEvent | null>(null);
  const query = useContentQuery(
    useCallback(
      (signal: AbortSignal) =>
        administrationRepository.listAuditEvents(
          {
            search: params.get('search') || undefined,
            actor: params.get('actor') || undefined,
            domain: (params.get('domain') || undefined) as AuditDomain | undefined,
            action: (params.get('action') || undefined) as AuditAction | undefined,
            result: (params.get('result') || undefined) as AuditResult | undefined,
            from: params.get('from') || undefined,
            to: params.get('to') || undefined,
            page: Number(params.get('page')) || 1,
            pageSize: (Number(params.get('pageSize')) || 20) as 20 | 50 | 100,
          },
          signal,
        ),
      [params],
    ),
    canRead,
  );
  const admins = useContentQuery(
    useCallback(
      (signal: AbortSignal) => administrationRepository.listAdmins({ pageSize: 100 }, signal),
      [],
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
  const columns: ContentColumn<AuditEvent>[] = [
    { key: 'time', title: 'زمان', render: (item) => formatContentDate(item.occurredAt) },
    {
      key: 'actor',
      title: 'ادمین',
      render: (item) =>
        item.actorAdminId ? (
          <Link className="hover:underline" to={`/administration/admins/${item.actorAdminId}`}>
            {admins.data?.items.find((admin) => admin.id === item.actorAdminId)?.displayName ??
              item.actorAdminId}
          </Link>
        ) : (
          'سیستم'
        ),
    },
    { key: 'action', title: 'عملیات', render: (item) => auditActionLabels[item.action] },
    { key: 'domain', title: 'حوزه', render: (item) => auditDomainLabels[item.domain] },
    {
      key: 'target',
      title: 'هدف',
      render: (item) => {
        const href = auditTargetHref(item.targetType, item.targetId);
        return href ? (
          <Link className="hover:underline" to={href}>
            {item.targetLabel ?? item.targetId}
          </Link>
        ) : (
          (item.targetLabel ?? '—')
        );
      },
    },
    {
      key: 'result',
      title: 'نتیجه',
      render: (item) => (
        <span className={item.result === 'SUCCESS' ? 'text-success' : 'text-destructive'}>
          {item.result === 'SUCCESS' ? 'موفق' : 'ناموفق'}
        </span>
      ),
    },
  ];
  return (
    <ContentPage title="لاگ ممیزی" description="رویدادهای تغییرناپذیر اقدامات مدیریتی و سیستمی">
      {!session.loading && !canRead ? (
        <InlineError message="دسترسی مشاهده لاگ ممیزی را ندارید." />
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
              value={params.get('actor') ?? ''}
              onChange={(e) => change('actor', e.target.value)}
            >
              <option value="">همه عامل‌ها</option>
              {admins.data?.items.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.displayName}
                </option>
              ))}
            </select>
            <select
              className={selectClassName}
              value={params.get('domain') ?? ''}
              onChange={(e) => change('domain', e.target.value)}
            >
              <option value="">همه حوزه‌ها</option>
              {Object.entries(auditDomainLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className={selectClassName}
              value={params.get('action') ?? ''}
              onChange={(e) => change('action', e.target.value)}
            >
              <option value="">همه عملیات‌ها</option>
              {Object.entries(auditActionLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className={selectClassName}
              value={params.get('result') ?? ''}
              onChange={(e) => change('result', e.target.value)}
            >
              <option value="">همه نتایج</option>
              <option value="SUCCESS">موفق</option>
              <option value="FAILURE">ناموفق</option>
            </select>
            <input
              className={selectClassName}
              type="date"
              value={params.get('from') ?? ''}
              onChange={(e) => change('from', e.target.value)}
              aria-label="از تاریخ"
            />
            <input
              className={selectClassName}
              type="date"
              value={params.get('to') ?? ''}
              onChange={(e) => change('to', e.target.value)}
              aria-label="تا تاریخ"
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
            onRowClick={setSelected}
            onRetry={query.refetch}
            onPageChange={(page) => change('page', String(page))}
          />
        </>
      )}
      <AuditDetails
        event={selected}
        actorName={
          selected?.actorAdminId
            ? admins.data?.items.find((admin) => admin.id === selected.actorAdminId)?.displayName
            : undefined
        }
        onClose={() => setSelected(null)}
      />
    </ContentPage>
  );
}
function AuditDetails({
  event,
  actorName,
  onClose,
}: {
  event: AuditEvent | null;
  actorName?: string;
  onClose: () => void;
}) {
  if (!event) return null;
  const href = auditTargetHref(event.targetType, event.targetId);
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent side="left" className="w-[min(38rem,92vw)] overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{auditActionLabels[event.action]}</SheetTitle>
          <SheetDescription>{event.summaryFa}</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 px-4 pb-6 text-xs">
          <dl className="grid grid-cols-[8rem_1fr] gap-2">
            <dt className="text-muted-foreground">زمان</dt>
            <dd>{formatContentDate(event.occurredAt)}</dd>
            <dt className="text-muted-foreground">عامل</dt>
            <dd>{actorName ?? event.actorAdminId ?? 'سیستم'}</dd>
            <dt className="text-muted-foreground">حوزه</dt>
            <dd>{auditDomainLabels[event.domain]}</dd>
            <dt className="text-muted-foreground">هدف</dt>
            <dd>
              {href ? (
                <Link className="hover:underline" to={href}>
                  {event.targetLabel ?? event.targetId}
                </Link>
              ) : (
                (event.targetLabel ?? '—')
              )}
            </dd>
            <dt className="text-muted-foreground">نتیجه</dt>
            <dd>{event.result === 'SUCCESS' ? 'موفق' : 'ناموفق'}</dd>
            <dt className="text-muted-foreground">Correlation ID</dt>
            <dd className="font-mono" dir="ltr">
              {event.correlationId ?? '—'}
            </dd>
          </dl>
          {event.before && <Json title="پیش از تغییر" value={event.before} />}{' '}
          {event.after && <Json title="پس از تغییر" value={event.after} />}{' '}
          {event.metadata && <Json title="فراداده امن" value={event.metadata} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
function Json({ title, value }: { title: string; value: unknown }) {
  return (
    <section>
      <h3 className="mb-2 font-medium">{title}</h3>
      <pre className="max-w-full overflow-x-auto border bg-muted/30 p-3 text-[10px]" dir="ltr">
        {JSON.stringify(safeDisplay(value), null, 2)}
      </pre>
    </section>
  );
}
