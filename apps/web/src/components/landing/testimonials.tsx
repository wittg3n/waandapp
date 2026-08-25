'use client';

import { Quote, Star } from 'lucide-react';

import {
  Reveal,
  TestimonialMarquee,
  TestimonialMotionCard,
  TestimonialsScene,
} from '@/components/landing/motion';
import { cn } from '@/lib/utils';

type Testimonial = {
  name: string;
  meta: string;
  quote: string;
  initials: string;
  tone: 'white' | 'blue' | 'warm' | 'dark';
};

/*
 * Demo data.
 *
 * Replace these with your verified production testimonials.
 * The first one follows the testimonial already present in
 * your original Waand landing-page design.
 */
const testimonials: Testimonial[] = [
  {
    name: 'نیما محمدی',
    initials: 'نم',
    meta: 'پذیرفته‌شده در آلمان · مهندسی کامپیوتر',
    quote:
      'وآند واقعاً فرآیند اپلای را برای من ساده کرد. از انتخاب دانشگاه‌ها تا مدیریت مدارک، همه چیز منظم و قابل پیگیری بود.',
    tone: 'blue',
  },
  {
    name: 'سارا احمدی',
    initials: 'سا',
    meta: 'اپلای فرانسه · معماری',
    quote:
      'قبلاً بین ددلاین‌ها و مدارک مختلف سردرگم می‌شدم. داشتن همه مراحل در یک داشبورد باعث شد دقیق‌تر جلو بروم.',
    tone: 'white',
  },
  {
    name: 'امیر رضایی',
    initials: 'ار',
    meta: 'اپلای کانادا · علوم داده',
    quote:
      'پیشنهاد دانشگاه‌ها بر اساس پروفایل من باعث شد گزینه‌هایی را ببینم که در جست‌وجوی شخصی خودم پیدا نکرده بودم.',
    tone: 'warm',
  },
  {
    name: 'مهسا کریمی',
    initials: 'مک',
    meta: 'اپلای ایتالیا · طراحی',
    quote:
      'چیزی که برای من مهم بود این بود که بدانم در هر مرحله دقیقاً چه کاری باید انجام بدهم و چه چیزی هنوز ناقص است.',
    tone: 'dark',
  },
  {
    name: 'علی موسوی',
    initials: 'عم',
    meta: 'اپلای آمریکا · مهندسی برق',
    quote:
      'تحلیل مدارک قبل از شروع درخواست‌ها کمک کرد مشکلات پرونده‌ام را زودتر پیدا کنم و برایشان برنامه داشته باشم.',
    tone: 'white',
  },
  {
    name: 'ترانه حسینی',
    initials: 'تح',
    meta: 'اپلای آلمان · مدیریت',
    quote:
      'مدیریت ددلاین‌ها برای چند دانشگاه همیشه سخت بود. وآند کل مسیر را بسیار شفاف‌تر و قابل کنترل‌تر کرد.',
    tone: 'blue',
  },
];

const firstLane = testimonials.slice(0, 3);
const secondLane = testimonials.slice(3);

const toneStyles = {
  white: 'border-[#e8e9ef] bg-white text-[#171717] shadow-[0_16px_45px_rgba(25,31,55,0.055)]',

  blue: 'border-[#dfe4ff] bg-[#f2f4ff] text-[#171717] shadow-[0_18px_50px_rgba(20,60,251,0.065)]',

  warm: 'border-[#f3e2cf] bg-[#fff5e9] text-[#171717] shadow-[0_18px_48px_rgba(135,88,42,0.06)]',

  dark: 'border-[#202020] bg-[#171717] text-white shadow-[0_20px_55px_rgba(0,0,0,0.14)]',
} as const;

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  const dark = testimonial.tone === 'dark';

  return (
    <TestimonialMotionCard
      className="
        w-[310px]
        sm:w-[350px]
        lg:w-[390px]
      "
      index={index}
    >
      <article
        className={cn(
          `
            group
            relative
            flex
            min-h-[230px]
            h-full
            flex-col
            overflow-hidden
            rounded-[24px]
            border
            px-6
            py-6
            text-right
            transition-[border-color,box-shadow]
            duration-300
            sm:min-h-[245px]
            sm:px-7
            sm:py-7
          `,
          toneStyles[testimonial.tone],
        )}
        dir="rtl"
      >
        {/* ------------------------------------------------------------- */}
        {/* Decorative quote                                              */}
        {/* ------------------------------------------------------------- */}

        <Quote
          aria-hidden="true"
          className={cn(
            `
              absolute
              left-5
              top-5
              size-12
              -rotate-6
              transition-transform
              duration-500
              group-hover:-rotate-12
              group-hover:scale-110
            `,
            dark ? 'text-white/[0.06]' : 'text-[#143CFB]/[0.07]',
          )}
          fill="currentColor"
          strokeWidth={0}
        />

        {/* ------------------------------------------------------------- */}
        {/* Rating                                                        */}
        {/* ------------------------------------------------------------- */}

        <div aria-label="۵ از ۵ ستاره" className="relative z-10 flex gap-1">
          {Array.from({ length: 5 }).map((_, star) => (
            <Star
              aria-hidden="true"
              className={cn(
                'size-3.5',
                dark ? 'fill-[#f8c453] text-[#f8c453]' : 'fill-[#eaaa35] text-[#eaaa35]',
              )}
              key={star}
              strokeWidth={1.5}
            />
          ))}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Quote                                                         */}
        {/* ------------------------------------------------------------- */}

        <blockquote
          className={cn(
            `
              relative
              z-10
              mt-5
              text-[13px]
              font-medium
              leading-[2]
              sm:text-[14px]
            `,
            dark ? 'text-white/82' : 'text-[#3f424a]',
          )}
        >
          «{testimonial.quote}»
        </blockquote>

        {/* ------------------------------------------------------------- */}
        {/* Person                                                        */}
        {/* ------------------------------------------------------------- */}

        <footer className="relative z-10 mt-auto flex items-center gap-3 pt-6">
          <span
            className={cn(
              `
                grid
                size-10
                shrink-0
                place-items-center
                rounded-full
                text-[11px]
                font-black
              `,
              dark ? 'bg-white text-[#171717]' : 'bg-[#143CFB] text-white',
            )}
          >
            {testimonial.initials}
          </span>

          <span className="min-w-0">
            <strong
              className={cn('block text-[12px] font-black', dark ? 'text-white' : 'text-[#202126]')}
            >
              {testimonial.name}
            </strong>

            <small
              className={cn(
                'mt-1 block text-[9px] leading-5',
                dark ? 'text-white/45' : 'text-[#81848c]',
              )}
            >
              {testimonial.meta}
            </small>
          </span>
        </footer>

        {/* ------------------------------------------------------------- */}
        {/* Hover signal                                                  */}
        {/* ------------------------------------------------------------- */}

        <span
          aria-hidden="true"
          className={cn(
            `
              absolute
              inset-x-8
              bottom-0
              h-px
              origin-right
              scale-x-0
              transition-transform
              duration-500
              group-hover:scale-x-100
            `,
            dark ? 'bg-white/30' : 'bg-[#143CFB]/35',
          )}
        />
      </article>
    </TestimonialMotionCard>
  );
}

