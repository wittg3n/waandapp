import { useCallback, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  ContentPage,
  ContentLoading,
  InlineError,
  selectClassName,
} from '@/features/content/shared/content-ui';
import { useContentQuery } from '@/features/content/shared/use-content-query';
import { useAdminSession } from '@/features/users/hooks/use-users';
import { administrationRepository } from '../../repository/administration-repository';
import {
  ADMIN_PERMISSIONS,
  PERMISSION_GROUP_LABELS,
  type PermissionGroup,
} from '../../types/administration.types';
export function PermissionsPage() {
  const session = useAdminSession();
  const canRead =
    session.data?.user?.permissions.includes(ADMIN_PERMISSIONS.permissionsRead) ?? false;
  const query = useContentQuery(
    useCallback((signal: AbortSignal) => administrationRepository.listPermissions(signal), []),
    canRead,
  );
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState<PermissionGroup | ''>('');
  const items = useMemo(() => {
    const value = search.trim().toLocaleLowerCase('fa-IR');
    return (query.data ?? []).filter(
      (item) =>
        (!group || item.group === group) &&
        (!value ||
          `${item.labelFa} ${item.key} ${item.descriptionFa}`
            .toLocaleLowerCase('fa-IR')
            .includes(value)),
    );
  }, [group, query.data, search]);
  return (
    <ContentPage title="دسترسی‌ها" description="فهرست قابلیت‌های مجاز در پنل مدیریت">
      {!session.loading && !canRead ? (
        <InlineError message="دسترسی مشاهده کاتالوگ دسترسی‌ها را ندارید." />
      ) : query.error ? (
        <InlineError message={query.error} onRetry={query.refetch} />
      ) : query.loading ? (
        <ContentLoading />
      ) : (
        <>
          <section className="flex flex-col gap-3 border bg-background p-4 sm:flex-row">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جست‌وجوی عنوان، کلید یا توضیح"
            />
            <select
              className={selectClassName}
              value={group}
              onChange={(e) => setGroup(e.target.value as PermissionGroup | '')}
            >
              <option value="">همه گروه‌ها</option>
              {Object.entries(PERMISSION_GROUP_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </section>
          <div className="max-w-full overflow-x-auto border bg-background">
            <table className="w-full min-w-[820px] text-xs">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="p-3 text-start">دسترسی</th>
                  <th className="p-3 text-start">کلید</th>
                  <th className="p-3 text-start">گروه</th>
                  <th className="p-3 text-start">توضیح</th>
                  <th className="p-3 text-start">نقش‌ها</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.key}>
                    <td className="p-3 font-medium">{item.labelFa}</td>
                    <td className="p-3 font-mono text-[10px]" dir="ltr">
                      {item.key}
                    </td>
                    <td className="p-3">{PERMISSION_GROUP_LABELS[item.group]}</td>
                    <td className="max-w-md p-3 text-muted-foreground">{item.descriptionFa}</td>
                    <td className="p-3">{item.roleCount.toLocaleString('fa-IR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && (
              <p className="p-12 text-center text-sm text-muted-foreground">دسترسی‌ای پیدا نشد.</p>
            )}
          </div>
        </>
      )}
    </ContentPage>
  );
}
