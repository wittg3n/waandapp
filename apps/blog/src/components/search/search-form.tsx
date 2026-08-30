import { ArrowLeft, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function SearchForm({
  className,
  defaultValue = '',
  compact = false,
}: {
  className?: string;
  defaultValue?: string;
  compact?: boolean;
}) {
  return (
    <form
      action="/search"
      className={cn(
        'flex w-full items-center gap-2 rounded-2xl border border-[#dfdfe2] bg-white p-1.5 shadow-[0_12px_36px_rgba(25,30,68,0.08)]',
        compact ? 'max-w-2xl' : 'max-w-xl',
        className,
      )}
      method="get"
      role="search"
    >
      <label className="sr-only" htmlFor={compact ? 'archive-search' : 'hero-search'}>
        جست‌وجو در وبلاگ
      </label>
      <Search aria-hidden="true" className="ms-3 size-5 shrink-0 text-[#76767c]" />
      <Input
        className="min-h-11 flex-1 border-0 px-1 text-[#202024] shadow-none focus-visible:ring-0"
        defaultValue={defaultValue}
        id={compact ? 'archive-search' : 'hero-search'}
        maxLength={100}
        name="q"
        placeholder="مثلاً بورسیه، انگیزه‌نامه یا انتخاب دانشگاه"
        type="search"
      />
      <Button className="focus-ring" type="submit">
        <span className="hidden sm:inline">جست‌وجو</span>
        <ArrowLeft aria-hidden="true" className="size-4" />
      </Button>
    </form>
  );
}
