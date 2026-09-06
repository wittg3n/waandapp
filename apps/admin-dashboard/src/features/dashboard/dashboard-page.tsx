import {
  IdentificationCardIcon,
  UserCheckIcon,
  UserPlusIcon,
  UsersIcon,
} from '@phosphor-icons/react';
import { useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { AlertsCard } from '@/features/dashboard/components/alerts-card';
import { ContentStatusCard } from '@/features/dashboard/components/content-status-card';
import { DashboardHeader } from '@/features/dashboard/components/dashboard-header';
import { DataQualityCard } from '@/features/dashboard/components/data-quality-card';
import { KpiCard } from '@/features/dashboard/components/kpi-card';
import { OpenTasksCard } from '@/features/dashboard/components/open-tasks-card';
import { RecentActivity } from '@/features/dashboard/components/recent-activity';
import { ServiceHealthCard } from '@/features/dashboard/components/service-health-card';
import { UserGrowthChart } from '@/features/dashboard/components/user-growth-chart';
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard';
import type {
  DashboardMetricIcon,
  DashboardPeriod,
} from '@/features/dashboard/types/dashboard.types';

const metricIcons: Record<DashboardMetricIcon, ReactNode> = {
  users: <UsersIcon aria-hidden="true" />,
  'active-users': <UserCheckIcon aria-hidden="true" />,
  'new-users': <UserPlusIcon aria-hidden="true" />,
  profile: <IdentificationCardIcon aria-hidden="true" />,
};

export function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('7d');
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const dashboard = useDashboard();

  if (!dashboard.data) {
    return (
      <div className="min-w-0 flex-1 bg-muted/20 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1600px] rounded-xl border bg-card p-8 text-sm text-muted-foreground">
          {dashboard.loading ? (
            'در حال دریافت اطلاعات داشبورد…'
          ) : (
            <>
              <p className="font-medium text-foreground">اطلاعات داشبورد دریافت نشد</p>
              <p className="mt-1">{dashboard.error}</p>
              <Button variant="outline" className="mt-4" onClick={dashboard.refetch}>
                تلاش دوباره
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  const {
    metrics,
    growthByPeriod,
    serviceHealth,
    contentStatus,
    dataQualityIssues,
    recentAdminActivity,
    systemAlerts,
    openTasks,
  } = dashboard.data;

  return (
    <div className="min-w-0 flex-1 bg-muted/20">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <DashboardHeader
          period={period}
          lastUpdated={lastUpdated}
          onPeriodChange={setPeriod}
          onRefresh={() => {
            dashboard.refetch();
            setLastUpdated(new Date());
          }}
        />

        <section aria-label="شاخص‌های کلیدی" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.items.map((metric) => (
            <KpiCard
              key={metric.id}
              title={metric.title}
              value={metric.value}
              icon={metricIcons[metric.icon]}
              change={metric.change}
              context={metric.context}
            />
          ))}
        </section>

        <section
          aria-label="تحلیل و سلامت سامانه"
          className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(19rem,1fr)]"
        >
          <UserGrowthChart data={growthByPeriod[period]} />
          <ServiceHealthCard services={serviceHealth} />
        </section>

        <section
          aria-label="عملیات جاری"
          className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-12"
        >
          <div className="min-w-0 xl:col-span-4">
            <DataQualityCard issues={dataQualityIssues} />
          </div>
          <div className="min-w-0 xl:col-span-5">
            <RecentActivity activities={recentAdminActivity} />
          </div>
          <div className="grid min-w-0 gap-6 sm:grid-cols-2 md:col-span-2 xl:col-span-3 xl:grid-cols-1">
            <ContentStatusCard items={contentStatus} />
            <AlertsCard alerts={systemAlerts} />
          </div>
          <div className="min-w-0 md:col-span-2 xl:col-span-12">
            <OpenTasksCard tasks={openTasks} />
          </div>
        </section>
      </div>
    </div>
  );
}
