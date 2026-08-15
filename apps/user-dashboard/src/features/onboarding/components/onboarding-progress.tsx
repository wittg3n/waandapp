import { Progress } from '@/components/ui/progress';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

export type OnboardingProgressProps = {
  className?: string;
  currentStep: number;
  labels: readonly [string, string, string, string];
};

export function OnboardingProgress({ className, currentStep, labels }: OnboardingProgressProps) {
  const step = Math.min(Math.max(currentStep, 0), labels.length - 1);

  return (
    <section
      aria-label="پیشرفت تکمیل اطلاعات"
      className={cn(
        'rounded-2xl border border-border/80 bg-white px-4 py-2.5 shadow-[0_8px_30px_rgba(20,30,55,0.04)] sm:px-5 sm:py-3',
        className,
      )}
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="truncate text-sm font-bold text-foreground">{labels[step]}</p>
        <p className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
          {formatNumber(step + 1)} از {formatNumber(labels.length)}
        </p>
      </div>
      <Progress
        aria-label={`${labels[step]}، ${formatNumber(step + 1)} از ${formatNumber(labels.length)}`}
        className="mt-2 h-1.5"
        value={((step + 1) / labels.length) * 100}
      />
    </section>
  );
}
