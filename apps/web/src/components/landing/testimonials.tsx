'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    name: 'نیما محمدی',
    program: 'پذیرفته‌شده کارشناسی ارشد مهندسی کامپیوتر',
    quote:
      'واند تمام فرآیند اپلای را برای من ساده کرد؛ از انتخاب دانشگاه‌ها تا ارسال مدارک، همه‌چیز منظم و سریع انجام شد.',
  },
  {
    name: 'سارا یوسفی',
    program: 'دانشجوی کارشناسی ارشد مدیریت',
    quote:
      'پیشنهادهای شخصی‌سازی‌شده واند کمک کرد زمانم را روی دانشگاه‌هایی بگذارم که واقعاً با سوابق من هم‌خوانی داشتند.',
  },
  {
    name: 'آرمان رستگار',
    program: 'پذیرفته‌شده علوم داده',
    quote:
      'وضعیت هر درخواست را یک‌جا می‌دیدم و هیچ مرحله یا مدرکی جا نمی‌ماند. برای اولین بار اپلای واقعاً قابل مدیریت شد.',
  },
] as const;

function StudentPortrait({
  className,
  variant,
}: {
  className?: string;
  variant: 'mint' | 'peach';
}) {
  const mint = variant === 'mint';

  return (
    <svg aria-hidden="true" className={cn('size-full', className)} viewBox="0 0 120 120">
      <circle cx="60" cy="60" fill={mint ? '#b9ead3' : '#f5d2b3'} r="60" />
      <path d="M21 121c4-28 20-43 39-43s35 15 39 43" fill={mint ? '#0d7257' : '#5c3022'} />
      <ellipse cx="60" cy="53" fill={mint ? '#e8b38c' : '#d99a6c'} rx="25" ry="30" />
      <path
        d={
          mint
            ? 'M36 50c0-25 14-35 28-35 18 0 28 14 25 35-6-9-14-15-26-16-7 8-16 13-27 16Z'
            : 'M34 56c-4-28 10-42 28-42 22 0 33 18 28 46-5-13-15-24-30-28-8 10-16 18-26 24Z'
        }
        fill={mint ? '#24201f' : '#6e3d25'}
      />
      {!mint && <path d="M33 48c-7 18-2 36 7 45-2-18 2-34 12-48Z" fill="#6e3d25" />}
      <circle cx="51" cy="55" fill="#312622" r="2" />
      <circle cx="70" cy="55" fill="#312622" r="2" />
      <path
        d="M53 67c5 4 10 4 15 0"
        fill="none"
        stroke="#8a5042"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const testimonial = testimonials[index] ?? testimonials[0];

  const move = (direction: number) => {
    setIndex((current) => (current + direction + testimonials.length) % testimonials.length);
  };

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      aria-labelledby="testimonials-title"
      className="section-shell landing-section scroll-mt-24"
      id="testimonials"
      transition={reducedMotion ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ amount: 0.15, once: true }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <h2 className="section-title text-center" id="testimonials-title">
        دانشجویان ما می‌گویند
      </h2>

      <div
        className="relative mt-6 grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16"
        dir="ltr"
      >
        <div
          className="relative order-2 mx-auto flex min-h-32 w-full max-w-[480px] items-center justify-center sm:min-h-40 lg:order-1"
          dir="rtl"
        >
          <div className="avatar-orbit -ml-4 size-24 overflow-hidden rounded-full border-4 border-white shadow-sm sm:size-36">
            <StudentPortrait variant="mint" />
          </div>
          <div className="avatar-orbit z-10 -ml-4 grid size-32 place-items-center rounded-full border-4 border-white bg-[#d8d5ff] text-center shadow-sm sm:size-44">
            <div>
              <strong className="block text-3xl font-extrabold text-[#171717]">+۱۲۰۰</strong>
              <span className="mt-1 block text-xs text-[#58585e]">دانشجوی راضی</span>
            </div>
          </div>
          <div className="avatar-orbit size-24 overflow-hidden rounded-full border-4 border-white shadow-sm sm:size-36">
            <StudentPortrait variant="peach" />
          </div>
        </div>

        <div
          className="order-1 min-h-44 text-center lg:order-2 lg:text-right"
          aria-live="polite"
          dir="rtl"
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.figure
              key={testimonial.name}
              initial={reducedMotion ? false : { opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reducedMotion ? {} : { opacity: 0, x: -10 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.24 }}
            >
              <figcaption>
                <strong className="text-xl font-extrabold text-[#181818]">
                  {testimonial.name}
                </strong>
                <span className="mt-1 block text-sm text-[#66666d]">{testimonial.program}</span>
              </figcaption>
              <blockquote className="mt-4 max-w-xl text-[15px] leading-8 text-[#5d5d63]">
                «{testimonial.quote}»
              </blockquote>
              <div
                aria-label="امتیاز ۵ از ۵"
                className="mt-4 flex justify-center gap-1 text-[#f5ae00] lg:justify-start"
                role="img"
              >
                {Array.from({ length: 5 }).map((_, star) => (
                  <Star aria-hidden="true" className="size-4 fill-current" key={star} />
                ))}
              </div>
            </motion.figure>
          </AnimatePresence>
        </div>

        <Button
          aria-label="نظر قبلی"
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border-[#ececec] bg-white text-[#252525] shadow-none"
          onClick={() => move(-1)}
          size="icon"
          variant="secondary"
        >
          <ChevronLeft
            aria-hidden="true"
            className="size-5 transition-transform duration-200 motion-safe:group-hover/button:-translate-x-0.5 motion-reduce:transition-none"
          />
        </Button>
        <Button
          aria-label="نظر بعدی"
          className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border-[#ececec] bg-white text-[#252525] shadow-none"
          onClick={() => move(1)}
          size="icon"
          variant="secondary"
        >
          <ChevronRight
            aria-hidden="true"
            className="size-5 transition-transform duration-200 motion-safe:group-hover/button:translate-x-0.5 motion-reduce:transition-none"
          />
        </Button>
      </div>
    </motion.section>
  );
}
