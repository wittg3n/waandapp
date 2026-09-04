import { ArrowLeftIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ContentStatusCardProps {
  items: { id: string; label: string; value: number }[];
}

export function ContentStatusCard({ items }: ContentStatusCardProps) {
  return (
    <Card className="h-full  border bg-card py-5 shadow-none ring-0">
      <CardHeader>
        <CardTitle className="text-base font-semibold">وضعیت محتوا</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-3 divide-x divide-x-reverse text-center">
          {items.map((item) => (
            <div key={item.id} className="px-2">
              <dd className="text-2xl font-semibold tabular-nums">
                {item.value.toLocaleString('fa-IR')}
              </dd>
              <dt className="mt-1 text-xs text-muted-foreground">{item.label}</dt>
            </div>
          ))}
        </dl>
        <Button variant="link" size="sm" className="mt-4 px-0">
          مدیریت محتوا
          <ArrowLeftIcon data-icon="inline-end" />
        </Button>
      </CardContent>
    </Card>
  );
}
