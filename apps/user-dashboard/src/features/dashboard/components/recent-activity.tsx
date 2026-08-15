import {
  Activity,
  ArrowLeft,
  BriefcaseBusiness,
  CircleAlert,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useId } from 'react';
import { Link } from 'react-router-dom';

import type { ActivityItem } from '@/features/dashboard/types';
import { cn } from '@/lib/utils';

const activityVisuals: Record<ActivityItem['kind'], { icon: LucideIcon; className: string }> = {
  analysis: { icon: Sparkles, className: 'bg-blue-50 text-primary' },
  recommendation: { icon: GraduationCap, className: 'bg-violet-50 text-violet-700' },
  requirement: { icon: CircleAlert, className: 'bg-amber-50 text-amber-700' },
  application: { icon: BriefcaseBusiness, className: 'bg-emerald-50 text-emerald-700' },
};

export function RecentActivity({ items }: { items: readonly ActivityItem[] }) {
  const titleId = useId();

  if (items.length === 0) return null;

  return (
    <section aria-labelledby={titleId} className="min-w-0 py-1">
      <header className="flex items-center gap-2.5 px-1">
        <Activity aria-hidden="true" className="size-[18px] shrink-0 text-primary" />
        <h2 className="truncate text-[15px] font-extrabold text-foreground" id={titleId}>
          فعالیت‌های اخیر
        </h2>
      </header>

      <ul className="mt-2 divide-y divide-[#e9edf2] border-y border-[#e9edf2]">
        {items.map((item) => {
          const visual = activityVisuals[item.kind];
          const Icon = visual.icon;
          const content = (
            <>
              <span
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full',
                  visual.className,
                )}
              >
                <Icon aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className="block truncate text-xs font-bold leading-5 text-foreground"
                  dir="auto"
                >
                  {item.title}
                </span>
                <time className="block text-[10px] text-muted-foreground">{item.occurredAt}</time>
              </span>
              {item.href && (
                <ArrowLeft
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5"
                />
              )}
            </>
          );

          return (
            <li key={item.id}>
              {item.href ? (
                <Link
                  aria-label={item.title}
                  className="group flex min-w-0 items-center gap-2.5 rounded-lg px-1 py-2.5 outline-none transition-colors hover:bg-[#f7f8fb] focus-visible:ring-4 focus-visible:ring-ring/15"
                  to={item.href}
                >
                  {content}
                </Link>
              ) : (
                <div className="flex min-w-0 items-center gap-2.5 px-1 py-2.5">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
