import { MagnifyingGlassIcon, PlusIcon, XIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { commentStatusLabels, postStatusLabels } from './content-utils';
import type { CommentStatus, PageResult, PostStatus } from './content.types';

export const selectClassName =
  'h-9 min-w-32 border bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50';

export function ContentPage({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="min-w-0 flex-1 overflow-x-clip bg-muted/20">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          {action}
        </header>
        {children}
      </div>
    </main>
  );
}

export function NewContentLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Button render={<Link to={to} />}>
      <PlusIcon data-icon="inline-start" />
      {children}
    </Button>
  );
}

export function PostStatusBadge({ status }: { status: PostStatus }) {
  const styles =
    status === 'PUBLISHED'
      ? 'bg-success/10 text-success'
      : status === 'ARCHIVED'
        ? 'bg-destructive/10 text-destructive'
        : status === 'SCHEDULED' || status === 'IN_REVIEW'
          ? 'bg-warning/10 text-warning'
          : 'bg-muted text-muted-foreground';
  return (
    <span className={cn('inline-flex whitespace-nowrap px-2 py-1 text-xs font-medium', styles)}>
      {postStatusLabels[status]}
    </span>
  );
}

export function CommentStatusBadge({ status }: { status: CommentStatus }) {
  return (
    <span
      className={cn(
        'inline-flex whitespace-nowrap px-2 py-1 text-xs font-medium',
        status === 'APPROVED'
          ? 'bg-success/10 text-success'
          : status === 'PENDING'
            ? 'bg-warning/10 text-warning'
            : 'bg-destructive/10 text-destructive',
      )}
    >
      {commentStatusLabels[status]}
    </span>
  );
}

export function ContentToolbar({
  params,
  total,
  onChange,
  onReset,
  children,
}: {
  params: URLSearchParams;
  total: number;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
  children?: ReactNode;
}) {
  return (
    <Card className="p-4 shadow-none ring-0">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form
          className="flex w-full max-w-xl gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            onChange('search', String(new FormData(event.currentTarget).get('search') ?? '').trim());
          }}
        >
          <div className="relative min-w-0 flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              key={params.get('search') ?? ''}
              name="search"
              defaultValue={params.get('search') ?? ''}
              className="ps-8"
              placeholder="جست‌وجو"
            />
          </div>
          <Button type="submit" variant="outline">
            جست‌وجو
          </Button>
        </form>
        <span className="text-xs text-muted-foreground">
          {total.toLocaleString('fa-IR')} نتیجه
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {children}
        <Button size="sm" variant="ghost" onClick={onReset}>
          <XIcon data-icon="inline-start" />
          پاک‌کردن فیلترها
        </Button>
      </div>
    </Card>
  );
}

export interface ContentColumn<T> {
  key: string;
  title: string;
  className?: string;
  render: (item: T) => ReactNode;
}

export function ContentTable<T extends { id: string }>({
  result,
  loading,
  error,
  columns,
  onRowClick,
  onRetry,
  onPageChange,
  empty = 'موردی با این شرایط پیدا نشد.',
}: {
  result: PageResult<T> | null;
  loading: boolean;
  error: string | null;
  columns: ContentColumn<T>[];
  onRowClick?: (item: T) => void;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  empty?: string;
}) {
  return (
    <Card className="min-w-0 overflow-hidden py-0 shadow-none ring-0">
      {error ? (
        <div className="p-6 text-sm">
          <p className="text-destructive">{error}</p>
          <Button className="mt-3" size="sm" variant="outline" onClick={onRetry}>
            تلاش دوباره
          </Button>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-xs">
            <thead className="border-b bg-muted/40 text-muted-foreground">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className={cn('px-4 py-3 text-start font-medium', column.className)}>
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading
                ? Array.from({ length: 6 }, (_, index) => (
                    <tr key={index}>
                      <td colSpan={columns.length} className="px-4 py-3">
                        <Skeleton className="h-10 w-full" />
                      </td>
                    </tr>
                  ))
                : result?.items.map((item) => (
                    <tr
                      key={item.id}
                      tabIndex={onRowClick ? 0 : undefined}
                      className={cn(onRowClick && 'cursor-pointer hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none')}
                      onClick={() => onRowClick?.(item)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') onRowClick?.(item);
                      }}
                    >
                      {columns.map((column) => (
                        <td key={column.key} className={cn('px-4 py-3 align-middle', column.className)}>
                          {column.render(item)}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && result?.items.length === 0 && (
        <div className="p-12 text-center text-sm text-muted-foreground">{empty}</div>
      )}
      {result && result.pageCount > 0 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <span className="text-xs text-muted-foreground">
            صفحه {result.page.toLocaleString('fa-IR')} از {result.pageCount.toLocaleString('fa-IR')}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={result.page <= 1} onClick={() => onPageChange(result.page - 1)}>
              قبلی
            </Button>
            <Button size="sm" variant="outline" disabled={result.page >= result.pageCount} onClick={() => onPageChange(result.page + 1)}>
              بعدی
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function ContentLoading() {
  return <Skeleton className="h-72 w-full" />;
}

export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="p-5 text-sm shadow-none ring-0">
      <p className="text-destructive">{message}</p>
      {onRetry && (
        <Button className="mt-3" size="sm" variant="outline" onClick={onRetry}>
          تلاش دوباره
        </Button>
      )}
    </Card>
  );
}
