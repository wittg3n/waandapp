import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserGrowthPoint } from '@/features/dashboard/types/dashboard.types';

interface UserGrowthChartProps {
  data: UserGrowthPoint[];
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <Card className="h-full  border bg-card py-5 shadow-none ring-0">
      <CardHeader className="gap-3 sm:flex sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base font-semibold">رشد کاربران</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">روند کاربران جدید و فعال</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-chart-2" />
            کاربران فعال
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-chart-4" />
            کاربران جدید
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div dir="ltr" className="h-[280px] min-w-0 sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                tickMargin={10}
              />
              <YAxis
                yAxisId="active"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                tickFormatter={(value: number) => value.toLocaleString('fa-IR')}
                width={46}
              />
              <YAxis yAxisId="new" orientation="left" hide />
              <Tooltip
                cursor={{ stroke: 'var(--border)' }}
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--popover-foreground)',
                  direction: 'rtl',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                }}
                formatter={(value, name) => [Number(value).toLocaleString('fa-IR'), name]}
              />
              <Line
                yAxisId="active"
                type="monotone"
                dataKey="activeUsers"
                name="کاربران فعال"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                yAxisId="new"
                type="monotone"
                dataKey="newUsers"
                name="کاربران جدید"
                stroke="var(--chart-4)"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
