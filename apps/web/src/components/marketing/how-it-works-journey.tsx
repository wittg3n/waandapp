import {
  ArrowDown,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  FileCheck2,
  FileText,
  GitBranch,
  GraduationCap,
  ListChecks,
  MapPin,
  ScanSearch,
  Sparkles,
  UserRound,
} from 'lucide-react';

import { Float, Reveal, RevealGroup, RevealItem } from '@/components/landing/motion';
import { SectionHeading } from '@/components/marketing/section-heading';

const stages = [
  {
    number: '۰۱',
    title: 'خودتان و شرایط‌تان را معرفی می‌کنید',
    description:
      'سوابق تحصیلی، هدف اپلای، مقصد، بازه زمانی، وضعیت زبان و اولویت‌های اصلی، زمینه تحلیل را می‌سازند.',
    detail: 'اطلاعات اولیه در یک زمینه واحد',
    visual: 'profile',
  },
  {
    number: '۰۲',
    title: 'وآند اطلاعات را در کنار هم تحلیل می‌کند',
    description:
      'مدارک و داده‌های پروفایل به‌صورت جدا از هم دیده نمی‌شوند؛ نقاط قوت، نواقص و شرایط مسیر در یک تصویر بررسی می‌شوند.',
    detail: 'از فایل‌های جدا به یک نمای قابل تحلیل',
    visual: 'analysis',
  },
  {
    number: '۰۳',
    title: 'گزینه‌های متناسب پیدا می‌شوند',
    description:
      'به‌جای یک فهرست عمومی، دانشگاه‌ها و برنامه‌ها در زمینه هدف و شرایطی که وارد کرده‌اید بررسی می‌شوند.',
    detail: 'چند مسیر ممکن، با زمینه مشخص',
    visual: 'options',
  },
  {
    number: '۰۴',
    title: 'مقایسه می‌کنید و فهرست کوتاه می‌سازید',
    description:
      'گزینه‌ها کنار هم قرار می‌گیرند تا تفاوت‌ها، اولویت‌ها و مواردی که هنوز باید بررسی شوند واضح‌تر باشند.',
    detail: 'تصمیم کمتر پراکنده، مقایسه بیشتر قابل فهم',
    visual: 'compare',
  },
  {
    number: '۰۵',
    title: 'مدارک و مراحل درخواست منظم می‌شوند',
    description:
      'نسخه‌های مدارک، کارهای باقیمانده و ددلاین هر درخواست در همان مسیر نگهداری و مدیریت می‌شوند.',
    detail: 'هر مدرک، کنار درخواست مربوط به خودش',
    visual: 'documents',
  },
  {
    number: '۰۶',
    title: 'کل مسیر را شفاف دنبال می‌کنید',
    description:
      'از کار بعدی تا وضعیت هر درخواست، یک نمای پیوسته کمک می‌کند بدانید کجا هستید و چه چیزی جلوتر قرار دارد.',
    detail: 'یک نمای روشن از اکنون تا قدم بعدی',
    visual: 'tracking',
  },
] as const;

