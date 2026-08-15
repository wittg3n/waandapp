import { ArrowLeft, Clock3, FileSearch, Languages, Sparkles, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import type { NextAction } from '@/features/dashboard/types';
import { cn } from '@/lib/utils';

const actionIcons: Record<NextAction['kind'], LucideIcon> = {
  deadline: Clock3,
  resume: FileSearch,
  language: Languages,
};

const priorityLabels: Record<NextAction['priority'], string> = {
  urgent: 'فوری',
  high: 'مهم',
  normal: 'پیشنهادی',
};

export function AttentionQueue({ actions }: { actions: readonly NextAction[] }) {
  if (actions.length === 0) return null;

  const [primaryAction, ...secondaryActions] = actions;
  const PrimaryIcon = actionIcons[primaryAction.kind];

  return (
    <section
      aria-labelledby="attention-title"
      className="h-full min-w-0 rounded-2xl border border-[#e4e7ed] bg-white p-4 shadow-[0_6px_24px_rgba(15,23,42,0.035)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Sparkles aria-hidden="true" className="size-[18px]" />
            <p className="text-xs font-extrabold">اقدام پیشنهادی Waand</p>
          </div>
          <h2 className="mt-1 text-lg font-black text-foreground" id="attention-title">
            نیازمند توجه شما
          </h2>
        </div>
        <Badge className="border-amber-200 bg-amber-50 text-amber-700" variant="outline">
          اولویت‌بندی‌شده
        </Badge>
      </div>

      <Link
        className="group mt-4 block rounded-2xl border border-amber-200/80 bg-[#fffaf0] p-4 outline-none transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_8px_24px_rgba(180,120,20,0.08)] focus-visible:ring-4 focus-visible:ring-amber-200/70"
        to={primaryAction.href}
      >
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
            <PrimaryIcon aria-hidden="true" className="size-5" strokeWidth={1.8} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-black leading-6 text-foreground">
                {primaryAction.title}
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">
                {priorityLabels[primaryAction.priority]}
              </span>
            </span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              {primaryAction.description}
            </span>
            <span className="mt-3 flex flex-wrap items-center justify-between gap-2">
              {primaryAction.meta && (
                <span className="text-xs font-extrabold text-amber-700">{primaryAction.meta}</span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-primary">
                {primaryAction.ctaLabel}
                <ArrowLeft
                  aria-hidden="true"
                  className="size-3.5 transition-transform group-hover:-translate-x-0.5"
                />
              </span>
            </span>
          </span>
        </div>
      </Link>

      {secondaryActions.length > 0 && (
        <ul className="mt-2 divide-y divide-[#eceff3]">
          {secondaryActions.map((action) => {
            const Icon = actionIcons[action.kind];

            return (
              <li key={action.id}>
                <Link
                  className="group flex min-h-[68px] items-center gap-3 rounded-xl px-2 py-2.5 outline-none transition-colors hover:bg-primary/[0.035] focus-visible:ring-4 focus-visible:ring-ring/15"
                  to={action.href}
                >
                  <span
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-xl bg-[#f1f3f6] text-[#626a75]',
                      action.priority === 'high' && 'bg-primary/[0.075] text-primary',
                    )}
                  >
                    <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-black text-foreground">
                      {action.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {action.description}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] font-extrabold text-primary sm:block">
                    {action.ctaLabel}
                  </span>
                  <ArrowLeft
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-primary transition-transform group-hover:-translate-x-0.5"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
