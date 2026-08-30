import Image from 'next/image';

import {
  Bell,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Check,
  CheckCircle2,
  ChevronLeft,
  Download,
  FileCheck2,
  FileText,
  Folder,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  ScanSearch,
  Send,
  Settings,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { LineShadowText } from '@/components/ui/line-shadow-text';
import {
  AppPromoCopy,
  AppPromoScene,
  AppPromoVisual,
  Float,
  HeroAnalysisSignal,
  HeroLayer,
  HeroReveal,
  HeroScene,
  PricingAccent,
  PricingCard,
  PricingCopy,
  PricingScene,
  ScrollJourneyHeading,
  ScrollJourneyMilestone,
  ScrollJourneyPath,
  ScrollJourneyPoint,
  ScrollJourneyScene,
  ScrollJourneyStage,
  ScrollJourneyStart,
  MotionLink,
  ProcessScene,
  ProcessStep,
  WhyWaandAura,
  WhyWaandCopy,
  WhyWaandMountain,
  WhyWaandScene,
} from '@/components/landing/motion';
import { Testimonials } from '@/components/landing/testimonials';
import { buttonVariants } from '@/components/ui/button';
import { DASHBOARD_SIGNUP_URL } from '@/lib/public-routes';
import { cn } from '@/lib/utils';
import { WaandLogo } from '@/components/ui/waand-logo';

function StudentIllustration() {
  return <Image alt="" height={280} priority src="/assets/student.png" width={330} />;
}

function HeroVisual() {
  return (
    <HeroScene className="mx-auto w-full max-w-[640px]">
      <div
        aria-label="نمایی از تحلیل هوشمند پروفایل و پیشنهاد دانشگاه در وآند"
        className="relative aspect-[1.38/1] w-full lg:aspect-[1.7/1]"
        role="img"
      >
        <HeroLayer
          className="absolute left-[1%] top-[2%] h-[78%] w-[90%] "
          depth={5}
          kind="panel"
          surfaceClassName="relative h-full w-full overflow-hidden rounded-[26px] bg-[linear-gradient(135deg,#eeeefe,#d9d7fb)] shadow-[0_18px_45px_rgba(57,54,137,0.12)]"
        >
          <div className="absolute left-3 top-3 flex items-center gap-2 text-[9px] font-bold text-[#272748] sm:left-6 sm:top-5 sm:text-[11px]">
            <span className="h-px w-6 bg-[#5664ec] sm:w-10" />
            پیشنهادهای شما
          </div>
          <GraduationCap
            aria-hidden="true"
            className="absolute right-3 top-3 size-7 -rotate-12 text-[#26262a] sm:right-7 sm:top-5 sm:size-10"
            strokeWidth={1.4}
          />
          <div className="absolute left-3 top-11 w-[48%] rounded-xl bg-white/95 p-2 shadow-sm sm:left-5 sm:top-16 sm:rounded-2xl sm:p-4">
            <span className="mb-2 block text-[9px] text-[#73737a]">بهترین تطابق</span>
            <span className="flex items-center gap-2" dir="ltr">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#edf0ff] text-[9px] font-black text-[#1930a9] sm:size-9 sm:text-[10px]">
                U
              </span>
              <span className="text-left text-[8px] font-extrabold leading-tight text-[#171717] sm:text-[11px]">
                University of
                <br />
                Toronto
              </span>
            </span>
            <span className="mt-2 block text-lg font-extrabold text-[#143CFB] sm:mt-3 sm:text-2xl">
              ۹۵٪
            </span>
            <span className="text-[9px] text-[#6c6c75]">میزان تطابق</span>
          </div>
          <Sparkles aria-hidden="true" className="absolute bottom-8 right-6 size-6 text-white" />
          <HeroAnalysisSignal />
        </HeroLayer>

        <HeroLayer
          ambient={2}
          className="absolute bottom-[4%] left-[28%] z-10 h-[88%] w-[50%]"
          depth={9}
          kind="profile"
          surfaceClassName="h-full w-full"
        >
          <StudentIllustration />
        </HeroLayer>

        <HeroLayer
          ambient={4}
          className="absolute bottom-[17%] left-0 z-20 w-[38%]"
          depth={12}
          kind="left"
          surfaceClassName="rounded-2xl bg-[#fde4cb] px-3 py-3 shadow-[0_16px_34px_rgba(122,74,28,0.12)] sm:rounded-[22px] sm:px-5 sm:py-5"
        >
          <strong className="block text-[11px] font-extrabold text-[#30302f] sm:text-sm">
            پرونده شما آماده است!
          </strong>
          <span className="mt-1 block text-[8px] text-[#6a625b] sm:text-[10px]">
            امتیاز کلی شما عالی است.
          </span>
          <span className="mt-2 flex gap-2 sm:mt-4 sm:gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <span
                className="grid size-7 place-items-center rounded-full bg-white/75 sm:size-9"
                key={index}
              >
                <Check
                  aria-hidden="true"
                  className="size-4 text-[#c08300] sm:size-5"
                  strokeWidth={2.5}
                />
              </span>
            ))}
          </span>
        </HeroLayer>

        <HeroLayer
          ambient={-3}
          className="absolute bottom-[21%] right-0 z-20 w-[27%]"
          depth={13}
          kind="right"
          surfaceClassName="rounded-2xl bg-[#171717] px-3 py-3 text-white shadow-[0_18px_38px_rgba(0,0,0,0.2)] sm:rounded-[22px] sm:px-5 sm:py-5"
        >
          <span className="block text-[8px] leading-4 text-white/75 sm:text-[10px] sm:leading-5">
            تعداد دانشگاه‌های مناسب با شما
          </span>
          <strong className="mt-1 block text-2xl font-black sm:mt-2 sm:text-3xl">+۱۲۵</strong>
          <span className="mt-2 flex -space-x-2 sm:mt-3" dir="ltr">
            {['#f0b58b', '#b9d7c0', '#d9b9a8', '#c4c6ee'].map((color) => (
              <span
                className="size-5 rounded-full border-2 border-[#171717] sm:size-6"
                key={color}
                style={{ backgroundColor: color }}
              />
            ))}
          </span>
        </HeroLayer>
      </div>
    </HeroScene>
  );
}