function ProfileVisual() {
  return (
    <div className="relative h-[340px] overflow-hidden rounded-[28px] bg-[#f1f3ff] p-6 sm:h-[390px] sm:p-9">
      <div className="absolute right-7 top-8 w-[72%] rounded-[24px] border border-[#dfe4ff] bg-white p-6 shadow-[0_22px_55px_rgba(30,38,72,0.08)]">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-[#143CFB] text-white">
            <UserRound className="size-6" />
          </span>
          <div className="flex-1">
            <span className="block h-2 w-24 rounded-full bg-[#cfd5ee]" />
            <span className="mt-3 block h-2 w-16 rounded-full bg-[#e8eaf2]" />
          </div>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-3">
          {['مقصد', 'مقطع', 'زبان', 'بازه زمانی'].map((item) => (
            <span
              className="rounded-xl border border-[#eceef5] bg-[#fafafe] px-3 py-3 text-[10px] font-bold text-[#6e7282]"
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
      <Float className="absolute bottom-7 left-5">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#111] px-4 py-3 text-[10px] font-bold text-white shadow-xl">
          <Sparkles className="size-4 text-[#8ea3ff]" />
          زمینه تحلیل آماده است
        </span>
      </Float>
    </div>
  );
}

function AnalysisVisual() {
  return (
    <div className="relative h-[340px] overflow-hidden rounded-[28px] bg-[#111] p-7 text-white sm:h-[390px] sm:p-10">
      <span className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#5673ff] to-transparent" />
      <span className="absolute left-1/2 top-1/2 size-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#4967ff]/25" />
      <span className="absolute left-1/2 top-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/15" />
      <div className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[26px] bg-[#143CFB] shadow-[0_0_55px_rgba(20,60,251,0.45)]">
        <ScanSearch className="size-10" strokeWidth={1.4} />
      </div>
      <div className="absolute left-7 top-7 w-32 rounded-[16px] border border-white/10 bg-white/[0.06] p-4">
        <FileText className="size-5 text-[#91a5ff]" />
        <span className="mt-5 block h-1.5 w-full rounded-full bg-white/15" />
        <span className="mt-2 block h-1.5 w-2/3 rounded-full bg-white/10" />
      </div>
      <div className="absolute bottom-7 right-7 grid grid-cols-3 items-end gap-2">
        {[32, 58, 44].map((height) => (
          <span className="w-5 rounded-t bg-[#8097ff]" key={height} style={{ height }} />
        ))}
      </div>
    </div>
  );
}

function OptionsVisual() {
  return (
    <div
      className="relative h-[340px] overflow-hidden rounded-[28px] border border-[#e7e8ed] bg-[#fbfbfa] sm:h-[390px]"
      dir="ltr"
    >
      <svg className="absolute inset-0 size-full" fill="none" viewBox="0 0 520 390">
        <path d="M72 196 H210 C260 196 252 82 326 82 H452" stroke="#d7dcf6" strokeWidth="3" />
        <path d="M72 196 H452" stroke="#143CFB" strokeWidth="4" />
        <path d="M72 196 H210 C260 196 252 310 326 310 H452" stroke="#eadccf" strokeWidth="3" />
      </svg>
      <span className="absolute left-8 top-1/2 grid size-16 -translate-y-1/2 place-items-center rounded-[20px] bg-[#111] text-white">
        <GitBranch className="size-7" />
      </span>
      {[
        { className: 'right-8 top-10', tone: 'bg-[#eef1ff] text-[#143CFB]' },
        { className: 'right-8 top-1/2 -translate-y-1/2', tone: 'bg-[#143CFB] text-white' },
        { className: 'right-8 bottom-10', tone: 'bg-[#f7efe7] text-[#a76b34]' },
      ].map((item, index) => (
        <span
          className={`absolute ${item.className} grid size-16 place-items-center rounded-[20px] ${item.tone} shadow-[0_12px_35px_rgba(35,38,52,0.07)]`}
          key={item.className}
        >
          {index === 1 ? <GraduationCap className="size-7" /> : <MapPin className="size-6" />}
        </span>
      ))}
    </div>
  );
}

function CompareVisual() {
  return (
    <div className="relative grid h-[340px] grid-cols-2 items-center gap-3 overflow-hidden rounded-[28px] bg-[#f3f3f0] p-5 sm:h-[390px] sm:gap-5 sm:p-8">
      {['گزینه A', 'گزینه B'].map((item, index) => (
        <div
          className={
            index === 0
              ? 'rounded-[22px] border-2 border-[#143CFB] bg-white p-5 shadow-[0_20px_45px_rgba(20,60,251,0.1)]'
              : 'rounded-[22px] border border-[#e0e1e5] bg-white p-5'
          }
          key={item}
        >
          <GraduationCap
            className={index === 0 ? 'size-7 text-[#143CFB]' : 'size-7 text-[#777a83]'}
          />
          <strong className="mt-5 block text-[12px] text-[#33343a]">{item}</strong>
          <div className="mt-5 grid gap-2">
            {[80, 62, 92].map((width) => (
              <span
                className="h-1.5 rounded-full bg-[#e7e8ed]"
                key={width}
                style={{ width: `${width}%` }}
              />
            ))}
          </div>
          {index === 0 && (
            <span className="mt-5 inline-flex items-center gap-1 rounded-full bg-[#edf0ff] px-3 py-2 text-[9px] font-bold text-[#143CFB]">
              <Check className="size-3" />
              فهرست کوتاه
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function DocumentsVisual() {
  return (
    <div className="relative h-[340px] overflow-hidden rounded-[28px] bg-[#f4efe9] sm:h-[390px]">
      <div className="absolute left-1/2 top-1/2 h-[230px] w-[68%] -translate-x-1/2 -translate-y-1/2 rotate-[-4deg] rounded-[22px] border border-[#ded5ca] bg-[#fdfcf9]" />
      <div className="absolute left-1/2 top-1/2 h-[230px] w-[68%] -translate-x-1/2 -translate-y-1/2 rotate-[3deg] rounded-[22px] border border-[#e3dcd2] bg-white" />
      <div className="absolute left-1/2 top-1/2 h-[230px] w-[68%] -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-white p-6 shadow-[0_20px_50px_rgba(69,54,38,0.1)]">
        <div className="flex items-center justify-between">
          <FileCheck2 className="size-7 text-[#143CFB]" />
          <span className="rounded-full bg-[#edf0ff] px-3 py-1 text-[9px] font-bold text-[#143CFB]">
            ۳ از ۵
          </span>
        </div>
        <div className="mt-7 grid gap-3">
          {['رزومه', 'ریز‌نمرات', 'انگیزه‌نامه'].map((item, index) => (
            <span
              className="flex items-center gap-3 text-[10px] font-bold text-[#62636a]"
              key={item}
            >
              {index < 2 ? (
                <CheckCircle2 className="size-4 text-[#11966f]" />
              ) : (
                <span className="size-4 rounded-full border border-[#cfd0d5]" />
              )}
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrackingVisual() {
  return (
    <div className="relative h-[340px] overflow-hidden rounded-[28px] bg-[#eef1ff] p-5 sm:h-[390px] sm:p-8">
      <div className="h-full rounded-[22px] border border-[#dbe1ff] bg-white p-5 shadow-[0_22px_55px_rgba(20,60,251,0.08)] sm:p-7">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-[#888b96]">نمای مسیر</span>
            <strong className="mt-2 block text-[14px] text-[#292a30]">درخواست‌های شما</strong>
          </div>
          <BarChart3 className="size-6 text-[#143CFB]" />
        </div>
        <div className="mt-7 h-2 overflow-hidden rounded-full bg-[#eceef7]">
          <span className="block h-full w-[68%] rounded-full bg-[#143CFB]" />
        </div>
        <div className="mt-7 grid gap-3">
          {[
            { icon: CheckCircle2, label: 'پروفایل کامل', color: 'text-[#11966f]' },
            { icon: ListChecks, label: 'فهرست کوتاه آماده', color: 'text-[#143CFB]' },
            { icon: CalendarDays, label: 'قدم بعدی: بررسی ددلاین', color: 'text-[#a86c35]' },
          ].map(({ color, icon: Icon, label }) => (
            <div
              className="flex items-center justify-between rounded-xl border border-[#eceef3] px-4 py-3"
              key={label}
            >
              <span className="text-[10px] font-bold text-[#5b5d65]">{label}</span>
              <Icon className={`size-4 ${color}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StageVisual({ visual }: { visual: (typeof stages)[number]['visual'] }) {
  if (visual === 'profile') return <ProfileVisual />;
  if (visual === 'analysis') return <AnalysisVisual />;
  if (visual === 'options') return <OptionsVisual />;
  if (visual === 'compare') return <CompareVisual />;
  if (visual === 'documents') return <DocumentsVisual />;
  return <TrackingVisual />;
}

export function HowItWorksJourney() {
  return (
    <section aria-labelledby="journey-title" className="wide-shell landing-section">
      <Reveal>
        <SectionHeading
          align="center"
          className="max-w-[730px]"
          description="این مسیر یک فهرست ویژگی نیست؛ هر مرحله، زمینه مرحله بعد را می‌سازد و اطلاعات را از حالت پراکنده به یک برنامه قابل پیگیری نزدیک می‌کند."
          eyebrow="مسیر محصول"
          id="journey-title"
          title="شش مرحله، یک جریان پیوسته"
        />
      </Reveal>

      <div className="relative mt-16">
        <div
          aria-hidden="true"
          className="absolute bottom-28 right-5 top-28 w-px bg-gradient-to-b from-transparent via-[#cbd3ff] to-transparent lg:left-1/2 lg:right-auto"
        />
        <RevealGroup className="grid gap-24 lg:gap-32" stagger={0.04}>
          {stages.map((stage, index) => (
            <RevealItem key={stage.number}>
              <article className="relative grid items-center gap-8 pr-10 lg:min-h-[470px] lg:grid-cols-2 lg:gap-24 lg:pr-0">
                <span className="absolute right-[9px] top-8 z-10 grid size-6 place-items-center rounded-full bg-[#143CFB] text-[0] shadow-[0_0_0_8px_#fefefe] lg:left-1/2 lg:right-auto lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
                  {stage.number}
                </span>

                <Reveal
                  className={index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}
                  delay={0.04}
                  y={24}
                >
                  <StageVisual visual={stage.visual} />
                </Reveal>

                <Reveal
                  className={index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}
                  delay={0.1}
                  y={22}
                >
                  <div className={index % 2 === 0 ? 'lg:pr-5' : 'lg:pl-5'}>
                    <span className="font-mono text-[12px] font-bold text-[#143CFB]">
                      {stage.number}
                    </span>
                    <h3 className="mt-4 text-[27px] leading-[1.65] font-black tracking-[-0.035em] text-[#242428] sm:text-[32px]">
                      {stage.title}
                    </h3>
                    <p className="mt-5 max-w-[560px] text-[14px] leading-[2.05] text-[#696b73] sm:text-[15px]">
                      {stage.description}
                    </p>
                    <span className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#e4e6ee] bg-white px-4 py-2 text-[10px] font-bold text-[#777984] shadow-[0_6px_18px_rgba(0,0,0,0.03)]">
                      <Sparkles className="size-3.5 text-[#143CFB]" />
                      {stage.detail}
                    </span>
                  </div>
                </Reveal>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
        <span
          aria-hidden="true"
          className="mx-auto mt-14 grid size-12 place-items-center rounded-full border border-[#dbe0fb] bg-[#f4f6ff] text-[#143CFB]"
        >
          <ArrowDown className="size-5" />
        </span>
      </div>
    </section>
  );
}
