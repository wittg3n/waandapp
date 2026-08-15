import { ArrowLeft, CalendarClock, Clock3 } from 'lucide-react';
import { useId } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import type { Deadline } from '@/features/dashboard/types';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

function deadlineTone(daysRemaining: number) {
  if (daysRemaining <= 14) return 'border-rose-200 bg-rose-50 text-rose-700';
  if (daysRemaining <= 30) return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-blue-100 bg-blue-50 text-blue-700';
}

export function DeadlinePreview({ deadlines }: { deadlines: readonly Deadline[] }) {
  const titleId = useId();

  if (deadlines.length === 0) return null;

  return (
    <section
      aria-labelledby={titleId}
      className="min-w-0 overflow-hidden rounded-2xl border border-[#e4e8ef] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.025)]"
    >
      <header className="flex items-center justify-between gap-3 px-4 pb-2 pt-3.5 sm:px-5 sm:pt-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/[0.07] text-primary">
            <CalendarClock aria-hidden="true" className="size-[17px]" strokeWidth={1.8} />
          </span>
          <h2 className="truncate text-[15px] font-extrabold text-foreground" id={titleId}>
            ددلاین‌های نزدیک
          </h2>
        </div>
        <Link
          aria-label="مشاهده همه ددلاین‌ها"
          className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-[11px] font-bold text-primary outline-none transition-colors hover:bg-primary/[0.05] focus-visible:ring-4 focus-visible:ring-ring/15"
          to="/deadlines"
        >
          همه ددلاین‌ها
          <ArrowLeft aria-hidden="true" className="size-3.5" />
        </Link>
      </header>

      <ul className="divide-y divide-[#edf0f4] px-2 pb-2 sm:px-3 sm:pb-3">
        {deadlines.map((deadline) => (
          <li key={deadline.id}>
            <Link
              aria-label={`مشاهده ددلاین ${deadline.university}، ${formatNumber(deadline.daysRemaining)} روز باقی‌مانده`}
              className="group flex min-w-0 items-center gap-2.5 rounded-xl px-2 py-2.5 outline-none transition-colors hover:bg-[#f7f8fb] focus-visible:ring-4 focus-visible:ring-ring/15"
              to={deadline.href}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#f2f4f8] text-[#687080]">
                <Clock3 aria-hidden="true" className="size-4" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-extrabold text-foreground" dir="auto">
                  {deadline.university}
                </span>
                <span
                  className="mt-0.5 block truncate text-[11px] text-muted-foreground"
                  dir="auto"
                >
                  {deadline.program}
                </span>
              </span>
              <span className="shrink-0 text-left">
                <Badge
                  className={cn('px-2 py-1 text-[10px]', deadlineTone(deadline.daysRemaining))}
                  variant="outline"
                >
                  {formatNumber(deadline.daysRemaining)} روز
                </Badge>
                <span className="mt-1 hidden text-[10px] text-muted-foreground sm:block">
                  {deadline.dateLabel}
                </span>
              </span>
              <ArrowLeft
                aria-hidden="true"
                className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
