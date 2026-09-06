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
  SimpleSort,
  StatusBadge,
  type TableColumn,
} from '../../shared/data-ui';
import { EntityFormDialog } from '../../shared/entity-forms';
import { examGroupLabels, formatDataDate, sourceTypeLabels } from '../../shared/data-utils';
import { useListPage } from '../../shared/use-list-page';
import { OptionFilter } from '../../programs/pages/programs-page';
import type { Source, SourceRow } from '../../types/data.types';

export function SourcesPage() {
  const navigate = useNavigate();
  const list = useListPage();
  const load = useCallback(
    (signal: AbortSignal) => dataRepository.listSources(new URLSearchParams(list.query), signal),
    [list.query],
  );
  const query = useDataQuery(load);
  const [form, setForm] = useState<Source | 'new' | null>(null);
  const columns: TableColumn<SourceRow>[] = [
    {
      key: 'source',
      title: 'منبع',
      render: (item) => (
        <div>
          <p className="font-medium">{item.title}</p>
          {item.filename && (
            <p dir="ltr" className="mt-1 text-end text-muted-foreground">
              {item.filename}
            </p>
          )}
        </div>
      ),
    },
    { key: 'type', title: 'نوع', render: (item) => sourceTypeLabels[item.type] },
    {
      key: 'year',
      title: 'سال',
      render: (item) => item.year?.toLocaleString('fa-IR', { useGrouping: false }) ?? '—',
    },
    {
      key: 'group',
      title: 'گروه آزمایشی',
      render: (item) => (item.examGroup ? examGroupLabels[item.examGroup] : '—'),
    },
    {
      key: 'records',
      title: 'رکوردهای مرتبط',
      render: (item) => item.relatedRecordCount.toLocaleString('fa-IR'),
    },
    {
      key: 'import',
      title: 'آخرین Import',
      render: (item) =>
        item.latestImport ? (
          <div>
            <StatusBadge value={item.latestImport.status} />
            <p className="mt-1 text-muted-foreground">
              {formatDataDate(item.latestImport.startedAt)}
            </p>
          </div>
        ) : (
          '—'
        ),
    },
    { key: 'status', title: 'وضعیت', render: (item) => <StatusBadge value={item.status} /> },
    {
      key: 'actions',
      title: 'عملیات',
      render: (item) => (
        <div className="flex gap-1" onClick={(event) => event.stopPropagation()}>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="مشاهده"
            onClick={() => navigate(`/data/sources/${item.id}`)}
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
              if (confirm(`منبع «${item.title}» آرشیو شود؟`)) {
                await dataRepository.archiveSource(item.id);
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
      title="منابع"
      subtitle="منشأ و شواهد داده‌های دانشگاهی"
      action={<PrimaryAction onClick={() => setForm('new')}>افزودن منبع</PrimaryAction>}
    >
      <ListToolbar
        params={list.params}
        total={query.data?.total ?? 0}
        onChange={list.change}
        onReset={list.reset}
      >
        <OptionFilter
          label="همه انواع"
          value={list.params.get('type') ?? ''}
          onChange={(value) => list.change('type', value)}
          options={Object.entries(sourceTypeLabels)}
        />
        <OptionFilter
          label="همه گروه‌ها"
          value={list.params.get('examGroup') ?? ''}
          onChange={(value) => list.change('examGroup', value)}
          options={Object.entries(examGroupLabels)}
        />
        <OptionFilter
          label="همه وضعیت‌ها"
          value={list.params.get('status') ?? ''}
          onChange={(value) => list.change('status', value)}
          options={[
            ['ACTIVE', 'فعال'],
            ['SUPERSEDED', 'جایگزین‌شده'],
            ['ARCHIVED', 'آرشیوشده'],
          ]}
        />
        <SimpleSort
          params={list.params}
          onChange={list.change}
          options={[
            ['updatedAt', 'آخرین بروزرسانی'],
            ['title', 'عنوان منبع'],
            ['year', 'سال'],
          ]}
        />
      </ListToolbar>
      <DataTable
        result={query.data}
        loading={query.loading}
        error={query.error}
        columns={columns}
        onRowClick={(item) => navigate(`/data/sources/${item.id}`)}
        onRetry={query.refetch}
        onPageChange={list.changePage}
      />
      {form && (
        <EntityFormDialog
          kind="source"
          entity={form === 'new' ? undefined : form}
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
