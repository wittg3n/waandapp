import { ClipboardTextIcon, UserIcon } from '@phosphor-icons/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OpenTask, OpenTaskState } from '@/features/dashboard/types/dashboard.types';
import { cn } from '@/lib/utils';

interface OpenTasksCardProps {
  tasks: OpenTask[];
}

const taskStatePresentation: Record<OpenTaskState, { label: string; className: string }> = {
  pending: { label: 'در انتظار', className: 'bg-muted text-muted-foreground' },
  'in-progress': { label: 'در حال انجام', className: 'bg-info/10 text-info' },
  review: { label: 'نیازمند بررسی', className: 'bg-warning/10 text-warning' },
};

export function OpenTasksCard({ tasks }: OpenTasksCardProps) {
  return (
    <Card className="h-full  border bg-card py-5 shadow-none ring-0">
      <CardHeader>
        <CardTitle className="text-base font-semibold">کارهای باز</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 lg:grid-cols-3">
          {tasks.map((task) => {
            const presentation = taskStatePresentation[task.state];

            return (
              <li key={task.id} className=" border p-3.5">
                <div className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center  bg-muted text-muted-foreground">
                    <ClipboardTextIcon />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-5">{task.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{task.category}</span>
                      <span className={cn(' px-2 py-1 font-medium', presentation.className)}>
                        {presentation.label}
                      </span>
                    </div>
                    {task.assignee && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <UserIcon aria-hidden="true" />
                        {task.assignee}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
