import { FunnelSimpleIcon, MagnifyingGlassIcon, XIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UsersToolbarProps {
  params: URLSearchParams;
  total: number;
  statusLocked?: boolean;
  supportsBan?: boolean;
  onChange: (name: string, value: string) => void;
  onClear: () => void;
}

const selectClassName =
  'h-8 min-w-32 rounded-lg border border-input bg-background px-2.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50';

export function UsersToolbar({
  params,
  total,
  statusLocked,
  supportsBan,
  onChange,
  onClear,
}: UsersToolbarProps) {
  const [search, setSearch] = useState(params.get('search') ?? '');

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form
          className="flex w-full max-w-xl items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            onChange('search', search.trim());
          }}
        >
          <div className="relative min-w-0 flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className=" ps-8"
              placeholder="جست‌وجوی نام، نام کاربری، ایمیل یا موبایل"
              aria-label="جست‌وجوی کاربران"
            />
          </div>
          <Button type="submit" variant="outline">
            جست‌وجو
          </Button>
        </form>
        <span className="shrink-0 text-xs text-muted-foreground">
          {total.toLocaleString('fa-IR')} نتیجه
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <FunnelSimpleIcon className="text-muted-foreground" aria-hidden="true" />
        {!statusLocked && (
          <select
            className={selectClassName}
            value={params.get('status') ?? ''}
            onChange={(event) => onChange('status', event.target.value)}
            aria-label="وضعیت حساب"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="pending_verification">در انتظار</option>
            <option value="suspended">تعلیق‌شده</option>
            {supportsBan && <option value="banned">مسدود</option>}
            <option value="deleted">حذف‌شده</option>
          </select>
        )}
        <select
          className={selectClassName}
          value={params.get('emailVerified') ?? ''}
          onChange={(event) => onChange('emailVerified', event.target.value)}
          aria-label="تأیید ایمیل"
        >
          <option value="">تأیید ایمیل</option>
          <option value="true">تأییدشده</option>
          <option value="false">تأییدنشده</option>
        </select>
        <select
          className={selectClassName}
          value={params.get('phoneVerified') ?? ''}
          onChange={(event) => onChange('phoneVerified', event.target.value)}
          aria-label="تأیید موبایل"
        >
          <option value="">تأیید موبایل</option>
          <option value="true">تأییدشده</option>
          <option value="false">تأییدنشده</option>
        </select>
        <select
          className={selectClassName}
          value={params.get('profileCompleted') ?? ''}
          onChange={(event) => onChange('profileCompleted', event.target.value)}
          aria-label="تکمیل پروفایل"
        >
          <option value="">تکمیل پروفایل</option>
          <option value="true">تکمیل‌شده</option>
          <option value="false">تکمیل‌نشده</option>
        </select>
        <Input
          type="date"
          className="w-auto rounded-lg"
          value={params.get('registeredFrom') ?? ''}
          onChange={(event) => onChange('registeredFrom', event.target.value)}
          aria-label="عضویت از تاریخ"
        />
        <Input
          type="date"
          className="w-auto rounded-lg"
          value={params.get('registeredTo') ?? ''}
          onChange={(event) => onChange('registeredTo', event.target.value)}
          aria-label="عضویت تا تاریخ"
        />
        <Button variant="ghost" size="sm" onClick={onClear}>
          <XIcon data-icon="inline-start" />
          پاک‌کردن فیلترها
        </Button>
      </div>
    </div>
  );
}
