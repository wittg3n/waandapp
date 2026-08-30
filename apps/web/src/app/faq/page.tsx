import type { Metadata } from 'next';
import { BookOpenText, HelpCircle, MessageCircleQuestion, Search } from 'lucide-react';

import { Reveal } from '@/components/landing/motion';
import { MarketingFinalCta } from '@/components/marketing/final-cta';
import { faqCategories } from '@/lib/faq';

const description =
  'پاسخ روشن به پرسش‌های متداول درباره وآند، حساب کاربری، تحلیل و پیشنهاد دانشگاه، مراحل اپلای، قیمت‌گذاری و امنیت اطلاعات.';

export const metadata: Metadata = {
  title: 'سوالات متداول',
  description,
  alternates: { canonical: '/faq' },
  openGraph: { title: 'سوالات متداول وآند', description, url: '/faq' },
};

function FaqOpeningVisual() {
  return (
    <div aria-hidden="true" className="relative mx-auto h-[360px] max-w-[520px]" dir="ltr">
      <span className="absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#cfd7ff]" />
      <div className="absolute left-1/2 top-1/2 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[28px] bg-[#143CFB] text-white shadow-[0_24px_65px_rgba(20,60,251,0.26)]">
        <MessageCircleQuestion className="size-11" strokeWidth={1.45} />
      </div>
      <div className="absolute left-2 top-8 flex w-[190px] items-center gap-3 rounded-[18px] border border-[#e6e7eb] bg-white p-4 shadow-[0_18px_45px_rgba(28,32,48,0.07)]">
        <HelpCircle className="size-5 text-[#143CFB]" />
        <span className="h-2 flex-1 rounded-full bg-[#e5e7ef]" />
      </div>
      <div className="absolute bottom-10 right-0 flex w-[205px] items-center gap-3 rounded-[18px] bg-[#111] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.16)]">
        <Search className="size-5 text-[#91a5ff]" />
        <span className="h-2 flex-1 rounded-full bg-white/15" />
      </div>
      <BookOpenText
        className="absolute bottom-5 left-1/2 size-7 -translate-x-1/2 text-[#9ca8d6]"
        strokeWidth={1.4}
      />
    </div>
  );
}

export default function FaqPage() {
  return (
    <main id="main-content">
      <section
        aria-labelledby="faq-title"
        className="section-shell grid min-h-[650px] items-center gap-10 py-[clamp(4rem,8vw,7rem)] lg:grid-cols-[.9fr_1.1fr] lg:gap-16"
      >
        <div className="text-center lg:text-right">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dfe4ff] bg-[#f6f7ff] px-4 py-2 text-[11px] font-bold text-[#143CFB]">
              <HelpCircle aria-hidden="true" className="size-4" />
              پاسخ کوتاه، مسیر روشن
            </span>
            <h1
              className="mt-6 text-[38px] leading-[1.5] font-black tracking-[-0.045em] text-[#151515] sm:text-[47px] lg:text-[54px]"
              id="faq-title"
            >
              سوال خوب،
              <br />
              <span className="text-[#143CFB]">ابهام کمتری می‌سازد.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[570px] text-[15px] leading-[2.1] text-[#67676e] lg:mx-0 lg:text-[16px]">
              پاسخ‌های این صفحه روی چیزهایی متمرکزند که برای شروع و برنامه‌ریزی مسیر اپلای باید
              بدانید؛ بدون وعده یا جزئیات تجاری تاییدنشده.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.1} y={24}>
          <FaqOpeningVisual />
        </Reveal>
      </section>

      <nav aria-label="دسته‌بندی سوالات" className="section-shell pb-6">
        <Reveal className="flex flex-wrap justify-center gap-2 border-y border-[#e8e8ea] py-5">
          {faqCategories.map((category) => (
            <a
              className="rounded-full px-4 py-2 text-[11px] font-bold text-[#5f6067] transition-colors hover:bg-[#f3f5ff] hover:text-[#143CFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#143CFB]"
              href={`#${category.id}`}
              key={category.id}
            >
              {category.title}
            </a>
          ))}
        </Reveal>
      </nav>

      <div className="section-shell landing-section--compact grid gap-16">
        {faqCategories.map((category, categoryIndex) => (
          <section
            aria-labelledby={`${category.id}-title`}
            className="scroll-mt-28 grid gap-8 lg:grid-cols-[.34fr_.66fr] lg:gap-14"
            id={category.id}
            key={category.id}
          >
            <Reveal>
              <div className="lg:sticky lg:top-32">
                <span className="font-mono text-[11px] font-bold text-[#143CFB]">
                  0{categoryIndex + 1}
                </span>
                <h2
                  className="mt-3 text-[24px] leading-9 font-black text-[#27272b]"
                  id={`${category.id}-title`}
                >
                  {category.title}
                </h2>
              </div>
            </Reveal>
            <Reveal className="divide-y divide-[#e7e7ea] border-y border-[#e7e7ea]">
              {category.questions.map((item) => (
                <details className="group scroll-mt-32 py-1" id={item.id} key={item.id}>
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 rounded-xl px-3 text-[14px] font-black text-[#303035] transition-colors hover:bg-[#f7f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#143CFB] sm:text-[15px]">
                    <span className="flex-1">{item.question}</span>
                    <span className="text-xl font-light text-[#143CFB] transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="px-3 pb-6 pt-2 text-[13px] leading-8 text-[#6f7077]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </Reveal>
          </section>
        ))}
      </div>

      <MarketingFinalCta
        description="اگر پاسخ موضوع شما اینجا نیست، زمینه مسئله را مشخص کنید تا مسیر ادامه گفتگو روشن باشد."
        secondaryHref="/contact"
        secondaryLabel="تماس با ما"
        title="پاسخ را پیدا نکردید؟ موضوع را مستقیم مطرح کنید."
      />
    </main>
  );
}
