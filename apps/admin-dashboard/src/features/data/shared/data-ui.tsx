import {
  ArrowRightIcon,
  CaretLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XIcon,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { DataHistoryEvent, PageResult } from '../types/data.types';
import { formatDataDate, statusLabels } from './data-utils';

const reveal: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
};

export function DataPage({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <motion.main
      className="min-w-0 flex-1 bg-muted/20"
      variants={reveal}
      initial="hidden"
      animate="visible"
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {action}
        </div>
        {children}
      </div>
    </motion.main>
  );
}

export function PrimaryAction({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
      <Button onClick={onClick}>
        <PlusIcon data-icon="inline-start" />
        {children}
      </Button>
    </motion.div>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const critical = ['ARCHIVED', 'FAILED', 'CRITICAL', 'INVALID'].includes(value);
  const warning = [
    'INACTIVE',
    'SUPERSEDED',
    'PENDING',
    'PARSING',
    'VALIDATING',
    'REVIEW_REQUIRED',
    'WARNING',
    'OPEN',
  ].includes(value);
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'inline-flex whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium',
        critical
          ? 'bg-destructive/10 text-destructive'
          : warning
            ? 'bg-warning/10 text-warning'
            : 'bg-success/10 text-success',
      )}
    >
      {statusLabels[value] ?? value}
    </motion.span>
  );
}

export function ListToolbar({
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
    <motion.div className="min-w-0" variants={reveal} initial="hidden" animate="visible">
      <Card className="rounded-none p-4 shadow-none ring-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <form
            className="flex w-full max-w-lg gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              onChange('search', String(form.get('search') ?? '').trim());
            }}
          >
            <div className="relative min-w-0 flex-1">
              <MagnifyingGlassIcon className="absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
          <select
            className="h-8  border bg-background px-2 text-xs"
            value={params.get('pageSize') ?? '20'}
            onChange={(event) => onChange('pageSize', event.target.value)}
            aria-label="تعداد در صفحه"
          >
            <option value="20">۲۰ در صفحه</option>
            <option value="50">۵۰ در صفحه</option>
            <option value="100">۱۰۰ در صفحه</option>
          </select>
          <Button size="sm" variant="ghost" onClick={onReset}>
            <XIcon data-icon="inline-start" />
            پاک‌کردن فیلترها
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export const selectClassName =
  'h-8 min-w-32  border bg-background px-2 text-xs outline-none focus-visible:ring-1 focus-visible:ring-ring';

