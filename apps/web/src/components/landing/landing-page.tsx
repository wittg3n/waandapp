import Image from 'next/image';
import {
  Apple,
  AtSign,
  Bell,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Check,
  CheckCircle2,
  ChevronLeft,
  Download,
  FileText,
  Folder,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  MessageCircle,
  Play,
  Send,
  Server,
  Settings,
  Sparkles,
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/landing-navbar';
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
  MotionLink,
  ProcessScene,
  ProcessStep,
  Reveal,
  RevealGroup,
  RevealItem,
  WhyWaandAura,
  WhyWaandCopy,
  WhyWaandMountain,
  WhyWaandScene,
} from '@/components/landing/motion';
import { Testimonials } from '@/components/landing/testimonials';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WaandLogo } from '@/components/ui/waand-logo';

const dashboardSignupUrl = new URL(
  '/signup',
  process.env.NEXT_PUBLIC_USER_DASHBOARD_URL as string,
).toString();

function StoreBadges({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-3" dir="ltr">
      <span
        aria-label="دریافت از اپ استور"
        className={cn(
          'inline-flex items-center gap-2 rounded-lg bg-[#111] px-3 text-white shadow-sm',
          compact ? 'order-1' : 'order-2',
          compact
            ? 'h-10 min-w-[128px]'
            : 'h-12 w-[146px] max-sm:h-11 max-sm:w-[136px] max-sm:min-w-0 max-sm:px-2',
        )}
      >
        <Apple aria-hidden="true" className={compact ? 'size-5' : 'size-6'} />
        <span className="text-left leading-none">
          <small className="block text-[8px] text-white/70">Download on the</small>
          <strong className={compact ? 'text-[13px]' : 'text-[15px]'}>App Store</strong>
        </span>
      </span>
      <span
        aria-label="دریافت از گوگل پلی"
        className={cn(
          'inline-flex items-center gap-2 rounded-lg bg-[#111] px-3 text-white shadow-sm',
          compact ? 'order-2' : 'order-1',
          compact
            ? 'h-10 min-w-[128px]'
            : 'h-12 w-[146px] max-sm:h-11 max-sm:w-[136px] max-sm:min-w-0 max-sm:px-2',
        )}
      >
        <span className="grid size-6 place-items-center rounded-sm bg-[linear-gradient(145deg,#38d98b_0_34%,#ffd052_35%_58%,#ff5d5d_59%_78%,#56a8ff_79%)]">
          <Play aria-hidden="true" className="size-3 fill-white text-white" />
        </span>
        <span className="text-left leading-none">
          <small className="block text-[8px] text-white/70">GET IT ON</small>
          <strong className={compact ? 'text-[13px]' : 'text-[15px]'}>Google Play</strong>
        </span>
      </span>
    </div>
  );
}

