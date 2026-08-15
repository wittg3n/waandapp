import {
  ArrowLeft,
  BookmarkCheck,
  Building2,
  CircleDot,
  FileText,
  Send,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import type { ApplicationStage } from '@/features/dashboard/types';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

const stageIcons: Record<ApplicationStage['id'], LucideIcon> = {
  recommended: Building2,
  shortlisted: BookmarkCheck,
  preparing: FileText,
  submitted: Send,
  decision: CircleDot,
};

const stageDescriptions: Record<ApplicationStage['id'], string> = {
  recommended: 'برنامه‌های متناسب با پروفایل شما',
  shortlisted: 'انتخاب‌هایی که ذخیره کرده‌اید',
  preparing: 'درخواست‌هایی که در حال آماده‌سازی‌اند',
  submitted: 'درخواست‌های ارسال‌شده',
  decision: 'درخواست‌هایی که نتیجه دریافت کرده‌اند',
};

function getActiveStage(stages: readonly ApplicationStage[]) {
  const priority: ApplicationStage['id'][] = [
    'decision',
    'submitted',
    'preparing',
    'shortlisted',
    'recommended',
  ];

  return priority.find((id) => stages.some((stage) => stage.id === id && stage.count > 0));
}

export function ApplicationPipeline({ stages }: { stages: readonly ApplicationStage[] }) {
  if (stages.length === 0) return null;

  const activeStageId = getActiveStage(stages);
  const activeStage = stages.find((stage) => stage.id === activeStageId);

  return (
    <section
      aria-labelledby="application-progress-title"
      className="min-w-0 rounded-2xl border border-border/70 bg-white p-4 sm:p-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold text-primary">نمای کلی درخواست‌ها</p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2
              id="application-progress-title"
              className="text-lg font-black tracking-tight text-foreground"
            >
              روند اپلای
            </h2>

            {activeStage && (
              <span className="rounded-full bg-primary/[0.07] px-2.5 py-1 text-[11px] font-bold text-primary">
                وضعیت فعلی: {activeStage.label}
              </span>
            )}
          </div>

          <p className="mt-1.5 max-w-xl text-xs leading-6 text-muted-foreground">
            وضعیت پیشنهادها، انتخاب‌ها و درخواست‌های دانشگاهی شما در یک نگاه
          </p>
        </div>

        <Link
          to="/applications"
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-primary outline-none transition-colors hover:bg-primary/[0.06] focus-visible:ring-4 focus-visible:ring-ring/15"
        >
          مشاهده همه
          <ArrowLeft aria-hidden="true" className="size-3.5" strokeWidth={2} />
        </Link>
      </div>

      {/* Stages */}
      <ol
        aria-label="وضعیت مراحل اپلای"
        className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5"
      >
        {stages.map((stage) => {
          const Icon = stageIcons[stage.id];
          const isActive = stage.id === activeStageId;
          const isEmpty = stage.count === 0;

          return (
            <li key={stage.id} className="min-w-0">
              <Link
                to={stage.href}
                aria-label={`${stage.label}، ${formatNumber(stage.count)} مورد`}
                className={cn(
                  'group relative flex min-h-[132px] min-w-0 flex-col overflow-hidden rounded-xl border p-3.5 outline-none',
                  'transition-[background-color,border-color,box-shadow,transform] duration-200',
                  'hover:-translate-y-0.5 hover:border-primary/20 hover:bg-primary/[0.015]',
                  'focus-visible:ring-4 focus-visible:ring-ring/15',

                  isActive
                    ? 'border-primary/20 bg-primary/[0.035] shadow-[0_8px_30px_rgba(20,60,251,0.06)]'
                    : 'border-border/70 bg-[#fafbfc]',

                  isEmpty && 'bg-white',
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 top-0 h-[2px] rounded-b-full bg-primary"
                  />
                )}

                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-xl border bg-white text-muted-foreground',
                      'transition-colors duration-200 group-hover:text-primary',

                      isActive &&
                        'border-primary/15 bg-primary text-white shadow-sm group-hover:text-white',
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4" strokeWidth={1.9} />
                  </span>

                  {isActive && (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-extrabold text-primary">
                      فعال
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-5">
                  <div className="flex items-end gap-1">
                    <span
                      className={cn(
                        'text-[26px] font-black leading-none tracking-tight',
                        isEmpty ? 'text-muted-foreground/45' : 'text-foreground',
                      )}
                    >
                      {formatNumber(stage.count)}
                    </span>

                    <span className="pb-0.5 text-[10px] font-medium text-muted-foreground">
                      مورد
                    </span>
                  </div>

                  <p className="mt-2 truncate text-xs font-extrabold text-foreground">
                    {stage.label}
                  </p>

                  <p className="mt-1 line-clamp-2 text-[10px] leading-5 text-muted-foreground">
                    {stageDescriptions[stage.id]}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
