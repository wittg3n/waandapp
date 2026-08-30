import { ArrowDown, FileText, GraduationCap, Sparkles, UserRound } from 'lucide-react';

import { Reveal } from '@/components/landing/motion';
import { MarketingFinalCta } from '@/components/marketing/final-cta';
import { HowItWorksJourney } from '@/components/marketing/how-it-works-journey';

function JourneyMap() {
  const points = [
    { icon: UserRound, label: 'پروفایل', x: '8%', y: '66%' },
    { icon: Sparkles, label: 'تحلیل', x: '34%', y: '30%' },
    { icon: GraduationCap, label: 'گزینه‌ها', x: '64%', y: '56%' },
    { icon: FileText, label: 'درخواست', x: '88%', y: '22%' },
  ] as const;

  return (
    <div aria-hidden="true" className="relative mx-auto h-[380px] w-full max-w-[570px]" dir="ltr">
      <svg className="absolute inset-0 size-full" fill="none" viewBox="0 0 570 380">
        <path
          d="M48 278 C126 286 124 104 196 112 C276 120 278 244 362 226 C428 212 440 92 518 88"
          stroke="#e1e4f0"
          strokeLinecap="round"
          strokeWidth="12"
        />
        <path
          d="M48 278 C126 286 124 104 196 112 C276 120 278 244 362 226 C428 212 440 92 518 88"
          stroke="#143CFB"
          strokeDasharray="8 12"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
      {points.map(({ icon: Icon, label, x, y }, index) => (
        <div
          className={
            index === 3
              ? 'absolute grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[24px] bg-[#111] text-white shadow-[0_20px_50px_rgba(0,0,0,0.16)]'
              : 'absolute grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[20px] border border-[#dfe3f5] bg-white text-[#143CFB] shadow-[0_16px_40px_rgba(25,32,62,0.07)]'
          }
          key={label}
          style={{ left: x, top: y }}
        >
          <Icon className="size-7" strokeWidth={1.5} />
          <span className="absolute top-[calc(100%+8px)] whitespace-nowrap text-[9px] font-bold text-[#777a84]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function HowItWorksSection({ page = false }: { page?: boolean }) {
  const Heading = page ? 'h1' : 'h2';

  return (
    <section aria-labelledby="how-it-works-section-title" id="how-it-works-details">
      <div className="section-shell grid min-h-[720px] items-center gap-12 py-[clamp(4rem,8vw,7rem)] lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
        <div className="text-center lg:text-right">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dfe4ff] bg-[#f6f7ff] px-4 py-2 text-[11px] font-bold text-[#143CFB]">
              <Sparkles aria-hidden="true" className="size-4" />
              از اطلاعات تا اقدام
            </span>
            <Heading
              className="mt-6 text-[38px] leading-[1.5] font-black tracking-[-0.045em] text-[#151515] sm:text-[47px] lg:text-[54px]"
              id="how-it-works-section-title"
            >
              یک مسیر روشن،
              <br />
              <span className="text-[#143CFB]">از شما تا درخواست.</span>
            </Heading>
            <p className="mx-auto mt-6 max-w-[570px] text-[15px] leading-[2.1] text-[#67676e] lg:mx-0 lg:text-[16px]">
              وآند اطلاعات اولیه را به تحلیل، انتخاب و کارهای قابل پیگیری تبدیل می‌کند؛ هر مرحله
              نتیجه مرحله قبل را در زمینه درست جلو می‌برد.
            </p>
            <a
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#e2e3e7] bg-white px-5 text-[12px] font-bold text-[#45464d] shadow-[0_6px_18px_rgba(0,0,0,0.035)] transition-colors hover:border-[#cfd5f7] hover:text-[#143CFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#143CFB]"
              href="#journey-title"
            >
              دیدن مرحله‌ها
              <ArrowDown aria-hidden="true" className="size-4" />
            </a>
          </Reveal>
        </div>
        <Reveal delay={0.1} y={24}>
          <JourneyMap />
        </Reveal>
      </div>

      <HowItWorksJourney />

      <MarketingFinalCta
        description="با ساخت پروفایل اولیه، زمینه لازم برای تحلیل و برنامه‌ریزی مسیرتان را یکجا آماده کنید."
        secondaryHref="/#pricing"
        secondaryLabel="دیدن قیمت‌گذاری"
        title="قدم اول، ساختن تصویر کامل از شرایط شماست."
      />
    </section>
  );
}
