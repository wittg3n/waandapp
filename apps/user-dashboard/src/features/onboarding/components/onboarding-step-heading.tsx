import type { LucideIcon } from 'lucide-react';

export function OnboardingStepHeading({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <header className="mb-4 flex items-start gap-3 text-right sm:mb-5">
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary sm:size-10">
        <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <h1
          className="text-xl font-extrabold tracking-tight text-foreground outline-none sm:text-[24px]"
          id="onboarding-step-title"
          tabIndex={-1}
        >
          {title}
        </h1>
        <p className="mt-0.5 max-w-xl text-xs leading-5 text-muted-foreground sm:text-sm">
          {description}
        </p>
      </div>
    </header>
  );
}
