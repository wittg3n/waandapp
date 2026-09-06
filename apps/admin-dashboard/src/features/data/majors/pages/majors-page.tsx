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
  type TableColumn,
} from '../../shared/data-ui';
import { EntityFormDialog } from '../../shared/entity-forms';
import { useListPage } from '../../shared/use-list-page';
import { CatalogStatusFilter, SortFilter } from '../../universities/pages/universities-page';
import type { Major, MajorRow, Source } from '../../types/data.types';

export function MajorsPage() {
  const navigate = useNavigate();
  const list = useListPage();
  const load = useCallback(
    (signal: AbortSignal) => dataRepository.listMajors(new URLSearchParams(list.query), signal),
    [list.query],
  );
  const query = useDataQuery(load);
  const sourceLoad = useCallback(() => dataRepository.listSourceOptions(), []);
  const sources = useDataQuery<Source[]>(sourceLoad);
  const [form, setForm] = useState<Major | 'new' | null>(null);
  const columns: TableColumn<MajorRow>[] = [
    {
      key: 'name',
      title: 'نام رشته',
      render: (item) => <span className="font-medium">{item.nameFa}</span>,
    },
    {
      key: 'en',
      title: 'نام انگلیسی',
      render: (item) => <span dir="ltr">{item.nameEn ?? '—'}</span>,
    },
    { key: 'aliases', title: 'نام‌های جایگزین', render: (item) => item.aliases.join('، ') || '—' },
    {
      key: 'programs',
      title: 'تعداد برنامه‌ها',
      render: (item) => item.programCount.toLocaleString('fa-IR'),
    },
    {
      key: 'universities',
      title: 'تعداد دانشگاه‌ها',
      render: (item) => item.universityCount.toLocaleString('fa-IR'),
    },
    {
      key: 'sources',
      title: 'منابع',
      render: (item) => item.sourceIds.length.toLocaleString('fa-IR'),
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
            onClick={() => navigate(`/data/majors/${item.id}`)}
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
              if (confirm(`رشته «${item.nameFa}» آرشیو شود؟`)) {
                await dataRepository.archiveMajor(item.id);
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
      title="رشته‌ها"
      subtitle="مدیریت رشته‌ها و عناوین مرجع مستقل از دانشگاه"
      action={<PrimaryAction onClick={() => setForm('new')}>افزودن رشته</PrimaryAction>}
    >
      <ListToolbar
        params={list.params}
        total={query.data?.total ?? 0}
        onChange={list.change}
        onReset={list.reset}
      >
        <CatalogStatusFilter
          value={list.params.get('status') ?? ''}
          onChange={(value) => list.change('status', value)}
        />
        <SortFilter params={list.params} onChange={list.change} />
      </ListToolbar>
      <DataTable
        result={query.data}
        loading={query.loading}
        error={query.error}
        columns={columns}
        onRowClick={(item) => navigate(`/data/majors/${item.id}`)}
        onRetry={query.refetch}
        onPageChange={list.changePage}
      />
      {form && (
        <EntityFormDialog
          kind="major"
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
