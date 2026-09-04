'use client';

import * as React from 'react';
import Logo from '@/assets/logo.svg';
import { NavDash } from '@/components/nav-dash';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useAdminSession } from '@/features/users/hooks/use-users';
import {
  BoxingGloveIcon,
  DatabaseIcon,
  NewspaperIcon,
  GearSixIcon,
  HouseSimpleIcon,
  UsersIcon,
} from '@phosphor-icons/react';

const data = {
  navdash: [
    {
      title: 'خانه',
      url: '/dashboard',
      icon: <HouseSimpleIcon />,
      isActive: true,
    },
  ],

  navMain: [
    {
      title: 'کاربران',
      url: '#',
      icon: <UsersIcon />,
      items: [
        {
          title: 'همه کاربران',
          url: '/users',
        },
        {
          title: 'تعلیق‌شده‌ها',
          url: '/users/suspended',
        },
        {
          title: 'گزارش‌ها',
          url: '/users/reports',
        },
      ],
    },
    {
      title: 'داده‌ها',
      url: '/data/universities',
      icon: <DatabaseIcon />,
      items: [
        {
          title: 'دانشگاه‌ها',
          url: '/data/universities',
        },
        {
          title: 'برنامه‌های دانشگاهی',
          url: '/data/programs',
        },
        {
          title: 'رشته‌ها',
          url: '/data/majors',
        },
        {
          title: 'پذیرش‌ها',
          url: '/data/admissions',
        },
        {
          title: 'منابع',
          url: '/data/sources',
        },
        {
          title: 'ورودی‌ها',
          url: '/data/imports',
        },
        {
          title: 'کیفیت داده‌ها',
          url: '/data/quality',
        },
      ],
    },
    {
      title: 'محتوا',
      url: '#',
      icon: <NewspaperIcon />,
      items: [
        {
          title: 'نوشته ها',
          url: '#',
        },
        {
          title: 'دشته بندی ها',
          url: '#',
        },
        {
          title: 'برچسب ها',
          url: '#',
        },
        {
          title: 'رسانه',
          url: '#',
        },
        {
          title: 'نظرات',
          url: '#',
        },
        {
          title: 'تحلیل ها',
          url: '#',
        },
        {
          title: 'اعلان ها',
          url: '#',
        },
      ],
    },
    {
      title: 'مدیریت',
      url: '#',
      icon: <BoxingGloveIcon />,
      items: [
        {
          title: 'ادمین',
          url: '#',
        },
        {
          title: 'نقش ها',
          url: '#',
        },
        {
          title: 'دسترسی',
          url: '#',
        },
        {
          title: 'لاگ ممیزی',
          url: '#',
        },
      ],
    },
    {
      title: 'سیستم',
      url: '#',
      icon: <GearSixIcon />,
      items: [
        {
          title: 'سلامت سرویس',
          url: '#',
        },
        {
          title: 'چاپ ها',
          url: '#',
        },
        {
          title: 'امنیت',
          url: '#',
        },
        {
          title: 'فلگ های ویژگی ',
          url: '#',
        },
        {
          title: ' تنظیمات ',
          url: '#',
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const session = useAdminSession();
  const admin = session.data?.user;
  const user = {
    name: admin ? `${admin.firstName} ${admin.lastName}`.trim() : 'مدیر واند',
    email: admin?.email ?? 'نشست مدیریت',
    initials: admin ? `${admin.firstName.at(0) ?? ''}${admin.lastName.at(0) ?? ''}` : 'وا',
  };

  return (
    <Sidebar {...props} side="right" dir="rtl" collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="Waand" className="size-10 shrink-0" />

          <div className="flex min-w-0 flex-col items-start group-data-[collapsible=icon]:hidden">
            <span className="whitespace-nowrap text-[18px] font-semibold leading-none">
              وآنـــــــــــــد
            </span>

            <span className="mt-1.5 whitespace-nowrap text-[12px] text-muted-foreground">
              داشبورد ادمین
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavDash items={data.navdash} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
