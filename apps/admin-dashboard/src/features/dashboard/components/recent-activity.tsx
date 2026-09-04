import {
  ArticleIcon,
  DatabaseIcon,
  GearSixIcon,
  ShieldCheckIcon,
  UserMinusIcon,
} from '@phosphor-icons/react';
import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  AdminActivity,
  AdminActivityAction,
} from '@/features/dashboard/types/dashboard.types';

interface RecentActivityProps {
  activities: AdminActivity[];
}

const activityPresentation: Record<AdminActivityAction, { label: string; icon: ReactNode }> = {
  USER_SUSPENDED: { label: 'کاربر تعلیق شد', icon: <UserMinusIcon /> },
  ARTICLE_PUBLISHED: { label: 'مقاله منتشر شد', icon: <ArticleIcon /> },
  ADMIN_ROLE_CHANGED: { label: 'نقش ادمین تغییر کرد', icon: <ShieldCheckIcon /> },
  SANJESH_IMPORT_RUN: { label: 'Import سنجش اجرا شد', icon: <DatabaseIcon /> },
  SYSTEM_SETTINGS_CHANGED: { label: 'تنظیمات سیستم تغییر کرد', icon: <GearSixIcon /> },
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="h-full border bg-card py-5 shadow-none ring-0">
      <CardHeader>
        <CardTitle className="text-base font-semibold">فعالیت‌های اخیر</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-1 before:absolute before:inset-y-4 before:start-4 before:w-px before:bg-border">
          {activities.map((activity) => {
            const presentation = activityPresentation[activity.action];

            return (
              <li key={activity.id} className="relative flex gap-3 py-2.5">
                <span className="z-10 flex size-8 shrink-0 items-center justify-center  border bg-card text-muted-foreground [&>svg]:size-4">
                  {presentation.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="font-medium">{presentation.label}</p>
                    <time className="text-xs text-muted-foreground">{activity.relativeTime}</time>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {activity.actor}
                    {activity.target && <span> · {activity.target}</span>}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
