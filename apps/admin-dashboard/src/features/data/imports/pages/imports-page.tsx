import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDataQuery } from '../../hooks/use-data';
import { dataRepository } from '../../services/data-repository';
import {
  DataPage,
  DataTable,
  EntityLink,
  ListToolbar,
  SimpleSort,
  StatusBadge,
  type TableColumn,
} from '../../shared/data-ui';
import { examGroupLabels, formatDataDate, statusLabels } from '../../shared/data-utils';
import { useListPage } from '../../shared/use-list-page';
import { OptionFilter } from '../../programs/pages/programs-page';
import type { ImportJob, Source } from '../../types/data.types';

const importStatuses = [
  'PENDING',
  'PARSING',
  'VALIDATING',
  'REVIEW_REQUIRED',
  'READY_TO_COMMIT',
  'COMMITTED',
  'FAILED',
] as const;

export function ImportsPage() {
  const navigate = useNavigate();
  const list = useListPage();
  const load = useCallback(
    (signal: AbortSignal) => dataRepository.listImports(new URLSearchParams(list.query), signal),
    [list.query],
  );
  const sourceLoad = useCallback(() => dataRepository.listSourceOptions(), []);
  const query = useDataQuery(load);
  const sources = useDataQuery(sourceLoad);
  const sourceMap = new Map((sources.data ?? []).map((source) => [source.id, source]));
  const columns: TableColumn<ImportJob>[] = [
    {
      key: 'id',
      title: 'Import',
      render: (item) => (
        <span dir="ltr" className="block text-end font-medium">
          {item.id}
        </span>
      ),
    },
    {
      key: 'source',
      title: 'منبع',
      render: (item) => (
        <SourceCell source={sourceMap.get(item.sourceId)} sourceId={item.sourceId} />
      ),
    },
    {
      key: 'context',
      title: 'سال / گروه آزمایشی',
      render: (item) => {
        const source = sourceMap.get(item.sourceId);
        return source
          ? `${source.year?.toLocaleString('fa-IR', { useGrouping: false }) ?? '—'} / ${source.examGroup ? examGroupLabels[source.examGroup] : '—'}`
          : '—';
      },
    },
    { key: 'status', title: 'وضعیت', render: (item) => <StatusBadge value={item.status} /> },
    { key: 'raw', title: 'خام', render: (item) => item.metrics.raw.toLocaleString('fa-IR') },
    { key: 'valid', title: 'معتبر', render: (item) => item.metrics.valid.toLocaleString('fa-IR') },
    {
      key: 'rejected',
      title: 'ردشده',
      render: (item) => item.metrics.rejected.toLocaleString('fa-IR'),
    },
    {
      key: 'duplicates',
      title: 'تکراری',
      render: (item) => item.metrics.duplicates.toLocaleString('fa-IR'),
    },
    { key: 'started', title: 'شروع', render: (item) => formatDataDate(item.startedAt, true) },
    { key: 'completed', title: 'پایان', render: (item) => formatDataDate(item.completedAt, true) },
  ];

  return (
    <DataPage title="ورودی‌ها" subtitle="مدیریت اجرای ورود و اعتبارسنجی داده‌های دانشگاهی">
      <ListToolbar
        params={list.params}
        total={query.data?.total ?? 0}
        onChange={list.change}
        onReset={list.reset}
      >
        <OptionFilter
          label="همه منابع"
          value={list.params.get('source') ?? ''}
          onChange={(value) => list.change('source', value)}
          options={(sources.data ?? []).map((source) => [source.id, source.title])}
        />
        <OptionFilter
          label="همه وضعیت‌ها"
          value={list.params.get('status') ?? ''}
          onChange={(value) => list.change('status', value)}
          options={importStatuses.map((status) => [status, statusLabels[status]])}
        />
        <SimpleSort
          params={list.params}
          onChange={list.change}
          options={[
            ['startedAt', 'زمان شروع'],
            ['status', 'وضعیت'],
          ]}
        />
      </ListToolbar>
      <DataTable
        result={query.data}
        loading={query.loading || sources.loading}
        error={query.error ?? sources.error}
        columns={columns}
        onRowClick={(item) => navigate(`/data/imports/${item.id}`)}
        onRetry={() => {
          query.refetch();
          sources.refetch();
        }}
        onPageChange={list.changePage}
      />
    </DataPage>
  );
}

function SourceCell({ source, sourceId }: { source?: Source; sourceId: string }) {
  return source ? (
    <EntityLink to={`/data/sources/${source.id}`}>{source.title}</EntityLink>
  ) : (
    <span dir="ltr">{sourceId}</span>
  );
}