function DocumentStack() {
  return (
    <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 360 250">
      <ellipse cx="180" cy="226" fill="#fff" opacity=".07" rx="142" ry="15" />
      <circle cx="266" cy="62" fill="#cfd4ff" r="35" stroke="#f6f5ee" strokeWidth="2" />
      <path
        d="M266 78V43m0 0-12 13m12-13 12 13"
        fill="none"
        stroke="#1a1a1a"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
      <g transform="rotate(-8 165 137)">
        <rect
          x="81"
          y="35"
          width="152"
          height="186"
          rx="16"
          fill="#ccebdd"
          stroke="#f6f5ee"
          strokeWidth="2"
        />
        <rect x="103" y="64" width="65" height="9" rx="4.5" fill="#43aa8b" />
        <path
          d="M103 90h99M103 105h84M103 120h94"
          stroke="#729b90"
          strokeLinecap="round"
          strokeWidth="5"
        />
      </g>
      <g transform="rotate(7 205 130)">
        <rect
          x="128"
          y="26"
          width="154"
          height="188"
          rx="16"
          fill="#f8f5ed"
          stroke="#161616"
          strokeWidth="2"
        />
        <rect x="151" y="55" width="69" height="10" rx="5" fill="#f3b86d" />
        <path
          d="M151 84h102M151 100h86M151 116h96"
          stroke="#c8c7c1"
          strokeLinecap="round"
          strokeWidth="5"
        />
        <circle cx="178" cy="157" fill="#f5d8b3" r="19" />
        <path
          d="m166 157 9 9 17-20"
          fill="none"
          stroke="#26344f"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="5"
        />
      </g>
      <rect
        x="52"
        y="164"
        width="84"
        height="52"
        rx="12"
        fill="#6578ef"
        stroke="#f6f5ee"
        strokeWidth="2"
        transform="rotate(-12 94 190)"
      />
      <path
        d="m76 188 10 10 24-28"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="6"
      />
    </svg>
  );
}

function ApplicationFlowArt() {
  return (
    <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 320 230">
      <ellipse cx="162" cy="210" fill="#25304a" opacity=".08" rx="120" ry="12" />
      <g stroke="#25304a" strokeLinejoin="round" strokeWidth="2">
        <path d="m112 38 103 22-14 98-103-22Z" fill="#d9e5ff" />
        <path d="m94 51 103 22-14 98-103-22Z" fill="#c9eadf" />
        <path d="M72 70h79l18 18h78v89H72Z" fill="#f4d29e" />
        <path d="M72 97h175v80H72Z" fill="#f8dfb8" />
      </g>
      <path d="M173 107h49v34h-49Z" fill="#9ed7c7" stroke="#25304a" strokeWidth="2" />
      <path d="m182 118 29 6M182 127l20 4" stroke="#4b6d64" strokeLinecap="round" strokeWidth="2" />
      <g transform="rotate(-12 106 170)">
        <rect
          x="42"
          y="128"
          width="132"
          height="79"
          rx="14"
          fill="#172238"
          stroke="#25304a"
          strokeWidth="2"
        />
        <circle cx="70" cy="158" r="14" fill="#f3f0e7" />
        <path
          d="m61 157 9 7 12-15"
          fill="none"
          stroke="#2dae76"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <path
          d="M94 151h58M94 162h43M58 184h93"
          stroke="#f5f7fb"
          strokeLinecap="round"
          strokeWidth="4"
        />
      </g>
      <circle cx="256" cy="174" r="25" fill="#5f78ef" stroke="#25304a" strokeWidth="2" />
      <path
        d="m244 174 8 8 16-19"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
    </svg>
  );
}

