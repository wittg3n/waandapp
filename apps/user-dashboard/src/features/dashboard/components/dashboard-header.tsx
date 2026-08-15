import { ArrowLeft, Gauge, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { buttonVariants } from '@/components/ui/button';
import type { ApplicationSummary } from '@/features/dashboard/types';
import { formatNumber, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';

type DashboardHeaderProps = {
  userName: string;
  summary: ApplicationSummary;
};

export function DashboardHeader({ summary, userName }: DashboardHeaderProps) {
  useEffect(() => {
    document.title = 'وآند | مرکز فرمان اپلای';
  }, []);

  const metrics = [
    { label: 'برنامه پیشنهادی', value: summary.recommendedPrograms },
    { label: 'دانشگاه منتخب', value: summary.shortlistedUniversities },
    { label: 'در حال آماده‌سازی', value: summary.preparingApplications },
    { label: 'اپلیکیشن ارسال‌شده', value: summary.submittedApplications },
  ];

  return (
    <header aria-labelledby="dashboard-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/[0.07] px-3 py-1 text-xs font-extrabold text-primary">
              <Sparkles aria-hidden="true" className="size-3.5" />
              مرکز فرمان اپلای
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-white px-3 py-1 text-xs font-bold text-muted-foreground">
              <Gauge aria-hidden="true" className="size-3.5 text-primary" />
              آمادگی اپلای {formatPercent(summary.readiness)}
            </span>
          </div>
          <h1
            className="text-[28px] font-black leading-tight tracking-[-0.035em] text-foreground sm:text-[34px]"
            id="dashboard-title"
          >
            سلام {userName} <span aria-hidden="true">👋</span>
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground sm:text-[15px]">
            وضعیت اپلای شما برای ورودی {summary.intake}
          </p>
        </div>

        <Link
          className={cn(buttonVariants(), 'h-11 w-full rounded-xl px-5 sm:w-auto')}
          to={summary.preparingApplications > 0 ? '/applications' : '/universities'}
        >
          ادامه مسیر اپلای
          <ArrowLeft aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <section
        aria-label="خلاصه وضعیت اپلای"
        className="mt-5 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#e5e8ee] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.025)] lg:grid-cols-4"
      >
        {metrics.map((metric, index) => (
          <div
            className={cn(
              'relative min-w-0 px-4 py-3.5 sm:px-5',
              index % 2 !== 0 && 'border-r border-[#eceef2] lg:border-r-0',
              index > 1 && 'border-t border-[#eceef2] lg:border-t-0',
              index > 0 && 'lg:border-r lg:border-[#eceef2]',
            )}
            key={metric.label}
          >
            <p className="text-[22px] font-black leading-none tracking-[-0.03em] text-foreground">
              {formatNumber(metric.value)}
            </p>
            <p className="mt-1.5 truncate text-xs font-bold text-muted-foreground">
              {metric.label}
            </p>
          </div>
        ))}
      </section>
    </header>
  );
}
