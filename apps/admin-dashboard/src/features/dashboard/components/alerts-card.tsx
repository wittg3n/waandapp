import { InfoIcon, WarningIcon, WarningOctagonIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AlertSeverity, SystemAlert } from '@/features/dashboard/types/dashboard.types';
import { cn } from '@/lib/utils';

interface AlertsCardProps {
  alerts: SystemAlert[];
}

const alertPresentation: Record<AlertSeverity, { icon: ReactNode; className: string }> = {
  info: { icon: <InfoIcon />, className: 'border-info/20 bg-info/10 text-info' },
  warning: { icon: <WarningIcon />, className: 'border-warning/20 bg-warning/10 text-warning' },
  critical: {
    icon: <WarningOctagonIcon />,
    className: 'border-destructive/20 bg-destructive/10 text-destructive',
  },
};

export function AlertsCard({ alerts }: AlertsCardProps) {
  return (
    <Card className="h-full border bg-card py-5 shadow-none ring-0">
      <CardHeader className="flex grid-cols-none flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">هشدارها</CardTitle>
        <span className="bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
          {alerts.length.toLocaleString('fa-IR')} هشدار فعال
        </span>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {alerts.map((alert) => {
            const presentation = alertPresentation[alert.severity];

            return (
              <li
                key={alert.id}
                className={cn('flex items-start gap-2.5 border p-3', presentation.className)}
              >
                <span className="mt-0.5 [&>svg]:size-4">{presentation.icon}</span>
                <span className="leading-5 text-foreground">{alert.title}</span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
