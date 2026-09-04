import { ArrowDownIcon, ArrowUpIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  change?: number;
  context?: string;
}

export function KpiCard({ title, value, icon, change, context }: KpiCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className="h-full  border bg-card py-5 shadow-none ring-0">
      <CardHeader className="flex grid-cols-none flex-row items-center justify-between">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <span className="flex size-9 items-center justify-center  bg-muted text-foreground">
          {icon}
        </span>
      </CardHeader>
      <CardContent>
        <p dir="ltr" className="text-end text-3xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        <div className="mt-2 min-h-5 text-xs">
          {change !== undefined ? (
            <span
              dir="ltr"
              className={cn(
                'inline-flex items-center gap-1 font-medium tabular-nums',
                isPositive ? 'text-success' : 'text-destructive',
              )}
            >
              {isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {isPositive ? '+' : ''}
              {change}%
            </span>
          ) : (
            <span className="text-muted-foreground">{context}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
