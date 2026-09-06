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
  type TableColumn,
} from '../../shared/data-ui';
import { EntityFormDialog } from '../../shared/entity-forms';
import { degreeLabels, examGroupLabels } from '../../shared/data-utils';
import { useListPage } from '../../shared/use-list-page';
import { OptionFilter } from '../../programs/pages/programs-page';
import { CatalogStatusFilter } from '../../universities/pages/universities-page';
import type {
  Admission,
  AdmissionRow,
  Major,
  ProgramRow,
  Source,
  University,
} from '../../types/data.types';

export function AdmissionsPage() {
  const navigate = useNavigate();
  const list = useListPage();
  const load = useCallback(
    (signal: AbortSignal) => dataRepository.listAdmissions(new URLSearchParams(list.query), signal),
    [list.query],
  );
  const query = useDataQuery(load);
  const optionLoad = useCallback(
    () =>
      Promise.all([
        dataRepository.listUniversityOptions(),
        dataRepository.listMajorOptions(),
        dataRepository.listProgramOptions(),
        dataRepository.listSourceOptions(),
      ]),
    [],
  );
  const options = useDataQuery<[University[], Major[], ProgramRow[], Source[]]>(optionLoad);
  const [form, setForm] = useState<Admission | 'new' | null>(null);
  const [universities = [], majors = [], programs = [], sources = []] = options.data ?? [];
  const columns: TableColumn<AdmissionRow>[] = [
    {
      key: 'code',
      title: 'کد پذیرش',
      render: (item) => (
        <span dir="ltr" className="font-medium">
          {item.admissionCode ?? '—'}
        </span>
      ),
    },
    {
      key: 'program',
      title: 'برنامه',
      render: (item) => (
        <EntityLink to={`/data/programs/${item.program.id}`}>{item.program.titleFa}</EntityLink>
      ),
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
    {
      key: 'year',
      title: 'سال',
      render: (item) => item.year.toLocaleString('fa-IR', { useGrouping: false }),
    },
    {
      key: 'group',
      title: 'گروه آزمایشی',
      render: (item) => (item.examGroup ? examGroupLabels[item.examGroup] : '—'),
    },
    {
      key: 'capacity',
      title: 'ظرفیت',
      render: (item) => item.capacity?.toLocaleString('fa-IR') ?? '—',
    },
    {
      key: 'source',
      title: 'منبع',
      render: (item) => (
        <EntityLink to={`/data/sources/${item.source.id}`}>{item.source.title}</EntityLink>
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
            onClick={() => navigate(`/data/admissions/${item.id}`)}
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
              if (confirm(`پذیرش «${item.admissionCode ?? item.id}» آرشیو شود؟`)) {
                await dataRepository.archiveAdmission(item.id);
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
      title="پذیرش‌ها"
      subtitle="رکوردهای پذیرش و ظرفیت برنامه‌های دانشگاهی"
      action={<PrimaryAction onClick={() => setForm('new')}>افزودن پذیرش</PrimaryAction>}
    >
      <ListToolbar
        params={list.params}
        total={query.data?.total ?? 0}
        onChange={list.change}
        onReset={list.reset}
      >
        <OptionFilter
          label="همه سال‌ها"
          value={list.params.get('year') ?? ''}
          onChange={(value) => list.change('year', value)}
          options={[
            ['1404', '۱۴۰۴'],
            ['1403', '۱۴۰۳'],
          ]}
        />
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
        <OptionFilter
          label="همه گروه‌ها"
          value={list.params.get('examGroup') ?? ''}
          onChange={(value) => list.change('examGroup', value)}
          options={Object.entries(examGroupLabels)}
        />
        <OptionFilter
          label="همه منابع"
          value={list.params.get('source') ?? ''}
          onChange={(value) => list.change('source', value)}
          options={sources.map((item) => [item.id, item.title])}
        />
        <CatalogStatusFilter
          value={list.params.get('status') ?? ''}
          onChange={(value) => list.change('status', value)}
        />
        <SimpleSort
          params={list.params}
          onChange={list.change}
          options={[
            ['updatedAt', 'آخرین بروزرسانی'],
            ['year', 'سال پذیرش'],
            ['admissionCode', 'کد پذیرش'],
          ]}
        />
      </ListToolbar>
      <DataTable
        result={query.data}
        loading={query.loading}
        error={query.error}
        columns={columns}
        onRowClick={(item) => navigate(`/data/admissions/${item.id}`)}
        onRetry={query.refetch}
        onPageChange={list.changePage}
      />
      {form && (
        <EntityFormDialog
          kind="admission"
          entity={form === 'new' ? undefined : form}
          programs={programs}
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