function StudentIllustration() {
  return <Image src="/assets/student.png" height={280} width={330} alt="student"></Image>;
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
                <header className="flex h-[70px] items-center justify-between border-b border-[#eceef4] bg-[linear-gradient(90deg,#f8f9ff,#f4f5ff)] px-4">
                  <span>
                    <strong className="block text-[11px] font-extrabold">سلام نیما محمدی 👋</strong>
                    <small className="mt-1 block text-[7px] text-[#80838c]">
                      خوش آمدید؛ امروز چه برنامه‌ای دارید؟
                    </small>
                  </span>
                  <span className="grid size-7 place-items-center rounded-full border border-[#e5e7ef] bg-white text-[#687080]">
                    <Bell aria-hidden="true" className="size-3.5" />
                  </span>
                </header>

                <main className="p-3">
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
                </main>
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

function SecurityArt() {
  return (
    <svg aria-hidden="true" className="h-36 w-44" viewBox="0 0 210 170">
      <defs>
        <linearGradient id="folder" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#eef2ff" />
          <stop offset="1" stopColor="#c8d2ff" />
        </linearGradient>
      </defs>
      <path
        d="M28 53c0-10 8-18 18-18h46l17 18h54c10 0 18 8 18 18v61c0 10-8 18-18 18H46c-10 0-18-8-18-18Z"
        fill="url(#folder)"
      />
      <path d="M65 73h81c10 0 18 9 16 19l-9 45H56l-8-45c-2-10 6-19 17-19Z" fill="#e4e9ff" />
      <path
        d="m105 69 34 13v29c0 22-15 36-34 43-19-7-34-21-34-43V82Z"
        fill="#6382ec"
        stroke="#fff"
        strokeWidth="5"
      />
      <path
        d="m91 111 10 10 19-22"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="7"
      />
      <circle cx="177" cy="36" fill="#dfe5ff" r="6" />
      <circle cx="192" cy="76" fill="#b6c3fb" r="4" />
      <circle cx="26" cy="32" fill="#dfe5ff" r="5" />
    </svg>
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
                href={dashboardSignupUrl}
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
      className="section-shell landing-section landing-section--spacious scroll-mt-24"
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
                href={dashboardSignupUrl}
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
      className="section-shell landing-section landing-section--compact scroll-mt-24"
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
      className="section-shell landing-section scroll-mt-24"
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
                href={dashboardSignupUrl}
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

function SecuritySection() {
  const badges = [
    { icon: LockKeyhole, label: 'رمزنگاری پیشرفته' },
    { icon: Server, label: 'سرورهای امن' },
    { icon: Globe2, label: 'سازگار با استانداردهای جهانی' },
  ] as const;

  return (
    <section
      aria-labelledby="security-title"
      className="section-shell landing-section landing-section--compact scroll-mt-24"
      id="security"
    >
      <Reveal>
        <div className="grid min-h-[190px] items-center gap-7 rounded-[26px] bg-[#f7f7f5] px-7 py-8 md:grid-cols-[.8fr_1fr_1.5fr] lg:px-12">
          <div className="flex justify-center">
            <SecurityArt />
          </div>
          <div className="text-center md:text-right">
            <h2 className="text-[24px] leading-[1.7] font-black text-[#242426]" id="security-title">
              اطلاعات شما در امن‌ترین وضعیت ممکن نگهداری می‌شود.
            </h2>
          </div>
          <RevealGroup
            className="flex flex-wrap justify-center gap-3 md:justify-start"
            stagger={0.07}
          >
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <RevealItem key={badge.label}>
                  <span className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-4 text-[11px] font-semibold text-[#4d4d52] shadow-[0_4px_14px_rgba(0,0,0,0.03)]">
                    <Icon aria-hidden="true" className="size-5 text-[#50545b]" strokeWidth={1.6} />
                    {badge.label}
                  </span>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </Reveal>
    </section>
  );
}

function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="section-shell landing-section landing-section--compact scroll-mt-24"
      id="final-cta"
    >
      <Reveal>
        <div className="rounded-[24px] bg-[linear-gradient(100deg,#ffe7ce,#fde0c1,#f9e5d2)] px-7 py-10 text-center sm:px-12 sm:py-12">
          <h2
            className="text-[26px] font-black tracking-[-0.03em] text-[#222] sm:text-[30px]"
            id="final-cta-title"
          >
            آینده تحصیلی شما از همین‌جا شروع می‌شود
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#6a5c52]">
            همین حالا ثبت‌نام کنید و یک قدم به دانشگاه رویایی‌تان نزدیک‌تر شوید.
          </p>
          <MotionLink
            className={buttonVariants({ className: 'mt-6 min-h-10 min-w-36 py-2' })}
            href={dashboardSignupUrl}
          >
            رایگان شروع کنید
            <ChevronLeft
              aria-hidden="true"
              className="size-4 transition-transform group-hover/button:-translate-x-1"
            />
          </MotionLink>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  const product = [
    ['ویژگی‌ها', '#how-it-works'],
    ['قیمت‌گذاری', '/pricing'],
    ['دانشگاه‌ها', '/universities'],
  ] as const;
  const resources = [
    ['راهنما', '/guide'],
    ['وبلاگ', '/blog'],
    ['سوالات متداول', '/faq'],
  ] as const;

  return (
    <footer className="landing-footer border-t border-black/[0.04]" id="footer">
      <div className="section-shell grid grid-cols-2 gap-8 lg:grid-cols-[1.35fr_.75fr_.75fr_.75fr_1.1fr] lg:gap-10">
        <div className="col-span-2 lg:col-span-1">
          <WaandLogo />
          <p className="mt-4 max-w-[250px] text-[12px] leading-6 text-[#69696f]">
            پلتفرم هوشمند اپلای دانشگاه با قدرت هوش مصنوعی
          </p>
          <div
            aria-label="شبکه‌های اجتماعی وآند"
            className="mt-5 flex items-center gap-4 text-[#38383b]"
          >
            <AtSign aria-hidden="true" className="size-4" />
            <MessageCircle aria-hidden="true" className="size-4" />
            <Send aria-hidden="true" className="size-4" />
          </div>
        </div>

        <div>
          <strong className="footer-title">محصول</strong>
          <ul className="footer-list">
            {product.map(([label, href]) => (
              <li key={label}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <strong className="footer-title">منابع</strong>
          <ul className="footer-list">
            {resources.map(([label, href]) => (
              <li key={label}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <strong className="footer-title">شرکت</strong>
          <ul className="footer-list">
            <li>
              <a href="/about">درباره ما</a>
            </li>
            <li>
              <a href="/contact">تماس با ما</a>
            </li>
            <li>
              <a href="/careers">فرصت‌های شغلی</a>
            </li>
          </ul>
        </div>

        <div>
          <strong className="footer-title">دانلود اپلیکیشن</strong>
          <div className="mt-4">
            <StoreBadges compact />
          </div>
        </div>
      </div>
      <p className="section-shell mt-4 border-t border-[#ededed] pt-3 text-center text-[11px] text-[#808087]">
        © ۱۴۰۵ وآند. تمامی حقوق محفوظ است.
      </p>
    </footer>
  );
}

export function LandingPage() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        پرش به محتوای اصلی
      </a>
      <LandingNavbar />
      <main id="main-content">
        <HeroSection />
        <HowItWorks />
        <AppPromo />
        <WhyWaand />
        <SecuritySection />
        <Testimonials />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