function DashboardStatCard({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-[92px] flex-col justify-between rounded-[10px] border border-[#e7e9f1] bg-white p-3">
      <span className="text-[8px] leading-4 text-[#777b86]">{label}</span>
      <strong className="text-[19px] font-black text-[#516ee8]">{value}</strong>
      <small className="text-[7px] leading-3 text-[#8b8e97]">{detail}</small>
    </div>
  );
}

function DashboardPreview() {
  const navigation = [
    { icon: LayoutDashboard, label: 'داشبورد' },
    { icon: FileText, label: 'درخواست‌ها' },
    { icon: GraduationCap, label: 'دانشگاه‌ها' },
    { icon: Folder, label: 'مدارک' },
    { icon: CalendarDays, label: 'ددلاین‌ها' },
    { icon: Sparkles, label: 'پیشنهادها' },
    { icon: ChartNoAxesColumnIncreasing, label: 'گزارش‌ها' },
    { icon: Settings, label: 'تنظیمات' },
  ] as const;

  return (
    <div
      aria-label="پیش‌نمایش داشبورد تحت وب واآند برای مدیریت اپلای دانشگاه"
      className="app-visual-bg relative h-full min-h-[430px] overflow-hidden sm:min-h-[500px] lg:min-h-[620px]"
      role="img"
    >
      <span className="absolute left-8 top-8 h-20 w-44 opacity-45 [background-image:radial-gradient(circle,#c9cff8_1.2px,transparent_1.2px)] [background-size:14px_14px]" />
      <span className="absolute -bottom-[270px] -left-[190px] h-[520px] w-[760px] rotate-[-10deg] rounded-[50%] border border-white/75" />
      <span className="absolute -bottom-[305px] -left-[150px] h-[520px] w-[760px] rotate-[-10deg] rounded-[50%] border border-white/65" />

      <div
        className="
    absolute
    left-[30%]
    top-10
    z-10
    h-[360px]
    w-[540px]
    -translate-x-1/2

    sm:left-1/2
    sm:top-12
    sm:h-[410px]
    sm:w-[620px]

    lg:left-[7%]
    lg:top-[9%]
    lg:h-[82%]
    lg:w-[92%]
    lg:translate-x-0
  "
      >
        <div className="h-full w-full">
          <div className="h-full overflow-hidden rounded-[16px] border border-white/90 bg-white shadow-[0_24px_55px_rgba(42,50,96,0.13)]">
            <div
              className="relative flex h-9 items-center border-b border-[#eceef4] bg-white px-4"
              dir="ltr"
            >
              <span className="flex gap-1.5">
                <i className="size-2.5 rounded-full bg-[#ff5d57]" />
                <i className="size-2.5 rounded-full bg-[#ffbd2e]" />
                <i className="size-2.5 rounded-full bg-[#28c840]" />
              </span>
              <span className="absolute left-1/2 flex h-6 w-[54%] -translate-x-1/2 items-center justify-center gap-1.5 rounded-md bg-[#f5f5f7] text-[8px] text-[#9497a0]">
                <LockKeyhole aria-hidden="true" className="size-2.5" />
                app.waand.ir
              </span>
            </div>

            <div className="flex h-[calc(100%-2.25rem)] bg-[#fbfcff]" dir="rtl">
              <aside className="w-[100px] shrink-0 border-l border-[#eceef4] bg-white px-2 py-4">
                <WaandLogo
                  className="mb-4 gap-1.5 px-2"
                  markClassName="size-5"
                  wordmarkClassName="text-[14px]"
                />
                <nav aria-label="ناوبری پیش‌نمایش داشبورد" className="space-y-1">
                  {navigation.map(({ icon: Icon, label }, index) => (
                    <span
                      className={cn(
                        'flex h-7 items-center gap-2 rounded-md border-r-2 px-2 text-[8px]',
                        index === 0
                          ? 'border-[#143CFB] bg-[#f0f3ff] font-extrabold text-[#143CFB]'
                          : 'border-transparent text-[#727681]',
                        index > 5 && 'hidden sm:flex',
                      )}
                      key={label}
                    >
                      <Icon aria-hidden="true" className="size-3" strokeWidth={1.8} />
                      {label}
                    </span>
                  ))}
                </nav>
              </aside>

              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex h-[70px] items-center justify-between border-b border-[#eceef4] bg-[linear-gradient(90deg,#f8f9ff,#f4f5ff)] px-4">
                  <span>
                    <strong className="block text-[11px] font-extrabold">سلام نیما محمدی 👋</strong>
                    <small className="mt-1 block text-[7px] text-[#80838c]">
                      خوش آمدید؛ امروز چه برنامه‌ای دارید؟
                    </small>
                  </span>
                  <span className="grid size-7 place-items-center rounded-full border border-[#e5e7ef] bg-white text-[#687080]">
                    <Bell aria-hidden="true" className="size-3.5" />
                  </span>
                </div>

                <div className="p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <strong className="text-[9px]">نمای کلی</strong>
                    <span className="text-[7px] text-[#83868f]">به‌روز شده امروز</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="flex min-h-[92px] flex-col items-center justify-between rounded-[10px] border border-[#e7e9f1] bg-white p-3 text-center">
                      <span className="text-[8px] text-[#777b86]">قدرت پروفایل</span>
                      <span className="relative h-10 w-14">
                        <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 64 42">
                          <path
                            d="M8 36a24 24 0 0 1 48 0"
                            fill="none"
                            stroke="#e5e8f5"
                            strokeLinecap="round"
                            strokeWidth="5"
                          />
                          <path
                            d="M8 36a24 24 0 0 1 46.8-7.6"
                            fill="none"
                            stroke="#4767f1"
                            strokeLinecap="round"
                            strokeWidth="5"
                          />
                        </svg>
                        <strong className="absolute inset-x-0 bottom-0 text-[14px] font-black">
                          ۹۵٪
                        </strong>
                      </span>
                      <small className="text-[7px] text-[#636773]">عالی</small>
                    </div>
                    <DashboardStatCard detail="مشاهده فهرست" label="دانشگاه پیشنهادی" value="۱۲" />
                    <DashboardStatCard detail="مشاهده درخواست‌ها" label="درخواست فعال" value="۵" />
                    <DashboardStatCard detail="دانشگاه تورنتو" label="ددلاین بعدی" value="۳ روز" />
                  </div>

                  <div className="mt-2 grid grid-cols-[1.08fr_.92fr] gap-2">
                    <section className="min-h-[170px] rounded-[10px] border border-[#e7e9f1] bg-white p-3">
                      <div className="flex items-center justify-between">
                        <strong className="text-[9px]">پیشنهادهای هوش مصنوعی</strong>
                        <span className="rounded-full bg-[#eef1ff] px-2 py-0.5 text-[6px] font-bold text-[#143CFB]">
                          جدید
                        </span>
                      </div>
                      <p className="mt-1 text-[7px] leading-3 text-[#858993]">
                        بر اساس پروفایل و علاقه‌مندی‌های شما
                      </p>
                      <div className="mt-3 rounded-lg border border-[#eceef5] p-3 shadow-[0_5px_12px_rgba(39,47,92,0.05)]">
                        <span className="flex items-center justify-between gap-2" dir="ltr">
                          <strong className="text-[8px] leading-3 text-[#30333a]">
                            University of British Columbia
                          </strong>
                          <span className="shrink-0 rounded-md bg-[#eef0ff] px-2 py-1 text-[11px] font-black text-[#4d68e9]">
                            92%
                          </span>
                        </span>
                        <small
                          className="mt-2 block text-right text-[6px] text-[#8d9099]"
                          dir="rtl"
                        >
                          مناسب برای رشته و پروفایل شما
                        </small>
                        <span className="mt-3 grid h-6 place-items-center rounded-md bg-[#f1f3ff] text-[7px] font-bold text-[#143CFB]">
                          مشاهده جزئیات پیشنهاد
                        </span>
                      </div>
                    </section>

                    <section className="min-h-[170px] rounded-[10px] border border-[#e7e9f1] bg-white p-3">
                      <strong className="text-[9px]">چک‌لیست مدارک</strong>
                      <small className="mt-1 block text-[6px] text-[#8a8d96]">
                        ۴ از ۵ تکمیل شده
                      </small>
                      <span className="mt-2 block h-1 overflow-hidden rounded-full bg-[#eceef5]">
                        <span className="block h-full w-4/5 rounded-full bg-[#143CFB]" />
                      </span>
                      <span className="mt-3 grid gap-2 text-[7px] text-[#5f636d]">
                        {[
                          'ریز نمرات ترجمه رسمی',
                          'انگیزه‌نامه',
                          'توصیه‌نامه',
                          'مدرک زبان',
                          'پاسپورت',
                        ].map((item, index) => (
                          <span className="flex items-center justify-between gap-2" key={item}>
                            {item}
                            <CheckCircle2
                              aria-hidden="true"
                              className={cn(
                                'size-3 shrink-0',
                                index === 3 ? 'text-[#f2a02a]' : 'text-[#2fbe79]',
                              )}
                              strokeWidth={2.2}
                            />
                          </span>
                        ))}
                      </span>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="absolute left-3 top-5 w-[172px] rounded-[14px] border border-white/90 bg-white/95 p-4 shadow-[0_15px_34px_rgba(49,55,94,0.11)] sm:left-5 sm:top-12 lg:left-2 lg:top-[14%] lg:w-[188px]">
          <span className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#43bf7b] text-white">
              <Check aria-hidden="true" className="size-5" strokeWidth={2.5} />
            </span>
            <span>
              <strong className="block text-[11px] font-extrabold">مدرک شما تأیید شد</strong>
              <small className="mt-1 block text-[7px] leading-3 text-[#858891]">
                ریز نمرات شما با موفقیت تأیید شد.
              </small>
            </span>
          </span>
        </div>

        <div className="absolute bottom-[22%] left-3 hidden w-[150px] rounded-[14px] border border-white/90 bg-white/95 p-4 shadow-[0_15px_34px_rgba(49,55,94,0.10)] sm:block lg:top-[42%] lg:bottom-auto lg:left-2 lg:w-[160px]">
          <span className="flex items-center justify-between gap-3">
            <span>
              <strong className="block text-[10px] font-extrabold">ددلاین بعدی</strong>
              <b className="mt-2 block text-[17px] font-black text-[#e7961c]">۳ روز</b>
              <small className="mt-1 block text-[7px] text-[#858891]">ارسال رزومه ـ تورنتو</small>
            </span>
            <CalendarDays
              aria-hidden="true"
              className="size-6 shrink-0 text-[#5170ec]"
              strokeWidth={1.7}
            />
          </span>
        </div>

        <div className="absolute bottom-5 left-1/2 w-[190px] -translate-x-1/2 rounded-[14px] border border-white/90 bg-white/95 p-4 shadow-[0_15px_34px_rgba(49,55,94,0.11)] lg:bottom-6 lg:left-[52%]">
          <span className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#596ff1,#7348e9)] text-white">
              <Sparkles aria-hidden="true" className="size-4" />
            </span>
            <span>
              <small className="block text-[8px] text-[#727681]">پیشنهاد جدید</small>
              <strong className="mt-1 block text-[16px] font-black text-[#3153dd]">
                ۲ دانشگاه
              </strong>
              <small className="mt-1 block text-[7px] text-[#858891]">
                بر اساس به‌روزرسانی پروفایل شما
              </small>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  const capabilities = [
    'تحلیل هوشمند مدارک',
    'پیشنهاد شخصی‌سازی‌شده',
    'اپلای خودکار و مدیریت کامل',
  ];

  return (
    <section aria-labelledby="hero-title" className="section-shell hero-shell" id="top">
      <div className="grid items-center gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-16">
        <div className="text-center lg:text-right">
          <HeroReveal stage="headline">
            <h1
              className="text-[36px] leading-[1.45] font-black tracking-[-0.04em] text-[#151515] sm:text-[43px] lg:text-[50px]"
              id="hero-title"
            >
              اپلای هوشمندانه‌تر
              <br />
              با قدرت <LineShadowText className="text-[#143CFB]">هوش </LineShadowText>{' '}
              <LineShadowText className="text-[#143CFB]">مصنوعی </LineShadowText>
            </h1>
          </HeroReveal>
          <HeroReveal stage="body">
            <p className="mx-auto mt-5 max-w-[560px] text-[15px] leading-8 text-[#6a6a70] lg:mx-0 lg:max-w-[510px] lg:text-[16px]">
              وآند با تحلیل دقیق مدارک و سوابق تحصیلی شما، بهترین دانشگاه‌ها و برنامه‌ها را پیشنهاد
              می‌دهد و فرآیند اپلای را برای شما ساده و هوشمند می‌کند.
            </p>
          </HeroReveal>
          <HeroReveal stage="actions">
            <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
              <MotionLink
                className={buttonVariants({ className: 'min-w-36' })}
                href={DASHBOARD_SIGNUP_URL}
              >
                رایگان شروع کنید
                <ChevronLeft
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover/button:-translate-x-1"
                />
              </MotionLink>
              <MotionLink
                className={buttonVariants({ className: 'min-w-32', variant: 'secondary' })}
                href="#why-waand"
              >
                اطلاعات بیشتر
              </MotionLink>
            </div>
          </HeroReveal>
        </div>

        <div className="order-last lg:order-none">
          <HeroVisual />
        </div>
      </div>

      <HeroReveal stage="support">
        <div className="mt-12 grid gap-4 border-t border-black/[0.05] pt-7 sm:grid-cols-3">
          {capabilities.map((capability) => (
            <span
              className="flex items-center justify-center gap-2 text-center text-[12px] font-medium text-[#4f4f54]"
              key={capability}
            >
              <CheckCircle2
                aria-hidden="true"
                className="size-5 shrink-0 text-[#11966f]"
                strokeWidth={1.8}
              />
              {capability}
            </span>
          ))}
        </div>
      </HeroReveal>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      aria-labelledby="how-title"
      className="section-shell scroll-mt-24 pt-[64px] pb-[48px] sm:pt-[76px] sm:pb-[56px] lg:pt-[88px] lg:pb-[64px] xl:pt-[96px] xl:pb-[68px]"
      id="how-it-works"
    >
      <div className="mx-auto max-w-[620px] text-center">
        <h2 className="section-title" id="how-title">
          چگونه وآند کار می‌کند؟
        </h2>

        <p className="section-kicker">از تحلیل مدارک تا پذیرش در دانشگاه مورد علاقه‌تان</p>
      </div>

      <ProcessScene className="mx-auto mt-10 grid max-w-[1000px] items-stretch gap-5 md:grid-cols-2 lg:mt-12 lg:grid-cols-[1.62fr_1fr_1.02fr] lg:gap-1">
        {/* --------------------------------------------------------------- */}
        {/* Lead card — equivalent to the dark card in the reference       */}
        {/* --------------------------------------------------------------- */}

        <ProcessStep className="h-full" motionPreset="lead">
          <article className="relative flex h-full min-h-[460px] flex-col overflow-visible rounded-[26px] bg-[#111111] p-7 text-right text-white shadow-[0_18px_38px_rgba(0,0,0,0.10)] lg:min-h-[500px] lg:p-8">
            <div className="relative z-10">
              <h3 className="text-[23px] font-black">۱. آپلود مدارک</h3>

              <p className="mt-3 max-w-[390px] text-[13px] leading-7 text-white/65">
                رزومه، ریزنمرات، انگیزه‌نامه، مدرک زبان و سایر مدارک موردنیاز را در وآند بارگذاری
                کنید.
              </p>

              <a
                className={buttonVariants({
                  className:
                    'mt-6 h-9 w-fit rounded-full bg-white px-5 text-[11px] font-extrabold text-[#171717] shadow-none hover:bg-[#eeeeea]',
                  variant: 'secondary',
                })}
                href={DASHBOARD_SIGNUP_URL}
              >
                شروع با مدارک
              </a>
            </div>

            <div className="pointer-events-none absolute -bottom-4 left-1/2 h-[275px] w-[112%] max-w-[430px] -translate-x-1/2">
              <DocumentStack />
            </div>
          </article>
        </ProcessStep>

        {/* --------------------------------------------------------------- */}
        {/* Middle card                                                     */}
        {/* --------------------------------------------------------------- */}

        <ProcessStep className="h-full" motionPreset="middle">
          <article className="relative flex h-full min-h-[440px] flex-col overflow-hidden rounded-[26px] bg-[#f3f4ef] text-right lg:min-h-[500px]">
            <div className="relative flex h-[270px] shrink-0 items-center justify-center overflow-hidden lg:h-[300px]">
              <Image
                src="/assets/lens_paper.png"
                alt="تحلیل هوشمند مدارک توسط وآند"
                width={420}
                height={320}
                className="h-auto w-[88%] max-w-[360px] object-contain lg:w-[95%]"
                priority={false}
              />
            </div>

            <div className="relative z-10 mt-auto px-6 pb-7 pt-2 lg:px-7 lg:pb-8">
              <h3 className="text-[22px] font-black leading-[1.45]">۲. تحلیل هوشمند</h3>

              <p className="mt-3 text-[12px] leading-6 text-[#686b66]">
                هوش مصنوعی وآند پروفایل، مدارک، نقاط قوت، نواقص و شانس شما را تحلیل می‌کند.
              </p>
            </div>
          </article>
        </ProcessStep>

        {/* --------------------------------------------------------------- */}
        {/* Tilted card                                                     */}
        {/* --------------------------------------------------------------- */}

        <ProcessStep
          className="relative z-10 h-full md:col-span-2 md:mx-auto md:w-[calc(50%-0.625rem)] lg:col-span-1 lg:mx-0 lg:w-auto"
          motionPreset="tilted"
        >
          <article
            className="
              process-card
              relative
              flex
              h-full
              min-h-[440px]
              flex-col
              overflow-hidden
              rounded-[26px]
              border-[#eceee8]
              bg-white
              p-7
              text-right
              shadow-[0_18px_36px_rgba(39,44,39,0.08)]
              lg:min-h-[500px]
              lg:rotate-[4deg]
            "
          >
            <div className="relative z-10">
              <h3 className="text-[22px] font-black leading-[1.45]">۳. پیشنهاد و اپلای</h3>

              <p className="mt-3 text-[12px] leading-6 text-[#686b66]">
                دانشگاه‌های مناسب را دریافت کنید و فرایند درخواست‌ها، مدارک و ددلاین‌ها را از یکجا
                مدیریت کنید.
              </p>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-1 h-[270px]">
              <ApplicationFlowArt />
            </div>
          </article>
        </ProcessStep>
      </ProcessScene>
    </section>
  );
}

function AppPromo() {
  const features = [
    { icon: Download, label: 'بدون نیاز به نصب' },
    { icon: Globe2, label: 'دسترسی از هر مرورگر' },
    { icon: Folder, label: 'مدیریت همه اپلای‌ها' },
    { icon: Bell, label: 'یادآوری ددلاین‌ها' },
  ] as const;

  return (
    <section
      aria-labelledby="app-title"
      className="section-shell scroll-mt-24 pt-[36px] pb-[44px] sm:pt-[44px] sm:pb-[52px] lg:pt-[48px] lg:pb-[56px]"
      id="app"
    >
      <AppPromoScene
        className="
          app-promo-grid
          grid
          overflow-hidden
          rounded-[30px]
          lg:min-h-[620px]
          lg:grid-cols-[.82fr_1.18fr]
        "
      >
        {/* -------------------------------------------------------------- */}
        {/* Copy                                                           */}
        {/* -------------------------------------------------------------- */}

        <div className="relative z-30 flex flex-col justify-center px-7 py-12 text-center sm:px-10 lg:px-10 lg:text-right xl:px-12">
          <AppPromoCopy stage="title">
            <h2 className="section-title lg:text-[38px] lg:leading-[1.65]" id="app-title">
              با <span className="font-black text-[#143CFB]">وآند</span>
              <br />
              همه چیز در دستان شما
            </h2>
          </AppPromoCopy>

          <AppPromoCopy stage="body">
            <p className="mx-auto mt-5 max-w-[520px] text-[15px] leading-8 text-[#65656b] lg:mx-0 lg:text-[16px] lg:leading-[2.15]">
              مدارک خود را مدیریت کنید، پیشرفت اپلای‌ها را پیگیری کنید، ددلاین‌ها را زیر نظر داشته
              باشید و پیشنهادهای هوشمند هوش مصنوعی را همه از یک داشبورد دنبال کنید.
            </p>
          </AppPromoCopy>

          <AppPromoCopy stage="features">
            <div className="mt-8 grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, label }) => (
                <div
                  className="
                    group
                    flex
                    min-h-[64px]
                    items-center
                    justify-between
                    gap-3
                    rounded-[13px]
                    border
                    border-[#e4e6f0]
                    bg-white/55
                    px-4
                    text-right
                    text-[12px]
                    font-bold
                    text-[#454851]
                    transition-[border-color,background-color,transform]
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-[#ccd4ff]
                    hover:bg-white
                    lg:text-[13px]
                  "
                  key={label}
                >
                  <span>{label}</span>

                  <Icon
                    aria-hidden="true"
                    className="size-5 shrink-0 text-[#4264ed] lg:size-6"
                    strokeWidth={1.7}
                  />
                </div>
              ))}
            </div>
          </AppPromoCopy>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Dashboard visual                                               */}
        {/* -------------------------------------------------------------- */}

        <div className="relative h-full min-h-[430px] overflow-hidden sm:min-h-[500px] lg:min-h-[620px]">
          <AppPromoVisual className="h-full">
            <DashboardPreview />
          </AppPromoVisual>
        </div>
      </AppPromoScene>
    </section>
  );
}

function WhyWaand() {
  return (
    <section
      aria-labelledby="why-waand-title"
      className="section-shell scroll-mt-24 pt-[36px] pb-[32px] sm:pt-[44px] sm:pb-[36px] lg:pt-[48px] lg:pb-[40px]"
      id="why-waand"
    >
      <WhyWaandScene
        className="
          relative
          grid
          min-h-[620px]
          items-center
          gap-10
          overflow-hidden
          lg:grid-cols-[.82fr_1.18fr]
          lg:gap-6
        "
      >
        {/* ---------------------------------------------------------------- */}
        {/* Copy                                                             */}
        {/* ---------------------------------------------------------------- */}

        <div className="relative z-20 order-1 text-center lg:order-2 lg:pr-4 lg:text-right">
          <WhyWaandCopy stage="eyebrow">
            <span
              className="
                mb-5
                inline-flex
                items-center
                rounded-full
                border
                border-[#dfe4ff]
                bg-[#f6f7ff]
                px-4
                py-2
                text-[11px]
                font-bold
                text-[#143CFB]
              "
            >
              یک مسیر روشن‌تر برای اپلای
            </span>
          </WhyWaandCopy>

          <WhyWaandCopy stage="title">
            <h2
              className="
                max-w-[590px]
                text-[32px]
                font-black
                leading-[1.55]
                tracking-[-0.04em]
                text-[#171717]
                sm:text-[38px]
                lg:text-[44px]
              "
              id="why-waand-title"
            >
              از اولین قدم تا رسیدن به مقصد
              <br />
              <span className="text-[#143CFB]">وآند همراه تصمیمات شماست.</span>
            </h2>
          </WhyWaandCopy>

          <WhyWaandCopy stage="body">
            <p
              className="
                mx-auto
                mt-6
                max-w-[540px]
                text-[14px]
                leading-[2.15]
                text-[#666970]
                lg:mx-0
                lg:text-[15px]
              "
            >
              اپلای مجموعه‌ای از تصمیم‌ها، مدارک و ددلاین‌های پیچیده است. وآند با تحلیل سوابق شما،
              پیدا کردن دانشگاه‌های مناسب و مدیریت هوشمند مراحل درخواست، مسیر رسیدن به هدف را
              شفاف‌تر می‌کند.
            </p>
          </WhyWaandCopy>

          <WhyWaandCopy stage="features">
            <div
              className="
                mt-7
                flex
                flex-wrap
                justify-center
                gap-x-6
                gap-y-3
                text-[12px]
                font-semibold
                text-[#4d5058]
                lg:justify-start
              "
            >
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#143CFB]" />
                تحلیل مدارک
              </span>

              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#143CFB]" />
                پیشنهاد دانشگاه
              </span>

              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#143CFB]" />
                اپلای هوشمند
              </span>
            </div>
          </WhyWaandCopy>

          <WhyWaandCopy stage="action">
            <div className="mt-8 flex justify-center lg:justify-start">
              <MotionLink
                className={buttonVariants({
                  className: 'min-h-11 min-w-[150px]',
                })}
                href={DASHBOARD_SIGNUP_URL}
              >
                مسیرت را شروع کن
                <ChevronLeft
                  aria-hidden="true"
                  className="size-4 transition-transform group-hover/button:-translate-x-1"
                />
              </MotionLink>
            </div>
          </WhyWaandCopy>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Mountain                                                         */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="
            relative
            order-2
            flex
            min-h-[500px]
            items-center
            justify-center
            lg:order-1
            lg:min-h-[620px]
          "
        >
          <WhyWaandAura
            className="
              absolute
              left-1/2
              top-1/2
              h-[70%]
              w-[78%]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-[radial-gradient(circle,rgba(20,60,251,0.085)_0%,rgba(20,60,251,0.025)_48%,transparent_72%)]
              blur-2xl
            "
          />

          <WhyWaandMountain
            className="
              relative
              z-10
              flex
              h-full
              w-full
              items-center
              justify-center
            "
          >
            <Float
              className="
                relative
                h-[500px]
                w-full
                max-w-[540px]
                sm:h-[570px]
                lg:h-[650px]
                lg:max-w-[620px]
              "
            >
              <Image
                alt="مسیر هدایت‌شده اپلای با وآند تا رسیدن به هدف تحصیلی"
                className="object-contain object-center"
                fill
                sizes="
                  (max-width: 640px) 92vw,
                  (max-width: 1024px) 620px,
                  50vw
                "
                src="/assets/waand-guided-path.png"
              />
            </Float>
          </WhyWaandMountain>

          <WhyWaandCopy
            className="
              absolute
              bottom-3
              left-1/2
              z-20
              -translate-x-1/2
              whitespace-nowrap
              lg:bottom-5
            "
            stage="caption"
          >
            <span
              className="
                rounded-full
                border
                border-black/[0.05]
                bg-white/90
                px-4
                py-2
                text-[10px]
                font-medium
                text-[#73767d]
                shadow-[0_8px_25px_rgba(20,24,45,0.05)]
                backdrop-blur-sm
              "
            >
              از اولین مدرک تا مقصد نهایی
            </span>
          </WhyWaandCopy>
        </div>
      </WhyWaandScene>
    </section>
  );
}

const journeyMilestones = [
  {
    number: '۰۱',
    title: 'پروفایل شما',
    description: 'اطلاعات تحصیلی، علایق، هدف‌ها و مدارک در یک نمای واحد جمع می‌شوند.',
    icon: UserRound,
    progress: 0.13,
    x: 142,
    y: 136,
    mobileNodeClassName: 'right-[1px]',
  },
  {
    number: '۰۲',
    title: 'تحلیل هوشمند',
    description: 'وآند سوابق و مدارک را تحلیل می‌کند و نقاط قوت، کمبودها و فرصت‌ها را روشن می‌کند.',
    icon: ScanSearch,
    progress: 0.29,
    x: 215,
    y: 229,
    mobileNodeClassName: 'right-[21px]',
  },
  {
    number: '۰۳',
    title: 'تطبیق با دانشگاه‌ها',
    description: 'پروفایل شما با دانشگاه‌ها و برنامه‌های مناسب مقایسه می‌شود.',
    icon: GraduationCap,
    progress: 0.44,
    x: 128,
    y: 326,
    mobileNodeClassName: 'right-[1px]',
  },
  {
    number: '۰۴',
    title: 'انتخاب‌های دقیق‌تر',
    description: 'پیشنهادها بر اساس شانس، تناسب و اولویت‌های شما مرتب می‌شوند.',
    icon: ListChecks,
    progress: 0.59,
    x: 220,
    y: 421,
    mobileNodeClassName: 'right-[21px]',
  },
  {
    number: '۰۵',
    title: 'آماده‌سازی درخواست',
    description: 'مدارک، ددلاین‌ها و مراحل هر اپلای در یک مسیر مشخص مدیریت می‌شوند.',
    icon: FileCheck2,
    progress: 0.74,
    x: 140,
    y: 516,
    mobileNodeClassName: 'right-[1px]',
  },
  {
    number: '۰۶',
    title: 'ارسال درخواست',
    description: 'وقتی همه‌چیز آماده است، مسیر شما از تصمیم به اقدام تبدیل می‌شود.',
    icon: Send,
    progress: 0.89,
    x: 194,
    y: 620,
    mobileNodeClassName: 'right-[15px]',
  },
] as const;

const desktopJourneyPath =
  'M 170 50 C 170 88 142 100 142 136 C 142 180 215 184 215 229 C 215 273 128 281 128 326 C 128 370 220 378 220 421 C 220 466 140 470 140 516 C 140 563 194 575 194 620';

const mobileJourneyPath =
  'M 46 0 C 46 48 46 76 46 118 C 46 230 26 250 26 354 C 26 466 46 486 46 590 C 46 702 26 722 26 826 C 26 938 46 958 46 1062 C 46 1174 32 1194 32 1298 C 32 1350 32 1382 32 1416';

type JourneyMilestone = (typeof journeyMilestones)[number];

function JourneyMilestoneCard({ className, step }: { className?: string; step: JourneyMilestone }) {
  const Icon = step.icon;
  const final = step.number === '۰۶';

  return (
    <article
      className={cn(
        'relative flex flex-col overflow-hidden rounded-[24px] border p-5 shadow-[0_18px_50px_rgba(31,37,66,0.08)] sm:p-6',
        final
          ? 'border-[#171717] bg-[#171717] text-white'
          : 'border-[#e4e7f1] bg-white text-[#242428]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <span
          className={cn(
            'font-mono text-[11px] font-bold',
            final ? 'text-white/50' : 'text-[#143CFB]',
          )}
        >
          {step.number}
        </span>
        <span
          className={cn(
            'grid size-10 place-items-center rounded-[14px]',
            final ? 'bg-white/[0.08] text-[#8da2ff]' : 'bg-[#eef1ff] text-[#143CFB]',
          )}
        >
          <Icon aria-hidden="true" className="size-5" strokeWidth={1.7} />
        </span>
      </div>
      <h3 className="mt-5 text-[20px] leading-[1.65] font-black tracking-[-0.035em] sm:text-[22px]">
        {step.title}
      </h3>
      <p
        className={cn(
          'mt-3 text-[12px] leading-[1.95] sm:text-[13px]',
          final ? 'text-white/62' : 'text-[#6b6e77]',
        )}
      >
        {step.description}
      </p>
    </article>
  );
}

function ApplicationJourneySection() {
  return (
    <section aria-labelledby="journey-title" className="scroll-mt-24" id="how-it-works-details">
      <ScrollJourneyScene className="journey-scroll-space">
        <div className="journey-sticky-stage">
          <div className="section-shell grid w-full items-center gap-12 py-20 lg:grid-cols-[.82fr_1.18fr] lg:gap-10 lg:py-8 xl:gap-16">
            <ScrollJourneyHeading className="relative z-10 text-center lg:text-right">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dfe4ff] bg-[#f6f7ff] px-4 py-2 text-[11px] font-bold text-[#143CFB]">
                <Sparkles aria-hidden="true" className="size-4" />
                از پروفایل تا اقدام
              </span>
              <h2
                className="mt-6 text-[35px] leading-[1.55] font-black tracking-[-0.045em] text-[#171717] sm:text-[44px] lg:text-[46px] xl:text-[52px]"
                id="journey-title"
              >
                یک مسیر روشن،
                <br />
                <span className="text-[#143CFB]">از شما تا درخواست.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-[560px] text-[14px] leading-[2.05] text-[#696b73] sm:text-[15px] lg:mx-0">
                از شناخت دقیق پروفایل شما تا انتخاب دانشگاه و آماده‌سازی درخواست، وآند هر مرحله را
                به یک مسیر قابل‌فهم و قابل‌پیگیری تبدیل می‌کند.
              </p>
              <span className="mt-7 hidden items-center gap-2 text-[10px] font-semibold text-[#8a8d96] lg:inline-flex">
                <span className="size-1.5 rounded-full bg-[#143CFB]" />
                با حرکت صفحه، مسیر را جلو و عقب دنبال کنید
              </span>
            </ScrollJourneyHeading>

            <ScrollJourneyStage className="journey-animated relative hidden lg:block">
              <div
                aria-hidden="true"
                className="relative h-[min(72svh,680px)] min-h-[560px] overflow-hidden rounded-[30px] border border-[#e4e7f1] bg-[#fafafa] shadow-[0_30px_80px_rgba(31,37,66,0.07)]"
                dir="ltr"
              >
                <span className="absolute left-8 top-8 size-24 opacity-50 [background-image:radial-gradient(circle,#cdd4f8_1.2px,transparent_1.2px)] [background-size:13px_13px]" />
                <span className="absolute -bottom-32 -left-28 size-80 rounded-full border border-[#e6e9f5]" />
                <svg className="absolute inset-0 size-full" viewBox="0 0 660 680">
                  <defs>
                    <filter height="160%" id="scroll-journey-glow" width="160%" x="-30%" y="-30%">
                      <feGaussianBlur stdDeviation="5" />
                    </filter>
                  </defs>
                  <path
                    d={desktopJourneyPath}
                    fill="none"
                    stroke="#E4E7F0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="11"
                    vectorEffect="non-scaling-stroke"
                  />
                  <ScrollJourneyPath
                    d={desktopJourneyPath}
                    filter="url(#scroll-journey-glow)"
                    opacity={0.24}
                    stroke="#143CFB"
                    strokeWidth={13}
                  />
                  <ScrollJourneyPath d={desktopJourneyPath} stroke="#143CFB" strokeWidth={4} />
                  <ScrollJourneyStart>
                    <circle cx="170" cy="50" fill="#171717" r="25" />
                    <circle cx="170" cy="43" fill="#FFFFFF" r="6" />
                    <path
                      d="M158 61c2-8 22-8 24 0"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeLinecap="round"
                      strokeWidth="3"
                    />
                    <text
                      fill="#51545D"
                      fontSize="12"
                      fontWeight="800"
                      textAnchor="start"
                      x="208"
                      y="55"
                    >
                      شما
                    </text>
                  </ScrollJourneyStart>
                  {journeyMilestones.map((step) => (
                    <ScrollJourneyPoint
                      cx={step.x}
                      cy={step.y}
                      final={step.number === '۰۶'}
                      key={step.number}
                      number={step.number}
                      progressAt={step.progress}
                    />
                  ))}
                </svg>

                <div className="absolute right-[4%] top-[22%] h-[56%] w-[55%]" dir="rtl">
                  {journeyMilestones.map((step, index) => (
                    <ScrollJourneyMilestone
                      activeUntil={journeyMilestones[index + 1]?.progress ?? 1}
                      className="absolute inset-0"
                      final={step.number === '۰۶'}
                      index={index}
                      key={step.number}
                      mode="desktop"
                      progressAt={step.progress}
                    >
                      <JourneyMilestoneCard className="h-full justify-center" step={step} />
                    </ScrollJourneyMilestone>
                  ))}
                </div>
              </div>
            </ScrollJourneyStage>

            <ol className="journey-animated relative lg:hidden">
              <svg
                aria-hidden="true"
                className="absolute inset-y-0 right-0 h-full w-[72px]"
                preserveAspectRatio="none"
                viewBox="0 0 72 1416"
              >
                <path
                  d={mobileJourneyPath}
                  fill="none"
                  stroke="#E4E7F0"
                  strokeLinecap="round"
                  strokeWidth="10"
                  vectorEffect="non-scaling-stroke"
                />
                <ScrollJourneyPath
                  d={mobileJourneyPath}
                  opacity={0.18}
                  stroke="#143CFB"
                  strokeWidth={12}
                />
                <ScrollJourneyPath d={mobileJourneyPath} stroke="#143CFB" strokeWidth={3.5} />
              </svg>
              {journeyMilestones.map((step, index) => (
                <li
                  className="relative flex h-[236px] items-center pr-[78px] sm:h-[200px]"
                  key={step.number}
                >
                  <svg
                    aria-hidden="true"
                    className={cn(
                      'absolute top-1/2 size-12 -translate-y-1/2',
                      step.mobileNodeClassName,
                    )}
                    viewBox="0 0 48 48"
                  >
                    <ScrollJourneyPoint
                      cx={24}
                      cy={24}
                      final={step.number === '۰۶'}
                      number={step.number}
                      progressAt={step.progress}
                    />
                  </svg>
                  <ScrollJourneyMilestone
                    activeUntil={journeyMilestones[index + 1]?.progress ?? 1}
                    className="w-full"
                    final={step.number === '۰۶'}
                    index={index}
                    mode="mobile"
                    progressAt={step.progress}
                  >
                    <JourneyMilestoneCard
                      className="min-h-[184px] justify-center sm:min-h-[166px]"
                      step={step}
                    />
                  </ScrollJourneyMilestone>
                </li>
              ))}
            </ol>

            <ol className="journey-animated sr-only hidden lg:block">
              {journeyMilestones.map((step) => (
                <li key={step.number}>
                  {step.number} — {step.title}: {step.description}
                </li>
              ))}
            </ol>

            <ol className="journey-reduced-list gap-4 pt-4 sm:grid-cols-2 lg:col-span-2 lg:pt-10">
              {journeyMilestones.map((step) => (
                <li className="h-full" key={step.number}>
                  <JourneyMilestoneCard className="h-full" step={step} />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </ScrollJourneyScene>
    </section>
  );
}

const pricingPlans = [
  {
    name: 'شروع',
    description: 'برای ساخت پروفایل و شروع مسیر اپلای',
    price: 'رایگان',
    period: '',
    featured: false,
    cta: 'رایگان شروع کنید',
    features: [
      'ساخت و تکمیل پروفایل تحصیلی',
      'تحلیل اولیه اطلاعات',
      'پیشنهاد دانشگاه‌های متناسب',
      'مدیریت اولیه مسیر اپلای',
    ],
  },
  {
    name: 'حرفه‌ای',
    description: 'برای دانشجویانی که می‌خواهند جدی‌تر و هوشمندتر اپلای کنند',
    price: '۲۹۹',
    period: 'هزار تومان / ماه',
    featured: true,
    cta: 'شروع پلن حرفه‌ای',
    features: [
      'تحلیل کامل مدارک و سوابق',
      'پیشنهادهای هوشمند دانشگاه',
      'مدیریت مدارک و درخواست‌ها',
      'پیگیری ددلاین‌ها',
      'تحلیل و به‌روزرسانی مستمر پروفایل',
    ],
  },
  {
    name: 'کامل',
    description: 'برای مدیریت چندین اپلای از یک فضای یکپارچه',
    price: '۵۹۹',
    period: 'هزار تومان / ماه',
    featured: false,
    cta: 'انتخاب پلن کامل',
    features: [
      'تمام امکانات پلن حرفه‌ای',
      'مدیریت همزمان چند اپلای',
      'پیگیری کامل وضعیت درخواست‌ها',
      'سازمان‌دهی پیشرفته مدارک',
      'گزارش کامل مسیر اپلای',
    ],
  },
] as const;

function PricingSection() {
  return (
    <section
      aria-labelledby="pricing-title"
      className="section-shell scroll-mt-24 pt-[28px] pb-[72px] sm:pt-[34px] sm:pb-[84px] lg:pt-[40px] lg:pb-[96px] xl:pb-[104px]"
      id="pricing"
    >
      <PricingScene className="relative">
        {/* ambient accent */}
        <PricingAccent
          className="
            pointer-events-none
            absolute
            left-1/2
            top-[54%]
            h-[420px]
            w-[520px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-[radial-gradient(circle,rgba(20,60,251,0.08)_0%,rgba(20,60,251,0.025)_42%,transparent_72%)]
            blur-3xl
          "
        />

        {/* Heading */}
        <div className="relative z-10 mx-auto max-w-[680px] text-center">
          <PricingCopy stage="eyebrow">
            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#dfe4ff]
                bg-[#f6f7ff]
                px-4
                py-2
                text-[11px]
                font-bold
                text-[#143CFB]
              "
            >
              <Sparkles aria-hidden="true" className="size-3.5" />
              ساده و شفاف
            </span>
          </PricingCopy>

          <PricingCopy stage="title">
            <h2
              className="
                mt-5
                text-[32px]
                font-black
                leading-[1.55]
                tracking-[-0.04em]
                text-[#171717]
                sm:text-[38px]
                lg:text-[44px]
              "
              id="pricing-title"
            >
              پلنی برای هر مرحله
              <br />
              <span className="text-[#143CFB]">از شروع تا پذیرش</span>
            </h2>
          </PricingCopy>

          <PricingCopy stage="body">
            <p
              className="
                mx-auto
                mt-5
                max-w-[570px]
                text-[14px]
                leading-8
                text-[#696b72]
                sm:text-[15px]
              "
            >
              بدون پیچیدگی و هزینه‌های پنهان؛ امکاناتی را انتخاب کنید که با مسیر اپلای شما هماهنگ
              است.
            </p>
          </PricingCopy>
        </div>

        {/* Cards */}
        <div
          className="
            relative
            z-10
            mx-auto
            mt-12
            grid
            max-w-[1120px]
            items-stretch
            gap-4
            md:grid-cols-3
            lg:mt-16
            lg:gap-5
          "
        >
          {pricingPlans.map((plan, index) => (
            <PricingCard
              featured={plan.featured}
              index={index}
              key={plan.name}
              className={plan.featured ? 'md:-translate-y-5' : ''}
            >
              <article
                className={cn(
                  `
                    group/pricing
                    relative
                    flex
                    h-full
                    min-h-[510px]
                    flex-col
                    overflow-hidden
                    rounded-[26px]
                    border
                    p-7
                    transition-[border-color,box-shadow]
                    duration-300
                    lg:p-8
                  `,
                  plan.featured
                    ? `
                        border-[#171717]
                        bg-[#141414]
                        text-white
                        shadow-[0_24px_60px_rgba(15,18,32,0.16)]
                      `
                    : `
                        border-[#e7e9ef]
                        bg-white
                        text-[#171717]
                        shadow-[0_14px_34px_rgba(25,31,53,0.045)]
                        hover:border-[#d9ddec]
                        hover:shadow-[0_20px_48px_rgba(25,31,53,0.075)]
                      `,
                )}
              >
                {plan.featured && (
                  <>
                    <span
                      aria-hidden="true"
                      className="
                        absolute
                        -right-24
                        -top-24
                        size-52
                        rounded-full
                        bg-[#143CFB]/20
                        blur-3xl
                      "
                    />

                    <div className="relative mb-6 flex justify-end">
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          border
                          border-white/10
                          bg-white/[0.07]
                          px-3
                          py-1.5
                          text-[10px]
                          font-bold
                          text-white/85
                        "
                      >
                        <Sparkles aria-hidden="true" className="size-3" />
                        محبوب‌ترین انتخاب
                      </span>
                    </div>
                  </>
                )}

                <div className="relative">
                  <span
                    className={cn(
                      'text-[12px] font-bold',
                      plan.featured ? 'text-white/55' : 'text-[#777a82]',
                    )}
                  >
                    {plan.name}
                  </span>

                  <div className="mt-5 min-h-[82px]">
                    <strong
                      className={cn(
                        'block font-black tracking-[-0.045em]',
                        plan.price === 'رایگان' ? 'text-[37px]' : 'text-[44px]',
                      )}
                    >
                      {plan.price}
                    </strong>

                    {plan.period && (
                      <span
                        className={cn(
                          'mt-1 block text-[11px]',
                          plan.featured ? 'text-white/45' : 'text-[#858891]',
                        )}
                      >
                        {plan.period}
                      </span>
                    )}
                  </div>

                  <p
                    className={cn(
                      'mt-4 min-h-[58px] text-[12px] leading-6',
                      plan.featured ? 'text-white/55' : 'text-[#6c6f76]',
                    )}
                  >
                    {plan.description}
                  </p>
                </div>

                <div
                  className={cn(
                    'my-7 h-px w-full',
                    plan.featured ? 'bg-white/10' : 'bg-black/[0.06]',
                  )}
                />

                <ul className="relative space-y-4">
                  {plan.features.map((feature) => (
                    <li className="flex items-start gap-3 text-[12px] leading-6" key={feature}>
                      <span
                        className={cn(
                          'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full',
                          plan.featured
                            ? 'bg-white/[0.08] text-[#8da2ff]'
                            : 'bg-[#f0f3ff] text-[#143CFB]',
                        )}
                      >
                        <Check aria-hidden="true" className="size-3" strokeWidth={2.4} />
                      </span>

                      <span className={plan.featured ? 'text-white/72' : 'text-[#51545b]'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="relative mt-auto pt-8">
                  <MotionLink
                    className={cn(
                      `
                        group/pricing-button
                        flex
                        min-h-11
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        px-5
                        text-[12px]
                        font-extrabold
                        transition-colors
                      `,
                      plan.featured
                        ? `
                            bg-white
                            text-[#171717]
                            hover:bg-[#f1f1ef]
                          `
                        : `
                            bg-[#f3f4f7]
                            text-[#242426]
                            hover:bg-[#e9ebf1]
                          `,
                    )}
                    href={DASHBOARD_SIGNUP_URL}
                    hoverScale={1.01}
                    tapScale={0.985}
                  >
                    {plan.cta}

                    <ChevronLeft
                      aria-hidden="true"
                      className="
                        size-4
                        transition-transform
                        duration-300
                        group-hover/pricing-button:-translate-x-1
                      "
                    />
                  </MotionLink>
                </div>
              </article>
            </PricingCard>
          ))}
        </div>
      </PricingScene>
    </section>
  );
}
export function LandingPage() {
  return (
    <main id="main-content">
      <HeroSection />
      <HowItWorks />
      <AppPromo />
      <WhyWaand />
      <ApplicationJourneySection />
      <Testimonials />
      <PricingSection />
    </main>
  );
}
