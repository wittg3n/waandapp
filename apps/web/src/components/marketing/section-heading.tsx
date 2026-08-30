import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function SectionHeading({
  align = 'start',
  className,
  description,
  eyebrow,
  id,
  title,
}: {
  align?: 'center' | 'start';
  className?: string;
  description?: ReactNode;
  eyebrow?: string;
  id?: string;
  title: ReactNode;
}) {
  return (
    <div className={cn(align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && (
        <span className="inline-flex rounded-full border border-[#dfe4ff] bg-[#f6f7ff] px-4 py-2 text-[11px] font-bold text-[#143CFB]">
          {eyebrow}
        </span>
      )}
      <h2 className={cn('section-title', eyebrow && 'mt-5')} id={id}>
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-4 max-w-[640px] text-[14px] leading-[2] text-[#696970] sm:text-[15px]',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
