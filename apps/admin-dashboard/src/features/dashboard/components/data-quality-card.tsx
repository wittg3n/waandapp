import { ArrowLeftIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  DataIssueSeverity,
  DataQualityIssue,
} from '@/features/dashboard/types/dashboard.types';
import { cn } from '@/lib/utils';

interface DataQualityCardProps {
  issues: DataQualityIssue[];
}

const severityClassName: Record<DataIssueSeverity, string> = {
  high: 'bg-warning',
  medium: 'bg-foreground/60',
  low: 'bg-muted-foreground/50',
};

export function DataQualityCard({ issues }: DataQualityCardProps) {
  return (
    <Card className="h-full  border bg-card py-5 shadow-none ring-0">
      <CardHeader>
        <CardTitle className="text-base font-semibold">کیفیت داده</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1">
          {issues.map((issue) => (
            <li
              key={issue.id}
              className="flex items-center justify-between gap-4  px-2 py-2.5 hover:bg-muted/60"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className={cn('size-2 shrink-0', severityClassName[issue.severity])}
                  aria-hidden="true"
                />
                <span className="truncate">{issue.title}</span>
              </span>
              <span className="min-w-8  bg-muted px-2 py-1 text-center font-semibold tabular-nums">
                {issue.count.toLocaleString('fa-IR')}
              </span>
            </li>
          ))}
        </ul>
        <Button variant="link" size="sm" className="mt-3 px-0">
          مشاهده مشکلات داده
          <ArrowLeftIcon data-icon="inline-end" />
        </Button>
      </CardContent>
    </Card>
  );
}
