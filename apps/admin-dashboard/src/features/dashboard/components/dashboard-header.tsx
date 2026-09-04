import { ArrowClockwiseIcon, ClockIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DashboardPeriod } from '@/features/dashboard/types/dashboard.types';

interface DashboardHeaderProps {
  period: DashboardPeriod;
  lastUpdated: Date;
  onPeriodChange: (period: DashboardPeriod) => void;
  onRefresh: () => void;
}

const periods: { value: DashboardPeriod; label: string }[] = [
  { value: 'today', label: 'امروز' },
  { value: '7d', label: '۷ روز' },
  { value: '30d', label: '۳۰ روز' },
];

export function DashboardHeader({
  period,
  lastUpdated,
  onPeriodChange,
  onRefresh,
}: DashboardHeaderProps) {
  const updatedTime = lastUpdated.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">داشبورد</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          نمای کلی وضعیت واند و فعالیت‌های اخیر
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Tabs
          value={period}
          onValueChange={(value) => onPeriodChange(value as DashboardPeriod)}
          aria-label="انتخاب بازه زمانی"
        >
          <TabsList>
            {periods.map((item) => (
              <TabsTrigger key={item.value} value={item.value}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Button variant="outline" onClick={onRefresh}>
          <ArrowClockwiseIcon data-icon="inline-start" />
          تازه‌سازی
        </Button>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <ClockIcon aria-hidden="true" />
          {updatedTime}
        </span>
      </div>
    </div>
  );
}