export function SimpleSort({
  params,
  onChange,
  options,
}: {
  params: URLSearchParams;
  onChange: (key: string, value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <>
      <select
        className={selectClassName}
        value={params.get('sort') ?? options[0]?.[0]}
        onChange={(event) => onChange('sort', event.target.value)}
        aria-label="مرتب‌سازی بر اساس"
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select
        className={selectClassName}
        value={params.get('order') ?? 'desc'}
        onChange={(event) => onChange('order', event.target.value)}
        aria-label="جهت مرتب‌سازی"
      >
        <option value="desc">نزولی</option>
        <option value="asc">صعودی</option>
      </select>
    </>
  );
}

export interface TableColumn<T> {
  key: string;
  title: string;
  className?: string;
  render: (item: T) => ReactNode;
}

export function DataTable<T extends { id: string }>({
  result,
  loading,
  error,
  columns,
  onRowClick,
  onRetry,
  onPageChange,
  empty = 'رکوردی با این شرایط پیدا نشد.',
}: {
  result: PageResult<T> | null;
  loading: boolean;
  error: string | null;
  columns: TableColumn<T>[];
  onRowClick?: (item: T) => void;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  empty?: string;
}) {
  return (
    <motion.div className="min-w-0" variants={reveal} initial="hidden" animate="visible">
      <Card className="min-w-0 overflow-hidden rounded-none py-0 shadow-none ring-0">
        {error ? (
          <div className="p-6 text-sm">
            <p className="text-destructive">{error}</p>
            <Button size="sm" variant="outline" className="mt-3" onClick={onRetry}>
              تلاش دوباره
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-xs">
              <thead className="border-b bg-muted/40 text-muted-foreground">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn('px-4 py-3 text-start font-medium', column.className)}
                    >
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
                          <Skeleton className="h-9 w-full" />
                        </td>
                      </tr>
                    ))
                  : result?.items.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: Math.min(index * 0.025, 0.2) }}
                        tabIndex={0}
                        className={cn(
                          onRowClick &&
                            'cursor-pointer hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none',
                        )}
                        onClick={() => onRowClick?.(item)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') onRowClick?.(item);
                        }}
                      >
                        {columns.map((column) => (
                          <td
                            key={column.key}
                            className={cn('px-4 py-3 align-middle', column.className)}
                          >
                            {column.render(item)}
                          </td>
                        ))}
                      </motion.tr>
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
              صفحه {result.page.toLocaleString('fa-IR')} از{' '}
              {result.pageCount.toLocaleString('fa-IR')}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={result.page <= 1}
                onClick={() => onPageChange(result.page - 1)}
              >
                قبلی
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={result.page >= result.pageCount}
                onClick={() => onPageChange(result.page + 1)}
              >
                بعدی
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export function DetailHeader({
  backTo,
  backLabel,
  title,
  badges,
  meta,
  action,
}: {
  backTo: string;
  backLabel: string;
  title: string;
  badges?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <motion.div variants={reveal} initial="hidden" animate="visible">
      <Button variant="ghost" size="sm" className="mb-3 px-0" render={<Link to={backTo} />}>
        <ArrowRightIcon data-icon="inline-start" />
        {backLabel}
      </Button>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-none border bg-card p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
            {badges}
          </div>
          {meta && <div className="mt-2 text-sm text-muted-foreground">{meta}</div>}
        </div>
        {action}
      </div>
    </motion.div>
  );
}

export function LoadingDetail() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
export function DetailError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="p-6 text-sm shadow-none ring-0">
      <p className="text-destructive">{message}</p>
      <Button size="sm" variant="outline" className="mt-3" onClick={onRetry}>
        تلاش دوباره
      </Button>
    </Card>
  );
}
export function NotFound({ label }: { label: string }) {
  return (
    <Card className="p-10 text-center shadow-none ring-0">
      <p className="font-medium">{label} پیدا نشد</p>
      <p className="mt-1 text-sm text-muted-foreground">
        شناسه مسیر با داده‌های موجود هم‌خوان نیست.
      </p>
    </Card>
  );
}

export function EntityLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 font-medium hover:underline"
      onClick={(event) => event.stopPropagation()}
    >
      {children}
      <CaretLeftIcon className="size-3" />
    </Link>
  );
}

export function HistoryList({ events }: { events: DataHistoryEvent[] }) {
  if (!events.length)
    return <p className="text-sm text-muted-foreground">تغییری برای این رکورد ثبت نشده است.</p>;
  return (
    <ol className="divide-y">
      {events.map((event, index) => (
        <motion.li
          key={event.id}
          className="py-3 first:pt-0"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04 }}
        >
          <div className="flex flex-wrap justify-between gap-2">
            <p className="font-medium">{event.title}</p>
            <time className="text-xs text-muted-foreground">
              {formatDataDate(event.createdAt, true)}
            </time>
          </div>
          {event.description && (
            <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
          )}
        </motion.li>
      ))}
    </ol>
  );
}

export function SectionCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={reveal}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -1 }}
    >
      <Card className="rounded-none py-5 shadow-none ring-0">
        <CardHeader>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}

export function InfoGrid({
  fields,
}: {
  fields: Array<{ label: string; value: ReactNode; ltr?: boolean }>;
}) {
  return (
    <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {fields.map((field, index) => (
        <motion.div
          key={field.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.035, 0.2) }}
        >
          <dt className="text-xs text-muted-foreground">{field.label}</dt>
          <dd
            dir={field.ltr ? 'ltr' : undefined}
            className={cn('mt-1 text-sm font-medium', field.ltr && 'text-end')}
          >
            {field.value || '—'}
          </dd>
        </motion.div>
      ))}
    </dl>
  );
}

export function InlineEmpty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>;
}
