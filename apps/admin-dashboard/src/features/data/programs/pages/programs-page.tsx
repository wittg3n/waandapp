import { ArchiveIcon, EyeIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDataQuery } from '../../hooks/use-data';
import { dataRepository } from '../../services/data-repository';
import {
  DataPage,
  DataTable,
  EntityLink,
  ListToolbar,
  PrimaryAction,
  SimpleSort,
  StatusBadge,
  selectClassName,
  type TableColumn,
} from '../../shared/data-ui';
import { EntityFormDialog } from '../../shared/entity-forms';
import { degreeLabels } from '../../shared/data-utils';
import { useListPage } from '../../shared/use-list-page';
import { CatalogStatusFilter } from '../../universities/pages/universities-page';
import type { Major, Program, ProgramRow, Source, University } from '../../types/data.types';

export function ProgramsPage() {
  const navigate = useNavigate();
  const list = useListPage();
  const load = useCallback(
    (signal: AbortSignal) => dataRepository.listPrograms(new URLSearchParams(list.query), signal),
    [list.query],
  );
  const query = useDataQuery(load);
  const optionLoad = useCallback(
    () =>
      Promise.all([
        dataRepository.listUniversityOptions(),
        dataRepository.listMajorOptions(),
        dataRepository.listSourceOptions(),
      ]),
    [],
  );
  const options = useDataQuery<[University[], Major[], Source[]]>(optionLoad);
  const [form, setForm] = useState<Program | 'new' | null>(null);
  const [universities = [], majors = [], sources = []] = options.data ?? [];
  const columns: TableColumn<ProgramRow>[] = [
    {
      key: 'program',
      title: 'برنامه',
      render: (item) => <span className="font-medium">{item.titleFa}</span>,
    },
    {
      key: 'university',
      title: 'دانشگاه',
      render: (item) => (
        <EntityLink to={`/data/universities/${item.university.id}`}>
          {item.university.nameFa}
        </EntityLink>
      ),
    },
    {
      key: 'major',
      title: 'رشته',
      render: (item) => (
        <EntityLink to={`/data/majors/${item.major.id}`}>{item.major.nameFa}</EntityLink>
      ),
    },
    { key: 'degree', title: 'مقطع', render: (item) => degreeLabels[item.degreeLevel] },
    {
      key: 'admissions',
      title: 'پذیرش‌های فعال',
      render: (item) => item.activeAdmissionCount.toLocaleString('fa-IR'),
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
            onClick={() => navigate(`/data/programs/${item.id}`)}
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
              if (confirm(`برنامه «${item.titleFa}» آرشیو شود؟`)) {
                await dataRepository.archiveProgram(item.id);
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
      title="برنامه‌های دانشگاهی"
      subtitle="ترکیب مرجع دانشگاه، رشته و مقطع تحصیلی"
      action={<PrimaryAction onClick={() => setForm('new')}>افزودن برنامه</PrimaryAction>}
    >
      <ListToolbar
        params={list.params}
        total={query.data?.total ?? 0}
        onChange={list.change}
        onReset={list.reset}
      >
        <OptionFilter
          label="همه دانشگاه‌ها"
          value={list.params.get('university') ?? ''}
          onChange={(value) => list.change('university', value)}
          options={universities.map((item) => [item.id, item.nameFa])}
        />
        <OptionFilter
          label="همه رشته‌ها"
          value={list.params.get('major') ?? ''}
          onChange={(value) => list.change('major', value)}
          options={majors.map((item) => [item.id, item.nameFa])}
        />
        <OptionFilter
          label="همه مقاطع"
          value={list.params.get('degree') ?? ''}
          onChange={(value) => list.change('degree', value)}
          options={Object.entries(degreeLabels)}
        />
        <CatalogStatusFilter
          value={list.params.get('status') ?? ''}
          onChange={(value) => list.change('status', value)}
        />
        <OptionFilter
          label="همه منابع"
          value={list.params.get('source') ?? ''}
          onChange={(value) => list.change('source', value)}
          options={sources.map((item) => [item.id, item.title])}
        />
        <SimpleSort
          params={list.params}
          onChange={list.change}
          options={[
            ['updatedAt', 'آخرین بروزرسانی'],
            ['titleFa', 'عنوان برنامه'],
            ['degreeLevel', 'مقطع'],
          ]}
        />
      </ListToolbar>
      <DataTable
        result={query.data}
        loading={query.loading}
        error={query.error}
        columns={columns}
        onRowClick={(item) => navigate(`/data/programs/${item.id}`)}
        onRetry={query.refetch}
        onPageChange={list.changePage}
      />
      {form && (
        <EntityFormDialog
          kind="program"
          entity={form === 'new' ? undefined : form}
          universities={universities}
          majors={majors}
          sources={sources}
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
export function OptionFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<readonly [string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <select
      className={selectClassName}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{label}</option>
      {options.map(([id, title]) => (
        <option key={id} value={id}>
          {title}
        </option>
      ))}
    </select>
  );
}
