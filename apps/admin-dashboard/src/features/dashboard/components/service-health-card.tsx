import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ServiceHealth, ServiceState } from '@/features/dashboard/types/dashboard.types';
import { cn } from '@/lib/utils';

interface ServiceHealthCardProps {
  services: ServiceHealth[];
}

const stateLabel: Record<ServiceState, string> = {
  healthy: 'سالم',
  degraded: 'اختلال جزئی',
  down: 'قطع',
};

const stateClassName: Record<ServiceState, { dot: string; badge: string }> = {
  healthy: { dot: 'bg-success', badge: 'bg-success/10 text-success' },
  degraded: { dot: 'bg-warning', badge: 'bg-warning/10 text-warning' },
  down: { dot: 'bg-destructive', badge: 'bg-destructive/10 text-destructive' },
};

export function ServiceHealthCard({ services }: ServiceHealthCardProps) {
  return (
    <Card className="h-full  border bg-card py-5 shadow-none ring-0">
      <CardHeader>
        <CardTitle className="text-base font-semibold">وضعیت سرویس‌ها</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {services.map((service) => (
            <li
              key={service.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-1 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={cn('size-2 shrink-0 ', stateClassName[service.state].dot)}
                  aria-hidden="true"
                />
                <span dir="ltr" className="font-medium">
                  {service.name}
                </span>
                {service.latency !== undefined && (
                  <span dir="ltr" className="text-xs text-muted-foreground tabular-nums">
                    {service.latency}ms
                  </span>
                )}
              </div>
              <span
                className={cn(
                  ' px-2 py-1 text-xs font-medium',
                  stateClassName[service.state].badge,
                )}
              >
                {stateLabel[service.state]}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
