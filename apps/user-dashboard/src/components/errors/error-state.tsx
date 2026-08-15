import { ArrowRight, CircleAlert, House, RefreshCcw, SearchX, WifiOff } from 'lucide-react';
import { useId, type HTMLAttributes, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export type ErrorStateVariant = 'default' | 'network' | 'not-found' | 'critical';

export type ErrorStateProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  title: ReactNode;
  description?: ReactNode;
  retry?: () => void;
  goBack?: () => void;
  goHome?: () => void;
  variant?: ErrorStateVariant;
};

const icons = {
  default: CircleAlert,
  network: WifiOff,
  'not-found': SearchX,
  critical: CircleAlert,
} satisfies Record<ErrorStateVariant, typeof CircleAlert>;

const iconTones: Record<ErrorStateVariant, string> = {
  default: 'bg-[#eef2ff] text-primary',
  network: 'bg-[#eef7ff] text-[#1769aa]',
  'not-found': 'bg-[#f3f4f6] text-[#4b5563]',
  critical: 'bg-[#fff0ee] text-[#b42318]',
};

export function ErrorState({
  className,
  description,
  goBack,
  goHome,
  retry,
  title,
  variant = 'default',
  ...props
}: ErrorStateProps) {
  const titleId = useId();
  const descriptionId = useId();
  const Icon = icons[variant];

  return (
    <section
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={cn(
        'mx-auto flex w-full max-w-xl flex-col items-center rounded-[28px] border border-[#e4e7ec] bg-white px-6 py-10 text-center shadow-[0_18px_50px_rgba(15,23,42,0.07)] sm:px-10 sm:py-12',
        className,
      )}
      dir="rtl"
      role="alert"
      {...props}
    >
      <span className={cn('grid size-16 place-items-center rounded-2xl', iconTones[variant])}>
        <Icon aria-hidden="true" className="size-8" strokeWidth={1.8} />
      </span>

      <h1 className="mt-6 text-2xl font-black leading-10 text-foreground" id={titleId}>
        {title}
      </h1>

      {description && (
        <p className="mt-2 max-w-md text-base leading-8 text-muted-foreground" id={descriptionId}>
          {description}
        </p>
      )}

      {(retry || goBack || goHome) && (
        <>
          <Separator className="mt-8 max-w-xs" />
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {retry && (
              <Button className="gap-2" onClick={retry}>
                <RefreshCcw aria-hidden="true" className="size-4" />
                تلاش دوباره
              </Button>
            )}
            {goHome && (
              <Button className="gap-2" onClick={goHome} variant={retry ? 'outline' : 'default'}>
                <House aria-hidden="true" className="size-4" />
                صفحه اصلی
              </Button>
            )}
            {goBack && (
              <Button className="gap-2" onClick={goBack} variant="outline">
                <ArrowRight aria-hidden="true" className="size-4" />
                بازگشت
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
