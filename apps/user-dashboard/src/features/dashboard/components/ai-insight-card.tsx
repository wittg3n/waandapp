import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BrainCircuit,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import type { AIInsight } from '@/features/dashboard/types';
import { cn } from '@/lib/utils';

const insightMeta: Record<
  AIInsight['kind'],
  { icon: LucideIcon; className: string; iconClassName: string }
> = {
  strength: {
    icon: Sparkles,
    className: 'border-emerald-100 bg-emerald-50/65',
    iconClassName: 'bg-emerald-100 text-emerald-700',
  },
  risk: {
    icon: ShieldAlert,
    className: 'border-amber-100 bg-amber-50/70',
    iconClassName: 'bg-amber-100 text-amber-700',
  },
  opportunity: {
    icon: Lightbulb,
    className: 'border-primary/10 bg-primary/[0.045]',
    iconClassName: 'bg-primary/[0.1] text-primary',
  },
};

export function AiInsights({ insights }: { insights: readonly AIInsight[] }) {
  if (insights.length === 0) return null;

  return (
    <section
      aria-labelledby="ai-insights-title"
      className="relative isolate h-full min-w-0 overflow-hidden rounded-2xl border border-primary/15 bg-[linear-gradient(135deg,rgba(20,60,251,0.055),rgba(255,255,255,0.96)_42%,#fff)] p-4 shadow-[0_8px_30px_rgba(20,60,251,0.055)] sm:p-5"
    >
      <div
        aria-hidden="true"
        className="absolute -left-16 -top-20 -z-10 size-56 rounded-full bg-primary/[0.07] blur-3xl"
      />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-white shadow-[0_8px_20px_rgba(20,60,251,0.18)]">
            <BrainCircuit aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="text-[10px] font-extrabold text-primary">بر اساس پروفایل و مدارک شما</p>
            <h2 className="mt-0.5 text-lg font-black text-foreground" id="ai-insights-title">
              تحلیل Waand
            </h2>
          </div>
        </div>
        <Link
          className="hidden items-center gap-1.5 text-xs font-extrabold text-primary outline-none hover:text-primary/75 focus-visible:ring-4 focus-visible:ring-ring/15 sm:inline-flex"
          to="/profile"
        >
          مشاهده تحلیل کامل
          <ArrowLeft aria-hidden="true" className="size-3.5" />
        </Link>
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
        {insights.map((insight, index) => {
          const meta = insightMeta[insight.kind];
          const Icon = meta.icon;

          return (
            <motion.article
              className={cn('min-w-0 rounded-xl border p-3.5', meta.className)}
              initial={{ opacity: 0, y: 5 }}
              key={insight.id}
              transition={{ delay: index * 0.05, duration: 0.25 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn('grid size-7 place-items-center rounded-lg', meta.iconClassName)}
                >
                  <Icon aria-hidden="true" className="size-3.5" />
                </span>
                <p className="text-[10px] font-black text-[#636b77]">{insight.label}</p>
              </div>
              <h3 className="mt-2.5 text-[13px] font-black leading-5 text-foreground">
                {insight.title}
              </h3>
              <p className="mt-1 text-[11px] leading-5 text-[#626a75]">{insight.description}</p>
            </motion.article>
          );
        })}
      </div>

      <Link
        className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-xs font-extrabold text-primary outline-none hover:text-primary/75 focus-visible:ring-4 focus-visible:ring-ring/15 sm:hidden"
        to="/profile"
      >
        مشاهده تحلیل کامل
        <ArrowLeft aria-hidden="true" className="size-3.5" />
      </Link>
    </section>
  );
}
