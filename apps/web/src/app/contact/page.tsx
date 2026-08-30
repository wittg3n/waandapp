import type { Metadata } from 'next';
import {
  Bug,
  Handshake,
  HelpCircle,
  MessageCircleMore,
  MessageSquareText,
  Sparkles,
} from 'lucide-react';

import { Reveal, RevealGroup, RevealItem } from '@/components/landing/motion';
import { ContactForm } from '@/components/marketing/contact-form';
import { SectionHeading } from '@/components/marketing/section-heading';

const description =
  'برای پرسش درباره وآند، مشکلات حساب، همکاری یا ثبت بازخورد، موضوع را روشن و مستقیم با تیم وآند در میان بگذارید.';

export const metadata: Metadata = {
  title: 'تماس با وآند',
  description,
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'تماس با وآند',
    description,
    url: '/contact',
  },
};

const reasons = [
  { icon: HelpCircle, label: 'سوال درباره وآند' },
  { icon: Bug, label: 'مشکل حساب' },
  { icon: Handshake, label: 'همکاری' },
  { icon: MessageSquareText, label: 'بازخورد' },
] as const;

function ContactVisual() {
  return (
    <div className="relative mx-auto h-[390px] w-full max-w-[540px]" aria-hidden="true" dir="ltr">
      <span className="absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#e2e6ff]" />
      <span className="absolute left-1/2 top-1/2 size-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#cfd7ff]" />
      <span className="absolute left-1/2 top-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#eff2ff] blur-xl" />
      <div className="absolute left-1/2 top-1/2 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[28px] bg-[#143CFB] text-white shadow-[0_25px_65px_rgba(20,60,251,0.28)]">
        <MessageCircleMore className="size-11" strokeWidth={1.45} />
      </div>

      <div className="absolute left-2 top-12 w-[190px] rounded-[20px] border border-[#e6e7ec] bg-white p-4 shadow-[0_18px_50px_rgba(25,30,50,0.07)]">
        <span className="block h-2 w-[58%] rounded-full bg-[#d9dded]" />
        <span className="mt-3 block h-2 w-[82%] rounded-full bg-[#eceef5]" />
        <span className="mt-2 block h-2 w-[45%] rounded-full bg-[#eceef5]" />
      </div>

      <div className="absolute bottom-10 right-0 w-[210px] rounded-[20px] bg-[#111] p-5 text-white shadow-[0_22px_55px_rgba(0,0,0,0.14)]">
        <Sparkles className="size-5 text-[#8ea3ff]" />
        <span className="mt-5 block h-2 w-[76%] rounded-full bg-white/20" />
        <span className="mt-3 block h-2 w-[50%] rounded-full bg-white/10" />
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <main id="main-content">
      <section
        aria-labelledby="contact-title"
        className="section-shell grid min-h-[680px] items-center gap-10 py-[clamp(4rem,8vw,7rem)] lg:grid-cols-[.9fr_1.1fr] lg:gap-16"
      >
        <div className="text-center lg:text-right">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dfe4ff] bg-[#f6f7ff] px-4 py-2 text-[11px] font-bold text-[#143CFB]">
              <MessageCircleMore aria-hidden="true" className="size-4" />
              یک موضوع، یک مسیر روشن
            </span>
            <h1
              className="mt-6 text-[38px] leading-[1.5] font-black tracking-[-0.045em] text-[#151515] sm:text-[47px] lg:text-[54px]"
              id="contact-title"
            >
              موضوع را مستقیم
              <br />
              <span className="text-[#143CFB]">با ما در میان بگذارید.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[560px] text-[15px] leading-[2.1] text-[#67676e] lg:mx-0 lg:text-[16px]">
              برای پرسش درباره محصول، مسئله حساب، پیشنهاد همکاری یا بازخورد، از همان ابتدا زمینه
              پیام را مشخص کنید تا ادامه گفتگو دقیق‌تر باشد.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1} y={24}>
          <ContactVisual />
        </Reveal>
      </section>

      <section aria-label="موضوع‌های تماس" className="section-shell landing-section--compact pt-0">
        <RevealGroup
          className="grid border-y border-[#e6e6e8] sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.06}
        >
          {reasons.map(({ icon: Icon, label }) => (
            <RevealItem key={label}>
              <div className="flex min-h-24 items-center gap-3 border-b border-[#e6e6e8] px-4 text-[12px] font-bold text-[#505057] sm:border-b-0 sm:border-l last:border-l-0">
                <Icon aria-hidden="true" className="size-5 text-[#143CFB]" strokeWidth={1.6} />
                {label}
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section
        aria-labelledby="contact-form-title"
        className="section-shell landing-section grid gap-10 lg:grid-cols-[.66fr_1.34fr] lg:gap-16"
      >
        <Reveal>
          <SectionHeading
            description="اطلاعات ضروری را بنویسید؛ لازم نیست برای توضیح موضوع، مدارک یا داده‌های حساس حساب را داخل پیام قرار دهید."
            eyebrow="فرم تماس"
            id="contact-form-title"
            title="مختصر شروع کنید، دقیق ادامه می‌دهیم"
          />
          <div className="mt-8 rounded-[22px] bg-[#f5f5f3] p-6 text-[12px] leading-7 text-[#6b6b72]">
            <strong className="block text-[13px] text-[#2b2b2f]">یک نکته پیش از نوشتن</strong>
            برای مشکلات حساب، رمز عبور، کد تایید یا اطلاعات هویتی را در متن پیام وارد نکنید.
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="rounded-[28px] border border-[#e5e5e8] bg-[#fbfbfa] p-6 shadow-[0_20px_55px_rgba(26,28,38,0.05)] sm:p-8 lg:p-10">
            <ContactForm />
          </div>
        </Reveal>
      </section>
    </main>
  );
}
