import { Clock3, Sparkles } from 'lucide-react';

export function WelcomeStep({ firstName }: { firstName?: string }) {
  return (
    <div className="py-3 text-center sm:py-6">
      <span className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_16px_40px_rgba(20,60,251,0.22)]">
        <Sparkles aria-hidden="true" className="size-7" strokeWidth={1.7} />
      </span>
      <p className="mb-2 text-sm font-bold text-primary">شروع مسیر اپلای با وآند</p>
      <h1
        className="text-[28px] font-black tracking-tight text-foreground outline-none sm:text-[34px]"
        id="onboarding-step-title"
        tabIndex={-1}
      >
        {firstName ? `خوش آمدید، ${firstName}` : 'خوش آمدید'}
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-[15px] leading-8 text-muted-foreground sm:text-base">
        با چند سؤال کوتاه، پیشنهادهای دانشگاهی اولیه را متناسب با پروفایل شما آماده می‌کنیم.
      </p>
      <div className="mx-auto mt-7 flex w-fit items-center gap-2 rounded-full border border-primary/10 bg-primary/[0.045] px-4 py-2 text-xs font-semibold text-primary">
        <Clock3 aria-hidden="true" className="size-4" />
        کمتر از ۳ دقیقه
      </div>
    </div>
  );
}
