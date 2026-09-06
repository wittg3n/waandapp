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
      url: '/users',
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
      url: '/content',
      icon: <NewspaperIcon />,
      items: [
        {
          title: 'نوشته‌ها',
          url: '/content/posts',
        },
        {
          title: 'دسته‌بندی‌ها',
          url: '/content/categories',
        },
        {
          title: 'برچسب‌ها',
          url: '/content/tags',
        },
        {
          title: 'رسانه',
          url: '/content/media',
        },
        {
          title: 'نظرات',
          url: '/content/comments',
        },
      ],
    },
    {
      title: 'مدیریت',
      url: '/administration/admins',
      icon: <BoxingGloveIcon />,
      items: [
        {
          title: 'ادمین‌ها',
          url: '/administration/admins',
        },
        {
          title: 'نقش‌ها',
          url: '/administration/roles',
        },
        {
          title: 'دسترسی‌ها',
          url: '/administration/permissions',
        },
        {
          title: 'لاگ ممیزی',
          url: '/administration/audit',
        },
      ],
    },
    {
      title: 'سیستم',
      url: '/system/health',
      icon: <GearSixIcon />,
      items: [
        {
          title: 'سلامت سرویس',
          url: '/system/health',
        },
        {
          title: 'جاب‌ها',
          url: '/system/jobs',
        },
        {
          title: 'امنیت',
          url: '/system/security',
        },
        {
          title: 'فلگ‌های ویژگی',
          url: '/system/feature-flags',
        },
        {
          title: 'تنظیمات',
          url: '/system/settings',
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
