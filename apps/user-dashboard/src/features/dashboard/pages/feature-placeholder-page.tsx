import {
  BellRing,
  BookOpenText,
  BriefcaseBusiness,
  Building2,
  FileText,
  MessageSquareText,
  Settings,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type PageDetails = { title: string; description: string; icon: LucideIcon };

const pages: Record<string, PageDetails> = {
  '/profile': {
    title: 'پروفایل',
    description: 'اطلاعات تحصیلی، سوابق و هدف‌های اپلای شما در این بخش تکمیل می‌شود.',
    icon: UserRound,
  },
  '/documents': {
    title: 'مدارک',
    description: 'مدارک تحصیلی، رزومه و مدرک زبان خود را از این بخش مدیریت خواهید کرد.',
    icon: FileText,
  },
  '/universities': {
    title: 'پیشنهاد دانشگاه‌ها',
    description: 'پیشنهادهای هوشمند پس از تکمیل اطلاعات و مدارک اولیه در اینجا نمایش داده می‌شوند.',
    icon: Building2,
  },
  '/applications': {
    title: 'اپلیکیشن‌ها',
    description: 'درخواست‌های دانشگاهی خود را مرحله‌به‌مرحله در این بخش مدیریت خواهید کرد.',
    icon: BriefcaseBusiness,
  },
  '/deadlines': {
    title: 'ددلاین‌ها',
    description: 'مهلت‌های مهم دانشگاه‌ها و مدارک موردنیاز در این بخش جمع‌آوری می‌شوند.',
    icon: BellRing,
  },
  '/messages': {
    title: 'پیام‌ها',
    description: 'پیام‌ها و به‌روزرسانی‌های مسیر اپلای شما در این بخش قرار می‌گیرند.',
    icon: MessageSquareText,
  },
  '/settings': {
    title: 'تنظیمات',
    description: 'تنظیمات حساب، اعلان‌ها و ترجیحات شخصی شما از این بخش قابل مدیریت است.',
    icon: Settings,
  },
  '/help': {
    title: 'راهنما',
    description: 'راهنمای استفاده از وآند و پاسخ پرسش‌های پرتکرار در این بخش ارائه می‌شود.',
    icon: BookOpenText,
  },
};

export function FeaturePlaceholderPage() {
  const { pathname } = useLocation();
  const page = pages[pathname] ?? pages['/profile'];
  const Icon = page.icon;

  useEffect(() => {
    document.title = `وآند | ${page.title}`;
  }, [page.title]);

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-112px)] w-full max-w-[920px] place-items-center py-8">
      <Card className="w-full max-w-xl gap-0 border-[#e4e8ef] px-6 py-10 text-center shadow-[0_12px_34px_rgba(15,23,42,0.055)] sm:px-10">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/[0.08] text-primary">
          <Icon aria-hidden="true" className="size-7" strokeWidth={1.7} />
        </span>
        <h1 className="mt-5 text-2xl font-black text-foreground">{page.title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
          {page.description}
        </p>
        <p className="mt-4 text-xs font-bold text-primary">این بخش در حال آماده‌سازی است.</p>
        <Link className={cn(buttonVariants(), 'mt-6')} to="/dashboard">
          بازگشت به داشبورد
        </Link>
      </Card>
    </div>
  );
}
