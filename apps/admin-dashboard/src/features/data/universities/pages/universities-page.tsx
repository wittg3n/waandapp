import { ArchiveIcon, EyeIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useDataQuery } from '../../hooks/use-data';
import { dataRepository } from '../../services/data-repository';
import {
  DataPage,
  DataTable,
  ListToolbar,
  PrimaryAction,
  StatusBadge,
  selectClassName,
  type TableColumn,
} from '../../shared/data-ui';
import { EntityFormDialog } from '../../shared/entity-forms';
import { formatDataDate, universityTypeLabels } from '../../shared/data-utils';
import { useListPage } from '../../shared/use-list-page';
import type { Source, University, UniversityRow } from '../../types/data.types';

export function UniversitiesPage() {
  const navigate = useNavigate();
  const list = useListPage();
  const load = useCallback(
    (signal: AbortSignal) =>
      dataRepository.listUniversities(new URLSearchParams(list.query), signal),
    [list.query],
  );
  const query = useDataQuery(load);
  const loadSources = useCallback(() => dataRepository.listSourceOptions(), []);
  const sources = useDataQuery<Source[]>(loadSources);
  const [form, setForm] = useState<University | 'new' | null>(null);

  const columns: TableColumn<UniversityRow>[] = [
    {
      key: 'university',
      title: 'دانشگاه',
      render: (item) => (
        <div>
          <p className="font-medium">{item.nameFa}</p>
          {item.nameEn && (
            <p dir="ltr" className="mt-1 text-end text-muted-foreground">
              {item.nameEn}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'location',
      title: 'شهر / استان',
      render: (item) =>
        item.city || item.province ? `${item.city ?? '—'} / ${item.province ?? '—'}` : 'ثبت نشده',
    },
    { key: 'type', title: 'نوع', render: (item) => universityTypeLabels[item.type] },
    {
      key: 'programs',
      title: 'برنامه‌ها',
      render: (item) => item.programCount.toLocaleString('fa-IR'),
    },
    {
      key: 'sources',
      title: 'منابع',
      render: (item) => item.sourceIds.length.toLocaleString('fa-IR'),
    },
    { key: 'status', title: 'وضعیت', render: (item) => <StatusBadge value={item.status} /> },
    { key: 'updated', title: 'آخرین بروزرسانی', render: (item) => formatDataDate(item.updatedAt) },
    {
      key: 'actions',
      title: 'عملیات',
      render: (item) => (
        <div className="flex gap-1" onClick={(event) => event.stopPropagation()}>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="مشاهده"
            onClick={() => navigate(`/data/universities/${item.id}`)}
          >
            <EyeIcon />
          </Button>
          <Button size="icon-sm" variant="ghost" aria-label="ویرایش" onClick={() => setForm(item)}>
            <PencilSimpleIcon />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="آرشیو"
            disabled={item.status === 'ARCHIVED'}
            onClick={async () => {
              if (confirm(`دانشگاه «${item.nameFa}» آرشیو شود؟`)) {
                await dataRepository.archiveUniversity(item.id);
                query.refetch();
              }
            }}
          >
            <ArchiveIcon />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataPage
      title="دانشگاه‌ها"
      subtitle="مدیریت مؤسسات آموزشی و داده‌های مرجع دانشگاه‌ها"
      action={<PrimaryAction onClick={() => setForm('new')}>افزودن دانشگاه</PrimaryAction>}
    >
      <ListToolbar
        params={list.params}
        total={query.data?.total ?? 0}
        onChange={list.change}
        onReset={list.reset}
      >
        <select
          className={selectClassName}
          value={list.params.get('country') ?? ''}
          onChange={(event) => list.change('country', event.target.value)}
        >
          <option value="">همه کشورها</option>
          <option value="IR">ایران</option>
        </select>
        <input
          className={selectClassName}
          value={list.params.get('province') ?? ''}
          onChange={(event) => list.change('province', event.target.value)}
          placeholder="استان"
        />
        <select
          className={selectClassName}
          value={list.params.get('type') ?? ''}
          onChange={(event) => list.change('type', event.target.value)}
        >
          <option value="">همه انواع</option>
          {Object.entries(universityTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <CatalogStatusFilter
          value={list.params.get('status') ?? ''}
          onChange={(value) => list.change('status', value)}
        />
        <label className="flex h-8 items-center gap-2  border px-2 text-xs">
          <input
            type="checkbox"
            checked={list.params.get('qualityOnly') === 'true'}
            onChange={(event) => list.change('qualityOnly', event.target.checked ? 'true' : '')}
          />
          فقط دارای مشکل
        </label>
        <SortFilter params={list.params} onChange={list.change} />
      </ListToolbar>
      <DataTable
        result={query.data}
        loading={query.loading}
        error={query.error}
        columns={columns}
        onRowClick={(item) => navigate(`/data/universities/${item.id}`)}
        onRetry={query.refetch}
        onPageChange={list.changePage}
      />
      {form && (
        <EntityFormDialog
          kind="university"
          entity={form === 'new' ? undefined : form}
          sources={sources.data ?? []}
          onClose={() => setForm(null)}
          onSaved={() => {
            setForm(null);
            query.refetch();
          }}
        />
      )}
    </DataPage>
  );
}

export function CatalogStatusFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      className={selectClassName}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">همه وضعیت‌ها</option>
      <option value="ACTIVE">فعال</option>
      <option value="INACTIVE">غیرفعال</option>
      <option value="ARCHIVED">آرشیوشده</option>
    </select>
  );
}
export function SortFilter({
  params,
  onChange,
}: {
  params: URLSearchParams;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <>
      <select
        className={selectClassName}
        value={params.get('sort') ?? 'updatedAt'}
        onChange={(event) => onChange('sort', event.target.value)}
      >
        <option value="updatedAt">آخرین بروزرسانی</option>
        <option value="nameFa">نام</option>
        <option value="createdAt">تاریخ ایجاد</option>
      </select>
      <select
        className={selectClassName}
        value={params.get('order') ?? 'desc'}
        onChange={(event) => onChange('order', event.target.value)}
      >
        <option value="desc">نزولی</option>
        <option value="asc">صعودی</option>
      </select>
    </>
  );
}