export function Testimonials() {
  return (
    <section
      aria-labelledby="testimonials-title"
      className="
        landing-section
        scroll-mt-24
        overflow-hidden
        py-20
        sm:py-24
        lg:py-28
      "
      id="testimonials"
    >
      <TestimonialsScene className="relative">
        {/* -------------------------------------------------------------- */}
        {/* Heading                                                        */}
        {/* -------------------------------------------------------------- */}

        <div className="section-shell">
          <Reveal>
            <div className="mx-auto max-w-[650px] text-center">
              <span
                className="
                  mb-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-[#dfe4ff]
                  bg-[#f6f7ff]
                  px-4
                  py-2
                  text-[10px]
                  font-bold
                  text-[#143CFB]
                "
              >
                تجربه واقعی مسیر اپلای
                <span className="size-1.5 rounded-full bg-[#143CFB]" />
              </span>

              <h2
                className="
                  text-[30px]
                  font-black
                  leading-[1.55]
                  tracking-[-0.04em]
                  text-[#171717]
                  sm:text-[36px]
                  lg:text-[42px]
                "
                id="testimonials-title"
              >
                دانشجویان ما می‌گویند
              </h2>

              <p
                className="
                  mx-auto
                  mt-4
                  max-w-[520px]
                  text-[13px]
                  leading-7
                  text-[#73767e]
                  sm:text-[14px]
                "
              >
                تجربه دانشجویانی که مسیر اپلای خود را ساده‌تر، منظم‌تر و هوشمندانه‌تر مدیریت
                کرده‌اند.
              </p>
            </div>
          </Reveal>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Marquee canvas                                                 */}
        {/* -------------------------------------------------------------- */}

        <div
          className="
            relative
            mt-11
            space-y-4
            sm:mt-14
            sm:space-y-5
          "
        >
          {/* subtle background atmosphere */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              h-[420px]
              w-[820px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-[radial-gradient(circle,rgba(20,60,251,0.06)_0%,rgba(20,60,251,0.018)_45%,transparent_72%)]
              blur-3xl
            "
          />

          {/* lane 1 */}

          <TestimonialMarquee baseVelocity={31} direction="left" lane={0}>
            {firstLane.map((testimonial, index) => (
              <TestimonialCard index={index} key={testimonial.name} testimonial={testimonial} />
            ))}
          </TestimonialMarquee>

          {/* lane 2 */}

          <TestimonialMarquee baseVelocity={24} direction="right" lane={1}>
            {secondLane.map((testimonial, index) => (
              <TestimonialCard
                index={index + firstLane.length}
                key={testimonial.name}
                testimonial={testimonial}
              />
            ))}
          </TestimonialMarquee>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Supporting metric                                              */}
        {/* -------------------------------------------------------------- */}

        <Reveal delay={0.08}>
          <div className="section-shell mt-11">
            <div
              className="
                mx-auto
                flex
                w-fit
                items-center
                gap-3
                rounded-full
                border
                border-black/[0.055]
                bg-white/80
                px-5
                py-2.5
                text-[10px]
                text-[#747780]
                shadow-[0_8px_28px_rgba(30,36,65,0.04)]
                backdrop-blur-md
              "
            >
              <span className="flex -space-x-2" dir="ltr">
                {['ن', 'س', 'م', 'ع'].map((letter, index) => (
                  <span
                    className="
                      grid
                      size-7
                      place-items-center
                      rounded-full
                      border-2
                      border-white
                      bg-[#e7eaff]
                      text-[8px]
                      font-black
                      text-[#143CFB]
                    "
                    key={`${letter}-${index}`}
                  >
                    {letter}
                  </span>
                ))}
              </span>

              <span>تجربه دانشجویان، بخشی از مسیر ساخت وآند</span>
            </div>
          </div>
        </Reveal>
      </TestimonialsScene>
    </section>
  );
}
