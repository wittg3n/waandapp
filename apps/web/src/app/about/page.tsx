import type { Metadata } from 'next';
import {
  ArrowLeft,
  CalendarClock,
  Compass,
  FileText,
  GitCompareArrows,
  GraduationCap,
  Search,
  Sparkles,
  Waypoints,
} from 'lucide-react';

import { Float, Reveal, RevealGroup, RevealItem } from '@/components/landing/motion';
import { MarketingFinalCta } from '@/components/marketing/final-cta';
import { SectionHeading } from '@/components/marketing/section-heading';
import { WaandLogo } from '@/components/ui/waand-logo';

const description =
  'وآند برای تبدیل مسیر پراکنده و پرابهام اپلای به یک سیستم روشن برای تحلیل، تصمیم‌گیری و مدیریت درخواست‌ها ساخته می‌شود.';

export const metadata: Metadata = {
  title: 'درباره وآند',
  description,
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'درباره وآند',
    description,
    url: '/about',
  },
};

const fragments = [
  { icon: Search, label: 'اطلاعات متناقض', position: 'right-0 top-2 rotate-[3deg]' },
  { icon: CalendarClock, label: 'ددلاین‌های جدا', position: 'left-1 top-16 -rotate-[4deg]' },
  { icon: FileText, label: 'مدارک پراکنده', position: 'right-4 bottom-10 -rotate-[2deg]' },
  { icon: GitCompareArrows, label: 'انتخاب‌های زیاد', position: 'left-0 bottom-3 rotate-[3deg]' },
] as const;

function FragmentationVisual() {
  return (
    <div
      className="relative mx-auto h-[400px] w-full max-w-[560px] sm:h-[500px]"
      aria-hidden="true"
    >
      <svg className="absolute inset-0 size-full" fill="none" viewBox="0 0 560 500">
        <path
          d="M472 72 C390 116 385 182 292 236 C202 289 157 337 90 416"
          stroke="#d8defa"
          strokeDasharray="7 10"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M92 119 C177 146 204 201 284 238 C369 277 401 331 469 404"
          stroke="#e2e4eb"
          strokeDasharray="4 9"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M280 28 C267 113 286 164 284 238 C282 320 299 383 280 472"
          stroke="#f1d9c2"
          strokeDasharray="5 10"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>

      {fragments.map(({ icon: Icon, label, position }) => (
        <div
          className={`absolute ${position} flex min-h-20 w-[170px] items-center gap-3 rounded-[18px] border border-[#e8e9ee] bg-white px-4 text-[12px] font-bold text-[#54565d] shadow-[0_18px_45px_rgba(32,35,48,0.07)] sm:w-[190px]`}
          key={label}
        >
          <Icon className="size-5 shrink-0 text-[#6d75a0]" strokeWidth={1.6} />
          {label}
        </div>
      ))}

      <Float className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="grid size-32 place-items-center rounded-[30px] border border-[#ced7ff] bg-[#f6f7ff] shadow-[0_25px_70px_rgba(20,60,251,0.14)] sm:size-40">
          <WaandLogo
            className="flex-col gap-3"
            markClassName="size-14 sm:size-16"
            wordmarkClassName="text-[22px] sm:text-[26px]"
          />
        </div>
      </Float>
    </div>
  );
}

const principles = [
  {
    number: '۰۱',
    title: 'روش، جای حدس را می‌گیرد',
    description:
      'هر پیشنهاد باید از اطلاعات واقعی پروفایل، هدف تحصیلی و الزامات مسیر شکل بگیرد؛ نه از فهرست‌های عمومی و نسخه‌های یکسان.',
  },
  {
    number: '۰۲',
    title: 'تصمیم باید قابل فهم باشد',
    description:
      'کاربر باید بداند چرا یک گزینه مناسب‌تر است، چه چیزی هنوز نامشخص مانده و قدم بعدی دقیقاً چیست.',
  },
  {
    number: '۰۳',
    title: 'کنترل در دست کاربر می‌ماند',
    description:
      'وآند مسیر را تحلیل و منظم می‌کند؛ انتخاب نهایی دانشگاه، اولویت‌ها و زمان اقدام همچنان تصمیم خود کاربر است.',
  },
] as const;

