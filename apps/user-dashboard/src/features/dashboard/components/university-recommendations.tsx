import { motion } from 'framer-motion';
import { ArrowLeft, CalendarClock, Check, Info, MapPin, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { ProgramRecommendation } from '@/features/dashboard/types';
import { formatNumber, formatPercent } from '@/lib/format';

export function RecommendationPreview({
  recommendations,
}: {
  recommendations: readonly ProgramRecommendation[];
}) {
  if (recommendations.length === 0) return null;

  return (
    <section aria-labelledby="recommendations-title" className="min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold text-primary">فرصت‌های کشف‌شده توسط Waand</p>
          <h2
            className="mt-1 text-xl font-black text-foreground sm:text-[22px]"
            id="recommendations-title"
          >
            پیشنهادهای مناسب شما
          </h2>
        </div>
        <Link
          className="inline-flex min-h-11 items-center gap-1.5 self-start text-xs font-extrabold text-primary outline-none hover:text-primary/75 focus-visible:ring-4 focus-visible:ring-ring/15 sm:min-h-0 sm:self-auto"
          to="/universities"
        >
          مشاهده همه پیشنهادها
          <ArrowLeft aria-hidden="true" className="size-3.5" />
        </Link>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl bg-primary/[0.045] px-3.5 py-2.5 text-xs leading-5 text-[#51596a]">
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          این پیشنهادهای اولیه با اطلاعات فعلی شما پیدا شده‌اند؛ افزودن ریزنمرات، امتیاز تطابق را
          دقیق‌تر می‌کند.
        </p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 [&>*:last-child]:md:col-span-2 [&>*:last-child]:xl:col-span-1">
        {recommendations.slice(0, 3).map((recommendation) => (
          <motion.article
            className="group flex min-w-0 flex-col rounded-2xl border border-[#e3e7ed] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.025)] transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-[0_10px_28px_rgba(15,23,42,0.055)] sm:p-5"
            key={recommendation.id}
            transition={{ duration: 0.2 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-foreground" dir="auto">
                  {recommendation.university}
                </p>
                <p className="mt-1 truncate text-xs font-bold text-[#555d69]" dir="auto">
                  {recommendation.program}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin aria-hidden="true" className="size-3.5" />
                  {recommendation.country}
                </span>
              </div>
              <div className="shrink-0 rounded-xl bg-primary/[0.07] px-3 py-2 text-center text-primary">
                <p className="text-lg font-black leading-none">
                  {formatPercent(recommendation.matchScore)}
                </p>
                <p className="mt-1 text-[9px] font-black">تطابق</p>
              </div>
            </div>

            <ul className="mt-4 space-y-2 border-t border-[#edf0f3] pt-3">
              {recommendation.reasons.slice(0, 2).map((reason) => (
                <li
                  className="flex items-start gap-2 text-[11px] leading-5 text-[#59616d]"
                  key={reason}
                >
                  <span className="mt-1 grid size-4 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                    <Check aria-hidden="true" className="size-2.5" strokeWidth={2.5} />
                  </span>
                  {reason}
                </li>
              ))}
            </ul>

            {recommendation.warning && (
              <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-2.5 py-2 text-[10px] leading-4 text-amber-800">
                <TriangleAlert aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                {recommendation.warning}
              </p>
            )}

            <div className="mt-auto flex items-center justify-between gap-3 pt-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#5d6571]">
                <CalendarClock aria-hidden="true" className="size-3.5 text-primary" />
                {formatNumber(recommendation.deadlineDays)} روز تا ددلاین
              </span>
              <Link
                className="inline-flex min-h-11 items-center gap-1 text-xs font-black text-primary outline-none transition-colors hover:text-primary/75 focus-visible:ring-4 focus-visible:ring-ring/15 sm:min-h-0"
                to={recommendation.href}
              >
                مشاهده برنامه
                <ArrowLeft
                  aria-hidden="true"
                  className="size-3.5 transition-transform group-hover:-translate-x-0.5"
                />
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
