import { Bell, Mail, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';

import { AuthLogo } from '@/components/auth/auth-logo';
import { DashboardMobileNav } from '@/components/layout/dashboard-mobile-nav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/features/auth/auth-context';
import { getIranianAcademicFieldName } from '@/data/iran';

function SearchBox() {
  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const query = String(form.get('query') ?? '').trim();

    if (query) {
      toast.info('جست‌وجوی یکپارچه به‌زودی فعال می‌شود.');
    }
  }

  return (
    <form className="relative w-full max-w-[470px]" onSubmit={submitSearch} role="search">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute start-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
        strokeWidth={1.8}
      />

      <Input
        dir="rtl"
        aria-label="جستجو"
        className="h-11 rounded-xl border-[#e1e5eb] bg-[#fbfcfd] ps-11 pe-4 text-sm shadow-none focus-visible:bg-white lg:h-10"
        name="query"
        placeholder="جستجو در دانشگاه‌ها، رشته‌ها و اپلیکیشن‌ها"
        type="search"
      />
    </form>
  );
}

function UserControls() {
  const { user } = useAuth();
  const userName = user?.fullName || 'کاربر وآند';
  const degreeLabels: Record<string, string> = {
    diploma: 'دیپلم',
    associate: 'کاردانی',
    bachelor: 'کارشناسی',
    master: 'کارشناسی ارشد',
    'professional-doctorate': 'دکتری حرفه‌ای',
    phd: 'دکتری تخصصی',
  };
  const degree = user?.initialProfile?.currentDegree;
  const fieldName = user?.initialProfile
    ? getIranianAcademicFieldName(user.initialProfile.fieldId)
    : undefined;
  const subtitle =
    [degree ? (degreeLabels[degree] ?? degree) : undefined, fieldName]
      .filter(Boolean)
      .join(' · ') || 'متقاضی اپلای';
  const initials = userName.trim().slice(0, 2);

  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label="پیام‌ها"
            className="relative size-11 rounded-xl text-[#4f5661] sm:size-10"
            onClick={() => toast.info('هنوز پیام جدیدی ندارید.')}
            size="icon"
            variant="ghost"
          >
            <Mail aria-hidden="true" className="size-[19px]" strokeWidth={1.8} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>پیام‌ها</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label="اعلان‌ها"
            className="relative size-11 rounded-xl text-[#4f5661] sm:size-10"
            onClick={() => toast.info('اعلان تازه‌ای ندارید.')}
            size="icon"
            variant="ghost"
          >
            <Bell aria-hidden="true" className="size-[19px]" strokeWidth={1.8} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>اعلان‌ها</TooltipContent>
      </Tooltip>
      <div className="mx-1 hidden h-8 w-px bg-[#e6e8ec] sm:block" />
      <div className="hidden min-w-0 text-left sm:block" dir="rtl">
        <p className="max-w-36 truncate text-xs font-black text-foreground">{userName}</p>
        <p className="mt-0.5 max-w-40 truncate text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
      <Avatar className="size-10 ring-1 ring-[#dfe3ea] ring-offset-2 ring-offset-white">
        <AvatarFallback className="bg-primary/[0.08] font-black text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

export function Topbar() {
  return (
    <header className="z-20 shrink-0 border-b border-[#e8eaee] bg-white/95 px-3 backdrop-blur-sm sm:px-5 lg:px-6">
      <div className="mx-auto hidden min-h-[64px] w-full max-w-[1460px] items-center justify-between gap-8 lg:flex">
        <SearchBox />
        <UserControls />
      </div>

      <div className="mx-auto flex w-full max-w-[1460px] flex-col gap-2.5 py-2.5 lg:hidden">
        <div className="flex min-h-11 items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <DashboardMobileNav />
            <AuthLogo />
          </div>
          <UserControls />
        </div>
        <SearchBox />
      </div>
    </header>
  );
}
