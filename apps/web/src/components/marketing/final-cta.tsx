import { ArrowLeft, FileCheck2, GraduationCap, Sparkles } from 'lucide-react';

import { MotionLink, Reveal } from '@/components/landing/motion';
import { buttonVariants } from '@/components/ui/button';
import { DASHBOARD_SIGNUP_URL } from '@/lib/public-routes';

export function MarketingFinalCta({
  description,
  secondaryHref = '/how-it-works',
  secondaryLabel = 'دیدن نحوه کار',
  title,
}: {
  description: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  title: string;
}) {
  return (
    <section aria-label="شروع کار با وآند" className="section-shell landing-section--compact">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[30px] bg-[#111] px-7 py-10 text-white shadow-[0_24px_70px_rgba(0,0,0,0.12)] sm:px-10 lg:grid lg:min-h-[330px] lg:grid-cols-[1fr_.9fr] lg:items-center lg:px-14 lg:py-12">
          <div className="relative z-10 max-w-[590px] text-center lg:text-right">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold text-white/55">
              <Sparkles aria-hidden="true" className="size-4 text-[#7f98ff]" />
              قدم بعدی، روشن و قابل پیگیری
            </span>
            <h2 className="mt-5 text-[28px] leading-[1.65] font-black tracking-[-0.035em] sm:text-[34px]">
              {title}
            </h2>
            <p className="mt-4 text-[14px] leading-8 text-white/60 sm:text-[15px]">{description}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
              <MotionLink
                className={buttonVariants({
                  className: 'min-w-36 bg-white text-[#171717] shadow-none hover:bg-[#f0f0ed]',
                  variant: 'secondary',
                })}
                href={DASHBOARD_SIGNUP_URL}
              >
                شروع رایگان
                <ArrowLeft aria-hidden="true" className="size-4" />
              </MotionLink>
              <MotionLink
                className={buttonVariants({
                  className:
                    'border-white/15 bg-white/[0.06] text-white shadow-none hover:bg-white/[0.1]',
                  variant: 'secondary',
                })}
                href={secondaryHref}
              >
                {secondaryLabel}
              </MotionLink>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="relative mx-auto mt-10 h-[150px] w-full max-w-[460px] lg:mt-0 lg:h-[220px]"
            dir="ltr"
          >
            <div className="absolute inset-x-5 top-1/2 h-px bg-gradient-to-r from-transparent via-[#5574ff] to-transparent" />
            <div className="absolute left-[12%] top-1/2 grid size-16 -translate-y-1/2 place-items-center rounded-[18px] border border-white/10 bg-white/[0.07] shadow-[0_16px_45px_rgba(0,0,0,0.2)]">
              <FileCheck2 className="size-7 text-[#aebdff]" strokeWidth={1.5} />
            </div>
            <div className="absolute left-1/2 top-1/2 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#143CFB] shadow-[0_0_0_9px_rgba(20,60,251,0.13),0_0_38px_rgba(20,60,251,0.65)]">
              <Sparkles className="size-4 text-white" />
            </div>
            <div className="absolute right-[10%] top-1/2 grid size-20 -translate-y-1/2 place-items-center rounded-[22px] border border-[#5d78ff]/25 bg-[#1b2451] shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
              <GraduationCap className="size-9 text-white" strokeWidth={1.4} />
            </div>
          </div>

          <span className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-[#143CFB]/15 blur-3xl" />
        </div>
      </Reveal>
    </section>
  );
}
