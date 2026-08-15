import { ArrowLeft, CircleAlert, FileText } from 'lucide-react';
import { useId } from 'react';
import { Link } from 'react-router-dom';

import type { DocumentHealth } from '@/features/dashboard/types';
import { formatNumber } from '@/lib/format';

export function DocumentHealthCard({ health }: { health: DocumentHealth }) {
  const titleId = useId();
  const stats = [
    { label: 'آماده', value: health.ready, className: 'text-emerald-700' },
    { label: 'نیازمند اصلاح', value: health.needsReview, className: 'text-amber-700' },
    { label: 'ناقص', value: health.incomplete, className: 'text-slate-600' },
  ] as const;

  return (
    <section
      aria-labelledby={titleId}
      className="min-w-0 rounded-2xl bg-[linear-gradient(145deg,#f8f9fc_0%,#f3f5f9_100%)] p-4 ring-1 ring-inset ring-[#e7eaf0] sm:p-5"
    >
      <header className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-primary shadow-sm ring-1 ring-[#e5e9f0]">
          <FileText aria-hidden="true" className="size-[17px]" strokeWidth={1.8} />
        </span>
        <h2 className="truncate text-[15px] font-extrabold text-foreground" id={titleId}>
          وضعیت مدارک
        </h2>
      </header>

      <dl className="mt-3 grid grid-cols-3 divide-x divide-x-reverse divide-[#dde2ea]">
        {stats.map((stat) => (
          <div className="flex min-w-0 flex-col items-center px-1 text-center" key={stat.label}>
            <dt className="order-2 mt-0.5 text-[10px] leading-4 text-muted-foreground sm:text-[11px]">
              {stat.label}
            </dt>
            <dd className={`order-1 text-lg font-black tabular-nums ${stat.className}`}>
              {formatNumber(stat.value)}
            </dd>
          </div>
        ))}
      </dl>

      {health.issue && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50/80 px-3 py-2 text-[11px] font-medium leading-5 text-amber-900 ring-1 ring-inset ring-amber-100">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-amber-700" />
          <span className="min-w-0">{health.issue}</span>
        </p>
      )}

      <Link
        className="mt-2.5 inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-extrabold text-primary outline-none transition-colors hover:bg-white/80 focus-visible:ring-4 focus-visible:ring-ring/15"
        to={health.href}
      >
        مدیریت مدارک
        <ArrowLeft aria-hidden="true" className="size-3.5" />
      </Link>
    </section>
  );
}