export default function AboutPage() {
  return (
    <main id="main-content">
      <section
        aria-labelledby="about-title"
        className="section-shell grid min-h-[720px] items-center gap-10 py-[clamp(4rem,8vw,7rem)] lg:grid-cols-[.92fr_1.08fr] lg:gap-16"
      >
        <div className="text-center lg:text-right">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dfe4ff] bg-[#f6f7ff] px-4 py-2 text-[11px] font-bold text-[#143CFB]">
              <Compass aria-hidden="true" className="size-4" />
              چرا وآند وجود دارد؟
            </span>
            <h1
              className="mt-6 text-[38px] leading-[1.5] font-black tracking-[-0.045em] text-[#151515] sm:text-[47px] lg:text-[54px]"
              id="about-title"
            >
              اپلای بیش از حد
              <br />
              <span className="text-[#143CFB]">پراکنده شده است.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[570px] text-[15px] leading-[2.1] text-[#67676e] lg:mx-0 lg:text-[16px]">
              اطلاعات در چندین منبع، مدارک در چند پوشه و تصمیم‌ها میان ده‌ها گزینه پخش شده‌اند. وآند
              این تکه‌ها را به یک مسیر تحلیل‌پذیر و قابل پیگیری تبدیل می‌کند.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.12} y={24}>
          <FragmentationVisual />
        </Reveal>
      </section>

      <section
        aria-labelledby="problem-title"
        className="wide-shell landing-section--compact overflow-hidden rounded-[30px] bg-[#111] text-white"
      >
        <div className="grid gap-10 px-7 py-12 sm:px-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:px-16 lg:py-16">
          <Reveal>
            <span className="text-[11px] font-bold text-[#8ea3ff]">مسئله، کمبود اطلاعات نیست</span>
            <h2
              className="mt-5 max-w-[700px] text-[30px] leading-[1.7] font-black tracking-[-0.035em] sm:text-[38px]"
              id="problem-title"
            >
              مسئله این است که اطلاعات، تصمیم و اجرا در یک جای منسجم به هم وصل نیستند.
            </h2>
          </Reveal>

          <RevealGroup className="grid border-y border-white/10" stagger={0.06}>
            {[
              'نیازمندی‌های دانشگاه',
              'ددلاین‌ها و اولویت‌ها',
              'نسخه‌های مختلف مدارک',
              'مقایسه و انتخاب نهایی',
            ].map((item, index) => (
              <RevealItem key={item}>
                <div className="flex items-center justify-between border-b border-white/10 py-4 text-[13px] text-white/65 last:border-0">
                  <span>{item}</span>
                  <span className="font-mono text-[11px] text-white/25">0{index + 1}</span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section
        aria-labelledby="why-created-title"
        className="section-shell landing-section grid items-center gap-12 lg:grid-cols-[.82fr_1.18fr] lg:gap-20"
      >
        <Reveal>
          <div className="relative mx-auto min-h-[440px] max-w-[520px]" aria-hidden="true">
            <div className="absolute right-0 top-2 w-[78%] rounded-[24px] border border-[#e5e7ef] bg-white p-6 shadow-[0_22px_60px_rgba(30,35,55,0.07)]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#777b87]">پروفایل و هدف</span>
                <span className="size-2 rounded-full bg-[#143CFB]" />
              </div>
              <div className="mt-7 h-2 w-[72%] rounded-full bg-[#e7e9f1]" />
              <div className="mt-3 h-2 w-[46%] rounded-full bg-[#eff0f4]" />
            </div>
            <div className="absolute bottom-6 left-0 w-[82%] rounded-[26px] bg-[#eef1ff] p-7 shadow-[0_24px_60px_rgba(20,60,251,0.1)]">
              <Waypoints className="size-7 text-[#143CFB]" strokeWidth={1.6} />
              <div className="mt-8 flex items-end gap-3" dir="ltr">
                {[36, 64, 48, 82, 58].map((height, index) => (
                  <span
                    className="w-full rounded-t-md bg-[#143CFB]"
                    key={height}
                    style={{ height, opacity: 0.35 + index * 0.12 }}
                  />
                ))}
              </div>
              <p className="mt-5 text-[12px] font-bold text-[#3f4665]">یک مسیر، با قدم‌های مشخص</p>
            </div>
            <span className="absolute left-[39%] top-[42%] grid size-14 place-items-center rounded-full bg-[#111] text-white shadow-xl">
              <ArrowLeft className="size-5" />
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <SectionHeading
            description="وآند برای اضافه‌کردن یک منبع دیگر به فهرست منابع ساخته نشده است. هدف، ساختن لایه‌ای است که اطلاعات کاربر، شرایط دانشگاه‌ها و مراحل اقدام را به یک برنامه منسجم تبدیل کند."
            eyebrow="چرا ساخته می‌شود"
            id="why-created-title"
            title="از انباشت اطلاعات، به یک سیستم تصمیم‌گیری"
          />
          <p className="mt-6 max-w-[620px] text-[14px] leading-[2.1] text-[#686a72]">
            به‌جای جابه‌جایی مداوم میان فایل‌ها و فهرست‌ها، کاربر باید بتواند گزینه‌ها را کنار هم
            ببیند، نواقص را زودتر تشخیص دهد و وضعیت هر درخواست را در همان زمینه دنبال کند.
          </p>
        </Reveal>
      </section>

      <section
        aria-labelledby="principles-title"
        className="section-shell landing-section--compact"
      >
        <Reveal>
          <SectionHeading
            description="سه اصل ساده، مرز میان راهنمایی هوشمند و تصمیم‌گیری مبهم را مشخص می‌کنند."
            eyebrow="فلسفه محصول"
            id="principles-title"
            title="وآند باید وضوح بسازد، نه هیاهو"
          />
        </Reveal>

        <RevealGroup className="mt-12 border-y border-[#e7e7e9]" stagger={0.08}>
          {principles.map((principle) => (
            <RevealItem key={principle.number}>
              <article className="grid gap-4 border-b border-[#e7e7e9] py-8 last:border-0 sm:grid-cols-[90px_.75fr_1.25fr] sm:items-start sm:gap-8 lg:py-10">
                <span className="font-mono text-[12px] font-bold text-[#143CFB]">
                  {principle.number}
                </span>
                <h3 className="text-[20px] leading-8 font-black text-[#242427]">
                  {principle.title}
                </h3>
                <p className="text-[13px] leading-7 text-[#707078]">{principle.description}</p>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section
        aria-labelledby="change-title"
        className="section-shell landing-section grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-center"
      >
        <Reveal>
          <SectionHeading
            description="نتیجه مطلوب، وعده یک میان‌بُر نیست؛ یک جریان کاری است که هر تصمیم و هر مرحله را در زمینه درست نشان می‌دهد."
            eyebrow="چه چیزی تغییر می‌کند"
            id="change-title"
            title="کاربر به‌جای دنبال‌کردن فرایند، آن را می‌بیند"
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid overflow-hidden rounded-[28px] border border-[#e6e7eb] bg-[#f8f8f6] sm:grid-cols-2">
            <div className="p-7 sm:p-9">
              <span className="text-[10px] font-bold text-[#8a8a91]">پیش از یکپارچگی</span>
              <ul className="mt-6 grid gap-4 text-[13px] text-[#696970]">
                <li>چند منبع برای یک پاسخ</li>
                <li>چند فایل برای یک مدرک</li>
                <li>چند فهرست برای یک تصمیم</li>
              </ul>
            </div>
            <div className="relative bg-[#143CFB] p-7 text-white sm:p-9">
              <Sparkles className="absolute left-6 top-6 size-5 text-white/35" />
              <span className="text-[10px] font-bold text-white/55">با یک مسیر هدایت‌شده</span>
              <ul className="mt-6 grid gap-4 text-[13px] font-semibold">
                <li>پروفایل در زمینه درست</li>
                <li>گزینه‌ها کنار هم</li>
                <li>قدم بعدی قابل پیگیری</li>
              </ul>
              <GraduationCap className="absolute bottom-5 left-6 size-14 text-white/10" />
            </div>
          </div>
        </Reveal>
      </section>

      <MarketingFinalCta
        description="پروفایل اولیه‌تان را بسازید تا اطلاعات پراکنده، به نقطه شروع یک برنامه روشن تبدیل شوند."
        title="مسیر اپلای را از یک تصویر کامل شروع کنید."
      />
    </main>
  );
}
