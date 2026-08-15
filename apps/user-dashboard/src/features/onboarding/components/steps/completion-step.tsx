import { motion, useReducedMotion } from 'framer-motion';
import { CircleCheck } from 'lucide-react';

import { formatPercent } from '@/lib/format';

export function CompletionStep({ completion }: { completion: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="py-1 text-center sm:py-3">
      <motion.span
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
      >
        <CircleCheck aria-hidden="true" className="size-8" strokeWidth={1.8} />
      </motion.span>
      <h1
        className="mt-5 text-[27px] font-black tracking-tight text-foreground outline-none sm:text-[32px]"
        id="onboarding-step-title"
        tabIndex={-1}
      >
        پروفایل اولیه شما آماده شد
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-muted-foreground sm:text-[15px]">
        با این اطلاعات، وآند می‌تواند پیشنهادهای اولیه متناسب با شرایط و اهداف شما را آماده کند.
      </p>

      <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-primary/15 bg-primary/[0.045] p-4 text-right">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">تکمیل کلی پروفایل</p>
            <p className="mt-1 text-sm font-bold text-foreground">اطلاعات اولیه و اهداف اپلای</p>
          </div>
          <strong className="text-3xl font-black tabular-nums text-primary">
            {formatPercent(completion)}
          </strong>
        </div>
        <p className="mt-3 border-t border-primary/10 pt-3 text-xs leading-5 text-muted-foreground">
          این عدد میزان تکمیل کل پروفایل است، نه مراحل این راه‌اندازی.
        </p>
      </div>
    </div>
  );
}
