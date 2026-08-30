import type { ComponentPropsWithoutRef } from 'react';
import { useId } from 'react';

import { cn } from '@/lib/utils';

type WaandLogoProps = ComponentPropsWithoutRef<'span'> & {
  markClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
};

export function WaandLogo({
  'aria-label': ariaLabel = 'وآند',
  className,
  markClassName,
  showWordmark = true,
  wordmarkClassName,
  ...props
}: WaandLogoProps) {
  const id = useId().replaceAll(':', '');

  return (
    <span
      aria-label={ariaLabel}
      className={cn('inline-flex items-center gap-2.5', className)}
      role="img"
      {...props}
    >
      <svg
        aria-hidden="true"
        className={cn('size-8 shrink-0 overflow-hidden rounded-[22%]', markClassName)}
        focusable="false"
        viewBox="0 0 1212 1212"
      >
        <defs>
          <linearGradient id={`${id}-background`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#2658FC" />
            <stop offset="1" stopColor="#143CFB" />
          </linearGradient>
          <filter id={`${id}-edge`} x="-4%" y="-4%" width="108%" height="108%">
            <feDropShadow
              dx="0"
              dy="1"
              floodColor="#1639DC"
              floodOpacity="0.42"
              stdDeviation="1.15"
            />
          </filter>
        </defs>
        <rect fill={`url(#${id}-background)`} height="1212" width="1212" />
        <path
          d="M276 230 269 242 356 395 352 405H183L170 418v92l13 12h167l5 5-89 159v5l13 16 64 37 18-8 98-163 7 1 106 176 172 293 141 238h137L986 1211 768 848 576 531v-6l5-4h172l12-10v-95l-11-11H582l-5-4v-7l84-141v-14l-10-12-66-38-14 6-101 159-7-1-98-161-16-2z"
          fill="#fff"
          filter={`url(#${id}-edge)`}
          stroke="#1A46EA"
          strokeLinejoin="round"
          strokeOpacity="0.32"
        />
      </svg>
      {showWordmark && (
        <strong
          aria-hidden="true"
          className={cn(
            'text-[25px] font-black tracking-[-0.05em] text-[#121212]',
            wordmarkClassName,
          )}
        >
          وآند
        </strong>
      )}
    </span>
  );
}
