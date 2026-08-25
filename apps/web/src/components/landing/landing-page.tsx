import Image from 'next/image';
import { FaInstagram, FaLinkedinIn, FaTelegramPlane, FaGithub, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import {
  Apple,
  ArrowRight,
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
  Landmark,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MessageCircle,
  Play,
  Send,
  Server,
  Settings,
  Sparkles,
  UserRound,
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
  FuturePortalMotion,
  JourneyAmbientMotion,
  JourneyCopyMotion,
  JourneyDecorationMotion,
  JourneyMilestoneMotion,
  JourneyPathMotion,
  JourneyScene,
  JourneyStartMotion,
  journeyPortalOutlineDelay,
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

type JourneyPoint = {
  bubbleX: number;
  bubbleY: number;
  x: number;
  y: number;
};

const journeySteps = [
  { accent: false, icon: UserRound, label: 'ساخت پروفایل' },
  { accent: true, icon: Landmark, label: 'انتخاب دانشگاه' },
  { accent: false, icon: FileText, label: 'آماده‌سازی درخواست' },
  { accent: false, icon: Mail, label: 'دریافت پذیرش' },
] as const;

const desktopJourneyPoints = [
  { bubbleX: 446, bubbleY: 211, x: 446, y: 306 },
  { bubbleX: 632, bubbleY: 198, x: 632, y: 286 },
  { bubbleX: 812, bubbleY: 166, x: 812, y: 253 },
  { bubbleX: 982, bubbleY: 143, x: 982, y: 226 },
] as const satisfies readonly JourneyPoint[];

const tabletJourneyPoints = [
  { bubbleX: 265, bubbleY: 154, x: 265, y: 215 },
  { bubbleX: 380, bubbleY: 137, x: 380, y: 198 },
  { bubbleX: 500, bubbleY: 119, x: 500, y: 180 },
  { bubbleX: 615, bubbleY: 104, x: 615, y: 165 },
] as const satisfies readonly JourneyPoint[];

const mobileJourneyPoints = [
  { bubbleX: 94, bubbleY: 215, x: 190, y: 235 },
  { bubbleX: 294, bubbleY: 335, x: 172, y: 355 },
  { bubbleX: 96, bubbleY: 455, x: 218, y: 475 },
  { bubbleX: 294, bubbleY: 565, x: 190, y: 585 },
] as const satisfies readonly JourneyPoint[];

const desktopJourneyMilestones = journeySteps.map((step, index) => ({
  ...step,
  ...desktopJourneyPoints[index]!,
}));

const tabletJourneyMilestones = journeySteps.map((step, index) => ({
  ...step,
  ...tabletJourneyPoints[index]!,
}));

const mobileJourneyMilestones = journeySteps.map((step, index) => ({
  ...step,
  ...mobileJourneyPoints[index]!,
}));

const desktopJourneyPath =
  'M 312 356 C 352 356 398 334 446 306 C 500 275 550 271 594 280 C 611 284 622 289 632 286 C 690 282 746 272 812 253 C 870 231 926 220 982 226 C 1050 233 1125 244 1194 249';

const tabletJourneyPath =
  'M 170 245 C 205 245 235 229 265 215 C 310 194 342 194 380 198 C 425 202 463 188 500 180 C 545 166 580 160 615 165 C 652 170 680 176 706 176';

const mobileJourneyPath =
  'M 195 156 C 195 190 205 215 190 235 C 173 275 150 320 172 355 C 190 400 236 442 218 475 C 200 516 168 557 190 585 C 207 620 201 672 195 708';

function JourneyDefs({ prefix, vertical = false }: { prefix: string; vertical?: boolean }) {
  return (
    <defs>
      <linearGradient
        id={prefix + '-path-gradient'}
        x1={vertical ? '50%' : '0%'}
        x2={vertical ? '50%' : '100%'}
        y1="0%"
        y2={vertical ? '100%' : '0%'}
      >
        <stop offset="0%" stopColor="#143CFB" />
        <stop offset="18%" stopColor="#143CFB" />
        <stop offset="45%" stopColor="#6B84F7" />
        <stop offset="74%" stopColor="#A5B4F4" />
        <stop offset="100%" stopColor="#D0D7F2" />
      </linearGradient>
      <linearGradient id={prefix + '-arch-stroke'} x1="0%" x2="100%" y1="0%" y2="0%">
        <stop offset="0%" stopColor="#353A4B" stopOpacity="0.42" />
        <stop offset="48%" stopColor="#F8F9FC" />
        <stop offset="100%" stopColor="#143CFB" stopOpacity="0.92" />
      </linearGradient>
      <linearGradient id={prefix + '-portal-shell'} x1="0%" x2="100%" y1="0%" y2="0%">
        <stop offset="0%" stopColor="#E9EBF1" />
        <stop offset="46%" stopColor="#FFFFFF" />
        <stop offset="82%" stopColor="#F5F7FF" />
        <stop offset="100%" stopColor="#D9E1FF" />
      </linearGradient>
      <radialGradient id={prefix + '-portal-interior'} cx="38%" cy="76%" r="78%">
        <stop offset="0%" stopColor="#FFF2D9" stopOpacity="0.62" />
        <stop offset="46%" stopColor="#FFFFFF" stopOpacity="0.98" />
        <stop offset="100%" stopColor="#FAFBFF" />
      </radialGradient>
      <linearGradient id={prefix + '-beam'} x1="54%" x2="42%" y1="0%" y2="100%">
        <stop offset="0%" stopColor="#FFF3DA" stopOpacity="0.38" />
        <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#DDE5FF" stopOpacity="0.02" />
      </linearGradient>
      <pattern height="10" id={prefix + '-dots'} patternUnits="userSpaceOnUse" width="10">
        <circle cx="2" cy="2" fill="#143CFB" r="1.2" />
      </pattern>
      <filter
        colorInterpolationFilters="sRGB"
        height="180%"
        id={prefix + '-path-glow'}
        width="180%"
        x="-40%"
        y="-40%"
      >
        <feGaussianBlur stdDeviation="4" />
      </filter>
      <filter
        colorInterpolationFilters="sRGB"
        height="220%"
        id={prefix + '-bubble-shadow'}
        width="220%"
        x="-60%"
        y="-45%"
      >
        <feDropShadow dx="0" dy="5" floodColor="#52659A" floodOpacity="0.1" stdDeviation="5.5" />
      </filter>
      <filter
        colorInterpolationFilters="sRGB"
        height="220%"
        id={prefix + '-portal-glow'}
        width="220%"
        x="-60%"
        y="-60%"
      >
        <feGaussianBlur stdDeviation="13" />
      </filter>
      <filter
        colorInterpolationFilters="sRGB"
        height="180%"
        id={prefix + '-beam-blur'}
        width="180%"
        x="-40%"
        y="-35%"
      >
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>
  );
}

function JourneyStartCard() {
  return (
    <JourneyStartMotion className="relative h-[156px] w-[224px] rounded-[17px] border border-[#DCE4FF]/70 bg-white/96 p-4 shadow-[0_16px_44px_rgba(31,52,121,0.09)] backdrop-blur-md">
      <span
        aria-hidden="true"
        className="absolute -bottom-4 left-1/2 h-8 w-[68%] -translate-x-1/2 rounded-full bg-[#143CFB]/9 blur-2xl"
      />
      <div className="relative flex items-center gap-2.5" dir="ltr">
        <WaandLogo markClassName="size-7" showWordmark={false} />
        <strong className="text-[18px] font-extrabold tracking-[-0.035em] text-[#252B45]">
          Waand
        </strong>
      </div>
      <div aria-hidden="true" className="relative mt-3 space-y-1.5">
        <span className="block h-1.5 w-[70%] rounded-full bg-[#E9EDF7]" />
        <span className="block h-1.5 w-[52%] rounded-full bg-[#EFF2F8]" />
        <span className="block h-1.5 w-[36%] rounded-full bg-[#F3F5FA]" />
      </div>
      <MotionLink
        aria-label="شروع رایگان مسیر اپلای در وآند"
        className="group/journey-button relative mt-3 flex h-9 w-[72%] items-center justify-center overflow-hidden rounded-[10px] bg-[linear-gradient(90deg,#143CFB,#2452FF)] text-white shadow-[0_7px_18px_rgba(20,60,251,0.2)] transition-shadow duration-300 hover:shadow-[0_10px_22px_rgba(20,60,251,0.27)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#143CFB]"
        hoverScale={1.01}
        href={dashboardSignupUrl}
        tapScale={0.985}
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/20 transition-transform duration-700 ease-out group-hover/journey-button:translate-x-[470%]"
        />
        <ArrowRight
          aria-hidden="true"
          className="relative size-4 transition-transform duration-300 group-hover/journey-button:translate-x-0.5"
          strokeWidth={1.8}
        />
      </MotionLink>
    </JourneyStartMotion>
  );
}

type JourneyMilestoneItem = (typeof journeySteps)[number] & JourneyPoint;

function JourneyMilestones({
  items,
  prefix,
  radius = 29.5,
}: {
  items: ReadonlyArray<JourneyMilestoneItem>;
  prefix: string;
  radius?: number;
}) {
  const iconSize = radius * 0.76;

  return items.map((milestone, index) => {
    const Icon = milestone.icon;

    return (
      <JourneyMilestoneMotion
        accent={milestone.accent}
        bubbleX={milestone.bubbleX}
        bubbleY={milestone.bubbleY}
        filter={'url(#' + prefix + '-bubble-shadow)'}
        index={index}
        key={milestone.label}
        radius={radius}
        x={milestone.x}
        y={milestone.y}
      >
        <Icon
          aria-hidden="true"
          color="#596176"
          height={iconSize}
          strokeWidth={1.5}
          width={iconSize}
          x={milestone.bubbleX - iconSize / 2}
          y={milestone.bubbleY - iconSize / 2}
        />
      </JourneyMilestoneMotion>
    );
  });
}

type PortalGeometry = {
  base: number;
  beam: string;
  center: number;
  left: number;
  pathX: number;
  pathY: number;
  right: number;
  shoulder: number;
  top: number;
};

const desktopPortal: PortalGeometry = {
  base: 266,
  beam: 'M 1192 254 L 1307 263 L 1436 425 L 760 480 Z',
  center: 1248,
  left: 1188,
  pathX: 1194,
  pathY: 249,
  right: 1308,
  shoulder: 164,
  top: 76,
};

const tabletPortal: PortalGeometry = {
  base: 190,
  beam: 'M 704 177 L 808 188 L 820 296 L 430 320 Z',
  center: 754,
  left: 700,
  pathX: 706,
  pathY: 176,
  right: 808,
  shoulder: 105,
  top: 45,
};

const mobilePortal: PortalGeometry = {
  base: 752,
  beam: 'M 151 714 L 239 714 L 286 759 L 104 759 Z',
  center: 195,
  left: 140,
  pathX: 195,
  pathY: 708,
  right: 250,
  shoulder: 687,
  top: 635,
};

function portalOutline({
  base,
  center,
  left,
  right,
  shoulder,
  top,
}: Pick<PortalGeometry, 'base' | 'center' | 'left' | 'right' | 'shoulder' | 'top'>) {
  return [
    'M',
    left,
    base,
    'V',
    shoulder,
    'C',
    left,
    top + 26,
    center - 28,
    top,
    center,
    top,
    'C',
    center + 28,
    top,
    right,
    top + 26,
    right,
    shoulder,
    'V',
    base,
  ].join(' ');
}

function portalRightEdge({
  base,
  center,
  right,
  shoulder,
  top,
}: Pick<PortalGeometry, 'base' | 'center' | 'right' | 'shoulder' | 'top'>) {
  return [
    'M',
    center,
    top,
    'C',
    center + 28,
    top,
    right,
    top + 26,
    right,
    shoulder,
    'V',
    base,
  ].join(' ');
}

function FuturePortal({ geometry, prefix }: { geometry: PortalGeometry; prefix: string }) {
  const outerOutline = portalOutline(geometry);
  const innerGeometry = {
    base: geometry.base,
    center: geometry.center,
    left: geometry.left + 15,
    right: geometry.right - 15,
    shoulder: geometry.shoulder + 3,
    top: geometry.top + 17,
  };
  const innerOutline = portalOutline(innerGeometry);
  const outerFill = outerOutline + ' H ' + geometry.left + ' Z';
  const innerFill = innerOutline + ' H ' + innerGeometry.left + ' Z';
  const rimFill = outerFill + ' ' + innerFill;
  const rightEdge = portalRightEdge(geometry);
  const portalHeight = geometry.base - geometry.top;
  const portalWidth = geometry.right - geometry.left;

  return (
    <>
      <FuturePortalMotion stage="beam">
        <path
          d={geometry.beam}
          fill="#9DAFFF"
          filter={'url(#' + prefix + '-beam-blur)'}
          opacity="0.09"
        />
        <path
          d={geometry.beam}
          fill={'url(#' + prefix + '-beam)'}
          filter={'url(#' + prefix + '-beam-blur)'}
          opacity="0.56"
        />
      </FuturePortalMotion>
      <FuturePortalMotion stage="glow">
        <ellipse
          cx={geometry.center + portalWidth * 0.18}
          cy={geometry.top + portalHeight * 0.5}
          fill="#143CFB"
          filter={'url(#' + prefix + '-portal-glow)'}
          opacity="0.08"
          rx={portalWidth * 0.64}
          ry={portalHeight * 0.58}
        />
        <ellipse
          cx={geometry.center - portalWidth * 0.08}
          cy={geometry.top + portalHeight * 0.58}
          fill="#FFE1AE"
          filter={'url(#' + prefix + '-portal-glow)'}
          opacity="0.18"
          rx={portalWidth * 0.44}
          ry={portalHeight * 0.44}
        />
        <path
          d={outerOutline}
          fill="none"
          filter={'url(#' + prefix + '-portal-glow)'}
          opacity="0.18"
          stroke="#143CFB"
          strokeWidth="10"
        />
      </FuturePortalMotion>
      <FuturePortalMotion stage="outline">
        <path
          d={rightEdge}
          fill="none"
          opacity="0.14"
          stroke="#143CFB"
          strokeLinecap="round"
          strokeWidth="8"
          transform="translate(5 2)"
        />
        <path
          clipRule="evenodd"
          d={rimFill}
          fill={'url(#' + prefix + '-portal-shell)'}
          fillRule="evenodd"
        />
        <path d={innerFill} fill={'url(#' + prefix + '-portal-interior)'} />
      </FuturePortalMotion>
      <JourneyPathMotion
        d={outerOutline}
        delay={journeyPortalOutlineDelay}
        duration={1.02}
        opacity={0.92}
        stroke={'url(#' + prefix + '-arch-stroke)'}
        strokeWidth={3.2}
      />
      <JourneyPathMotion
        d={innerOutline}
        delay={journeyPortalOutlineDelay + 0.12}
        duration={0.8}
        opacity={0.44}
        stroke="#353A4B"
        strokeWidth={1.35}
      />
      <JourneyPathMotion
        d={rightEdge}
        delay={journeyPortalOutlineDelay + 0.08}
        duration={0.84}
        opacity={0.84}
        stroke="#143CFB"
        strokeWidth={3.4}
      />
      <FuturePortalMotion stage="endpoint">
        <circle
          cx={geometry.pathX}
          cy={geometry.pathY}
          fill="#FFFFFF"
          filter={'url(#' + prefix + '-bubble-shadow)'}
          r="6"
        />
        <circle cx={geometry.pathX} cy={geometry.pathY} fill="#DCE5FF" r="2.8" />
      </FuturePortalMotion>
      <FuturePortalMotion stage="pulse">
        <circle
          cx={geometry.pathX}
          cy={geometry.pathY}
          fill="none"
          r="10"
          stroke="#143CFB"
          strokeOpacity="0.42"
          strokeWidth="1.6"
        />
      </FuturePortalMotion>
      <FuturePortalMotion stage="sparkles">
        <path
          d={
            'M ' +
            (geometry.right + 30) +
            ' ' +
            (geometry.top + 36) +
            ' l 3 6 6 3 -6 3 -3 6 -3 -6 -6 -3 6 -3 Z'
          }
          fill="#FFFFFF"
          opacity="0.82"
        />
        <circle
          cx={geometry.right + 48}
          cy={geometry.shoulder + 14}
          fill="#394052"
          opacity="0.34"
          r="2"
        />
        <path
          d={
            'M ' +
            (geometry.left - 24) +
            ' ' +
            (geometry.top + 20) +
            ' l 2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2 Z'
          }
          fill="#CAD4FF"
          opacity="0.42"
        />
      </FuturePortalMotion>
    </>
  );
}

function DesktopJourneyDecorations() {
  return (
    <>
      <JourneyDecorationMotion depth={3.5} index={0}>
        <path
          d="M 360 105 C 360 94 369 86 380 86 C 386 73 405 73 412 88 C 425 87 433 96 433 106 Z"
          fill="none"
          opacity="0.2"
          stroke="#9EB2FF"
          strokeWidth="2"
        />
      </JourneyDecorationMotion>
      <JourneyDecorationMotion depth={4} index={1}>
        <circle cx="82" cy="242" fill="#F4C379" opacity="0.38" r="5" />
      </JourneyDecorationMotion>
      <JourneyDecorationMotion depth={2.5} index={2}>
        <rect
          fill="url(#desktop-journey-dots)"
          height="56"
          opacity="0.19"
          width="76"
          x="45"
          y="348"
        />
        <rect
          fill="url(#desktop-journey-dots)"
          height="56"
          opacity="0.24"
          width="76"
          x="1350"
          y="350"
        />
      </JourneyDecorationMotion>
      <JourneyDecorationMotion depth={3} index={3}>
        <circle
          cx="950"
          cy="70"
          fill="none"
          opacity="0.3"
          r="8"
          stroke="#F2BC6E"
          strokeWidth="1.5"
        />
        <path
          d="M 1382 208 l 7 7 -7 7 -7 -7 Z"
          fill="none"
          opacity="0.24"
          stroke="#143CFB"
          strokeWidth="1.7"
        />
      </JourneyDecorationMotion>
    </>
  );
}

function MobileJourneyDecorations() {
  return (
    <>
      <JourneyDecorationMotion depth={2} index={0}>
        <path
          d="M 34 286 l 7 7 -7 7 -7 -7 Z"
          fill="none"
          opacity="0.24"
          stroke="#143CFB"
          strokeWidth="1.5"
        />
        <circle cx="358" cy="444" fill="#F4C379" opacity="0.3" r="4" />
      </JourneyDecorationMotion>
      <JourneyDecorationMotion depth={2.5} index={1}>
        <rect
          fill="url(#mobile-journey-dots)"
          height="46"
          opacity="0.22"
          width="56"
          x="15"
          y="655"
        />
      </JourneyDecorationMotion>
    </>
  );
}

function DesktopJourney() {
  return (
    <div className="relative hidden aspect-[3/1] w-full xl:block">
      <JourneyCopyMotion className="absolute left-[6%] top-[3%] z-30 w-[24%] max-w-[360px] text-right [direction:rtl]">
        <h2
          className="text-[clamp(1.15rem,1.8vw,1.9rem)] font-black leading-[1.55] tracking-[-0.035em] text-[#171717]"
          aria-hidden="true"
        >
          آینده تحصیلی شما
          <span className="block text-[#143CFB]">از همین‌جا شروع می‌شود</span>
        </h2>
        <p className="mt-1.5 hidden text-[12px] leading-6 text-[#777B87] xl:block">
          از اولین قدم تا پذیرش، مسیرتان روشن است.
        </p>
      </JourneyCopyMotion>

      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full overflow-visible"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 1440 480"
      >
        <JourneyDefs prefix="desktop-journey" />
        <DesktopJourneyDecorations />
        <FuturePortal geometry={desktopPortal} prefix="desktop-journey" />

        <JourneyPathMotion
          d={desktopJourneyPath}
          filter="url(#desktop-journey-path-glow)"
          opacity={0.1}
          stroke="url(#desktop-journey-path-gradient)"
          strokeWidth={11}
        />
        <JourneyPathMotion
          d={desktopJourneyPath}
          opacity={0.5}
          stroke="#B8C6F7"
          strokeWidth={5.6}
        />
        <JourneyPathMotion
          d={desktopJourneyPath}
          stroke="url(#desktop-journey-path-gradient)"
          strokeWidth={3.2}
        />

        <circle cx="312" cy="356" fill="#FFFFFF" r="7.5" />
        <circle cx="312" cy="356" fill="#FFFFFF" r="5.2" stroke="#143CFB" strokeWidth="2.7" />

        <JourneyMilestones items={desktopJourneyMilestones} prefix="desktop-journey" />
      </svg>

      <div className="absolute right-[78.9%] top-[58.5%] z-30 origin-top-right scale-[0.68] xl:scale-[0.8] 2xl:scale-[0.84]">
        <JourneyStartCard />
      </div>
    </div>
  );
}

function TabletJourney() {
  return (
    <div className="relative mx-auto hidden aspect-[41/16] w-full max-w-[1000px] md:block xl:hidden">
      <JourneyCopyMotion className="absolute left-[4.5%] top-[4%] z-30 w-[32%] max-w-[270px] text-right [direction:rtl]">
        <h2
          className="text-[clamp(1.1rem,2.7vw,1.4rem)] font-black leading-[1.52] tracking-[-0.035em] text-[#171717]"
          aria-hidden="true"
        >
          آینده تحصیلی شما
          <span className="block text-[#143CFB]">از همین‌جا شروع می‌شود</span>
        </h2>
        <p className="mt-1 text-[11px] leading-5 text-[#777B87]">
          از اولین قدم تا پذیرش، مسیرتان روشن است.
        </p>
      </JourneyCopyMotion>

      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full overflow-visible"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 820 320"
      >
        <JourneyDefs prefix="tablet-journey" />
        <JourneyDecorationMotion depth={2.5} index={0}>
          <circle
            cx="590"
            cy="54"
            fill="none"
            opacity="0.22"
            r="5.5"
            stroke="#F2BC6E"
            strokeWidth="1.2"
          />
        </JourneyDecorationMotion>
        <JourneyDecorationMotion depth={2} index={1}>
          <rect
            fill="url(#tablet-journey-dots)"
            height="36"
            opacity="0.16"
            width="44"
            x="24"
            y="268"
          />
        </JourneyDecorationMotion>
        <FuturePortal geometry={tabletPortal} prefix="tablet-journey" />

        <JourneyPathMotion
          d={tabletJourneyPath}
          filter="url(#tablet-journey-path-glow)"
          opacity={0.09}
          stroke="url(#tablet-journey-path-gradient)"
          strokeWidth={10}
        />
        <JourneyPathMotion
          d={tabletJourneyPath}
          opacity={0.48}
          stroke="#B8C6F7"
          strokeWidth={5}
        />
        <JourneyPathMotion
          d={tabletJourneyPath}
          stroke="url(#tablet-journey-path-gradient)"
          strokeWidth={3}
        />

        <circle cx="170" cy="245" fill="#FFFFFF" r="6.5" />
        <circle cx="170" cy="245" fill="#FFFFFF" r="4.5" stroke="#143CFB" strokeWidth="2.4" />

        <JourneyMilestones
          items={tabletJourneyMilestones}
          prefix="tablet-journey"
          radius={25.5}
        />
      </svg>

      <div className="absolute right-[80%] top-[51.5%] z-30 origin-top-right scale-[0.64] lg:scale-[0.72]">
        <JourneyStartCard />
      </div>
    </div>
  );
}

function MobileJourney() {
  return (
    <div className="md:hidden">
      <JourneyCopyMotion className="relative z-30 mx-auto max-w-[350px] px-2 text-right [direction:rtl]">
        <h2
          className="text-[clamp(1.75rem,7.2vw,2.1rem)] font-black leading-[1.48] tracking-[-0.045em] text-[#171717]"
          aria-hidden="true"
        >
          آینده تحصیلی شما
          <span className="block text-[#143CFB]">از همین‌جا شروع می‌شود</span>
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#747782]">
          از اولین قدم تا پذیرش، مسیرتان روشن است.
        </p>
      </JourneyCopyMotion>

      <div className="relative mx-auto mt-7 aspect-[39/76] w-full max-w-[390px]">
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          focusable="false"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 390 760"
        >
          <JourneyDefs prefix="mobile-journey" vertical />
          <MobileJourneyDecorations />
          <FuturePortal geometry={mobilePortal} prefix="mobile-journey" />

          <JourneyPathMotion
            d={mobileJourneyPath}
            filter="url(#mobile-journey-path-glow)"
            opacity={0.09}
            stroke="url(#mobile-journey-path-gradient)"
            strokeWidth={10}
          />
          <JourneyPathMotion
            d={mobileJourneyPath}
            opacity={0.48}
            stroke="#BCC9FF"
            strokeWidth={5}
          />
          <JourneyPathMotion
            d={mobileJourneyPath}
            stroke="url(#mobile-journey-path-gradient)"
            strokeWidth={3}
          />

          <circle cx="195" cy="156" fill="#FFFFFF" r="8" />
          <circle cx="195" cy="156" fill="#FFFFFF" r="5.3" stroke="#143CFB" strokeWidth="3" />

          <JourneyMilestones items={mobileJourneyMilestones} prefix="mobile-journey" radius={27.5} />
        </svg>

        <div className="absolute left-1/2 top-0 z-30 origin-top -translate-x-1/2 scale-[0.79] min-[340px]:scale-[0.84] min-[360px]:scale-[0.89] min-[380px]:scale-[0.96] min-[407px]:scale-100">
          <JourneyStartCard />
        </div>
      </div>
    </div>
  );
}

function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="relative isolate scroll-mt-24 overflow-hidden bg-background py-[clamp(3.75rem,7vw,6.25rem)] md:py-12 lg:py-[clamp(2.25rem,3.2vw,3.5rem)]"
      id="final-cta"
    >
      <h2 className="sr-only" id="final-cta-title">
        آینده تحصیلی شما از همین‌جا شروع می‌شود
      </h2>

      <JourneyScene
        aria-label="مسیر اپلای از شروع با وآند تا ساخت پروفایل، انتخاب دانشگاه، آماده‌سازی درخواست، دریافت پذیرش و ورود به آینده"
        className="relative mx-auto w-[min(96vw,1500px)]"
        dir="ltr"
      >
        <JourneyAmbientMotion className="pointer-events-none absolute inset-0 -z-10">
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_48%_52%,rgba(20,60,251,0.03),transparent_34%),radial-gradient(circle_at_84%_45%,rgba(250,219,174,0.08),transparent_24%),radial-gradient(circle_at_12%_18%,rgba(178,185,255,0.045),transparent_26%)]" />
        </JourneyAmbientMotion>

        <DesktopJourney />
        <TabletJourney />
        <MobileJourney />

        <ol className="sr-only" dir="rtl">
          {journeySteps.map((step) => (
            <li key={step.label}>{step.label}</li>
          ))}
        </ol>
      </JourneyScene>
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
            پلتفرم هوشمند اپلای دانشگاه
          </p>
          <div
            aria-label="شبکه‌های اجتماعی وآند"
            className="mt-5 flex items-center gap-4 text-[#38383b]"
          >
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/waandapp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Waand on X"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <FaXTwitter className="size-5" />
              </a>

              <a
                href="https://instagram.com/waandapp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Waand on Instagram"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <FaInstagram className="size-5" />
              </a>

              <a
                href="https://github.com/waandapp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Waand on GitHub"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <FaGithub className="size-5" />
              </a>

              <a
                href="https://youtube.com/@waandapp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Waand on YouTube"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <FaYoutube className="size-5" />
              </a>

              <a
                href="https://t.me/waandapp"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Waand on Telegram"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <FaTelegramPlane className="size-5" />
              </a>
            </div>
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
