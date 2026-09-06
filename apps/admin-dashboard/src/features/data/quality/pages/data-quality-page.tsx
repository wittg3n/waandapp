import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDataQuery } from '../../hooks/use-data';
import { dataRepository } from '../../services/data-repository';
import {
  DataPage,
  DataTable,
  EntityLink,
  InfoGrid,
  ListToolbar,
  SimpleSort,
  StatusBadge,
  selectClassName,
  type TableColumn,
} from '../../shared/data-ui';
import { EntityFormDialog } from '../../shared/entity-forms';
import {
  degreeLabels,
  entityPath,
  entityTypeLabels,
  formatDataDate,
  issueTypeLabels,
  statusLabels,
} from '../../shared/data-utils';
import { useListPage } from '../../shared/use-list-page';
import { OptionFilter } from '../../programs/pages/programs-page';
import type {
  DataQualityIssue,
  DegreeLevel,
  Major,
  ProgramRow,
  QualityResolution,
  Source,
  University,
} from '../../types/data.types';

const issueTypes = Object.keys(issueTypeLabels);
const severities = ['INFO', 'WARNING', 'CRITICAL'] as const;
const issueStatuses = ['OPEN', 'RESOLVED', 'IGNORED'] as const;
const entityTypes = Object.keys(entityTypeLabels);

export function DataQualityPage() {
  const list = useListPage();
  const [, setSearchParams] = useSearchParams();
  const listLoad = useCallback(
    (signal: AbortSignal) =>
      dataRepository.listQualityIssues(new URLSearchParams(list.query), signal),
    [list.query],
  );
  const metricsLoad = useCallback(
    (signal: AbortSignal) =>
      dataRepository.listQualityIssues(new URLSearchParams('pageSize=100'), signal),
    [],
  );
  const optionsLoad = useCallback(async () => {
    const [universities, majors, programs, sources, imports] = await Promise.all([
      dataRepository.listUniversityOptions(),
      dataRepository.listMajorOptions(),
      dataRepository.listProgramOptions(),
      dataRepository.listSourceOptions(),
      dataRepository.listImports(new URLSearchParams('pageSize=100')),
    ]);
    return { universities, majors, programs, sources, imports: imports.items };
  }, []);
  const query = useDataQuery(listLoad);
  const metrics = useDataQuery(metricsLoad);
  const options = useDataQuery(optionsLoad);
  const selectedId = list.params.get('issue');
  const selected =
    query.data?.items.find((issue) => issue.id === selectedId) ??
    metrics.data?.items.find((issue) => issue.id === selectedId);
  const closeIssue = () => {
    const next = new URLSearchParams(list.params);
    next.delete('issue');
    setSearchParams(next);
  };
  const openIssue = (issue: DataQualityIssue) => {
    const next = new URLSearchParams(list.params);
    next.set('issue', issue.id);
    setSearchParams(next);
  };
  const reload = () => {
    query.refetch();
    metrics.refetch();
    options.refetch();
  };
  const columns: TableColumn<DataQualityIssue>[] = [
    {
      key: 'issue',
      title: 'مشکل',
      render: (item) => (
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="mt-1 text-muted-foreground">{issueTypeLabels[item.type]}</p>
        </div>
      ),
    },
    {
      key: 'entityType',
      title: 'نوع موجودیت',
      render: (item) => entityTypeLabels[item.entityType],
    },
    {
      key: 'entity',
      title: 'موجودیت',
      render: (item) => (
        <IssueEntity
          issue={item}
          universities={options.data?.universities ?? []}
          majors={options.data?.majors ?? []}
          programs={options.data?.programs ?? []}
        />
      ),
    },
    {
      key: 'source',
      title: 'منبع',
      render: (item) =>
        item.sourceId ? (
          <EntityLink to={`/data/sources/${item.sourceId}`}>
            {options.data?.sources.find((source) => source.id === item.sourceId)?.title ??
              item.sourceId}
          </EntityLink>
        ) : (
          '—'
        ),
    },
    { key: 'severity', title: 'شدت', render: (item) => <StatusBadge value={item.severity} /> },
    {
      key: 'detected',
      title: 'تاریخ تشخیص',
      render: (item) => formatDataDate(item.detectedAt, true),
    },
    { key: 'status', title: 'وضعیت', render: (item) => <StatusBadge value={item.status} /> },
  ];
  const allIssues = metrics.data?.items ?? [];
  const metricCards = [
    ['مسائل باز', allIssues.filter((issue) => issue.status === 'OPEN').length],
    [
      'بحرانی',
      allIssues.filter((issue) => issue.status === 'OPEN' && issue.severity === 'CRITICAL').length,
    ],
    [
      'هشدار',
      allIssues.filter((issue) => issue.status === 'OPEN' && issue.severity === 'WARNING').length,
    ],
    ['حل‌شده', allIssues.filter((issue) => issue.status === 'RESOLVED').length],
  ];

  return (
    <DataPage
      title="کیفیت داده‌ها"
      subtitle="بررسی و حل مسائل یکپارچگی و نرمال‌سازی داده‌های دانشگاهی"
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metricCards.map(([label, value], index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -3 }}
          >
            <Card className="rounded-none p-4 shadow-none ring-0">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{Number(value).toLocaleString('fa-IR')}</p>
            </Card>
          </motion.div>
        ))}
      </div>
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
          options={issueTypes.map((value) => [
            value,
            issueTypeLabels[value as keyof typeof issueTypeLabels],
          ])}
        />
        <OptionFilter
          label="همه شدت‌ها"
          value={list.params.get('severity') ?? ''}
          onChange={(value) => list.change('severity', value)}
          options={severities.map((value) => [value, statusLabels[value]])}
        />
        <OptionFilter
          label="همه وضعیت‌ها"
          value={list.params.get('status') ?? ''}
          onChange={(value) => list.change('status', value)}
          options={issueStatuses.map((value) => [value, statusLabels[value]])}
        />
        <OptionFilter
          label="همه موجودیت‌ها"
          value={list.params.get('entityType') ?? ''}
          onChange={(value) => list.change('entityType', value)}
          options={entityTypes.map((value) => [
            value,
            entityTypeLabels[value as keyof typeof entityTypeLabels],
          ])}
        />
        <OptionFilter
          label="همه منابع"
          value={list.params.get('sourceId') ?? ''}
          onChange={(value) => list.change('sourceId', value)}
          options={(options.data?.sources ?? []).map((source) => [source.id, source.title])}
        />
        <OptionFilter
          label="همه ورودی‌ها"
          value={list.params.get('importId') ?? ''}
          onChange={(value) => list.change('importId', value)}
          options={(options.data?.imports ?? []).map((job) => [job.id, job.id])}
        />
        <SimpleSort
          params={list.params}
          onChange={list.change}
          options={[
            ['detectedAt', 'تاریخ تشخیص'],
            ['severity', 'شدت'],
            ['status', 'وضعیت'],
          ]}
        />
      </ListToolbar>
      <DataTable
        result={query.data}
        loading={query.loading || options.loading}
        error={query.error ?? options.error}
        columns={columns}
        onRowClick={openIssue}
        onRetry={() => {
          query.refetch();
          options.refetch();
        }}
        onPageChange={list.changePage}
      />
      {selected && options.data && (
        <IssueDialog
          issue={selected}
          universities={options.data.universities}
          majors={options.data.majors}
          sources={options.data.sources}
          onClose={closeIssue}
          onResolved={() => {
            closeIssue();
            reload();
          }}
          onMajorCreated={options.refetch}
        />
      )}
    </DataPage>
  );
}

function IssueEntity({
  issue,
  universities,
  majors,
  programs,
}: {
  issue: DataQualityIssue;
  universities: University[];
  majors: Major[];
  programs: ProgramRow[];
}) {
  const path = entityPath(issue.entityType, issue.entityId);
  const label =
    issue.entityType === 'UNIVERSITY'
      ? universities.find((item) => item.id === issue.entityId)?.nameFa
      : issue.entityType === 'MAJOR'
        ? majors.find((item) => item.id === issue.entityId)?.nameFa
        : issue.entityType === 'PROGRAM'
          ? programs.find((item) => item.id === issue.entityId)?.titleFa
          : (issue.entityId ?? issue.rawRecordId ?? '—');
  return path ? <EntityLink to={path}>{label}</EntityLink> : <span>{label}</span>;
}

function IssueDialog({
  issue,
  universities,
  majors,
  sources,
  onClose,
  onResolved,
  onMajorCreated,
}: {
  issue: DataQualityIssue;
  universities: University[];
  majors: Major[];
  sources: Source[];
  onClose: () => void;
  onResolved: () => void;
  onMajorCreated: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createMajor, setCreateMajor] = useState(false);
  const universityLoad = useCallback(
    (signal: AbortSignal) => dataRepository.getUniversity(issue.entityId ?? '', signal),
    [issue.entityId],
  );
  const importLoad = useCallback(
    (signal: AbortSignal) => dataRepository.getImport(issue.importId ?? '', signal),
    [issue.importId],
  );
  const duplicate = useDataQuery(
    universityLoad,
    issue.type === 'DUPLICATE_UNIVERSITY' &&
      issue.entityType === 'UNIVERSITY' &&
      Boolean(issue.entityId),
  );
  const imported = useDataQuery(importLoad, Boolean(issue.importId));
  const raw = imported.data?.rawRecords.find((record) => record.id === issue.rawRecordId);

  async function resolve(resolution: QualityResolution) {
    setBusy(true);
    setError(null);
    try {
      await dataRepository.resolveQualityIssue(issue.id, resolution);
      onResolved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'حل مسئله انجام نشد.');
    } finally {
      setBusy(false);
    }
  }

  if (createMajor)
    return (
      <EntityFormDialog
        kind="major"
        sources={sources}
        onClose={() => setCreateMajor(false)}
        onSaved={() => {
          setCreateMajor(false);
          onMajorCreated();
        }}
      />
    );
  const path = entityPath(issue.entityType, issue.entityId);
  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end bg-foreground/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="issue-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.aside
        className="h-full w-full max-w-xl overflow-y-auto bg-background p-5 shadow-xl"
        initial={{ x: 36, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge value={issue.severity} />
              <StatusBadge value={issue.status} />
            </div>
            <h2 id="issue-title" className="mt-3 text-xl font-semibold">
              {issue.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{issue.description}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            بستن
          </Button>
        </div>
        <motion.div
          className="my-5 rounded-none border p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <InfoGrid
            fields={[
              { label: 'نوع', value: issueTypeLabels[issue.type] },
              { label: 'موجودیت', value: entityTypeLabels[issue.entityType] },
              { label: 'تشخیص', value: formatDataDate(issue.detectedAt, true) },
              {
                label: 'منبع',
                value: issue.sourceId ? (
                  <EntityLink to={`/data/sources/${issue.sourceId}`}>
                    {sources.find((source) => source.id === issue.sourceId)?.title ??
                      issue.sourceId}
                  </EntityLink>
                ) : (
                  '—'
                ),
              },
              {
                label: 'Import',
                value: issue.importId ? (
                  <EntityLink to={`/data/imports/${issue.importId}`}>{issue.importId}</EntityLink>
                ) : (
                  '—'
                ),
              },
              { label: 'رکورد خام', value: issue.rawRecordId ?? '—', ltr: true },
            ]}
          />
          {path && (
            <Button className="mt-4" size="sm" variant="outline" render={<Link to={path} />}>
              <ArrowSquareOutIcon data-icon="inline-start" />
              مشاهده موجودیت
            </Button>
          )}
        </motion.div>
        {issue.status === 'OPEN' ? (
          <ResolutionForm
            issue={issue}
            universities={universities}
            majors={majors}
            rawTitle={raw?.rawMajorName}
            duplicate={duplicate.data ?? null}
            busy={busy}
            error={error}
            onResolve={resolve}
            onCreateMajor={() => setCreateMajor(true)}
          />
        ) : (
          <motion.div
            className="rounded-none border p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="font-medium">تصمیم ثبت‌شده</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {issue.resolutionNote ?? 'بدون توضیح'}
            </p>
          </motion.div>
        )}
      </motion.aside>
    </motion.div>
  );
}

function ResolutionForm({
  issue,
  universities,
  majors,
  rawTitle,
  duplicate,
  busy,
  error,
  onResolve,
  onCreateMajor,
}: {
  issue: DataQualityIssue;
  universities: University[];
  majors: Major[];
  rawTitle?: string;
  duplicate: Awaited<ReturnType<typeof dataRepository.getUniversity>> | null;
  busy: boolean;
  error: string | null;
  onResolve: (resolution: QualityResolution) => Promise<void>;
  onCreateMajor: () => void;
}) {
  const [ignore, setIgnore] = useState(false);
  const sourceUniversity = duplicate?.university;
  const targetOptions = universities.filter((university) => university.id !== issue.entityId);
  const field = 'grid gap-1.5 text-sm';
  return (
    <motion.form
      className="space-y-4 rounded-none border p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const text = (name: string) => String(form.get(name) ?? '').trim();
        if (ignore) return void onResolve({ action: 'IGNORE', note: text('note') });
        if (issue.type === 'DUPLICATE_UNIVERSITY')
          return void onResolve({
            action: 'MERGE_UNIVERSITY',
            targetUniversityId: text('targetUniversityId'),
            note: text('note'),
          });
        if (issue.type === 'UNMAPPED_MAJOR')
          return void onResolve({
            action: 'MAP_MAJOR',
            majorId: text('majorId'),
            note: text('note'),
          });
        if (issue.type === 'MISSING_UNIVERSITY_LOCATION')
          return void onResolve({
            action: 'SET_LOCATION',
            province: text('province'),
            city: text('city'),
            note: text('note'),
          });
        if (issue.type === 'INVALID_ADMISSION_CODE')
          return void onResolve({
            action: 'SET_ADMISSION_CODE',
            admissionCode: text('admissionCode'),
            note: text('note'),
          });
        if (issue.type === 'UNKNOWN_DEGREE_LEVEL')
          return void onResolve({
            action: 'SET_DEGREE_LEVEL',
            degreeLevel: text('degreeLevel') as Exclude<DegreeLevel, 'UNKNOWN'>,
            note: text('note'),
          });
        void onResolve({ action: 'IGNORE', note: text('note') });
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">رسیدگی به مسئله</h3>
        {!ignore && !['ORPHAN_PROGRAM', 'MISSING_SOURCE'].includes(issue.type) && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setIgnore(true)}>
            نادیده گرفتن
          </Button>
        )}
      </div>
      {ignore ? (
        <p className="text-sm text-muted-foreground">نادیده‌گرفتن مسئله نیازمند ثبت دلیل است.</p>
      ) : (
        <IssueSpecificFields
          issue={issue}
          universities={targetOptions}
          majors={majors}
          rawTitle={rawTitle}
          sourceUniversity={sourceUniversity}
          duplicate={duplicate}
          field={field}
          onCreateMajor={onCreateMajor}
        />
      )}
      <label className={field}>
        {ignore ? 'دلیل نادیده گرفتن' : 'یادداشت تصمیم'}
        <textarea name="note" required className="min-h-20 rounded-lg border bg-background p-2" />
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        {ignore && (
          <Button type="button" variant="outline" onClick={() => setIgnore(false)}>
            بازگشت
          </Button>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? 'در حال اعمال…' : ignore ? 'ثبت نادیده گرفتن' : 'حل مسئله'}
        </Button>
      </div>
    </motion.form>
  );
}

function IssueSpecificFields({
  issue,
  universities,
  majors,
  rawTitle,
  sourceUniversity,
  duplicate,
  field,
  onCreateMajor,
}: {
  issue: DataQualityIssue;
  universities: University[];
  majors: Major[];
  rawTitle?: string;
  sourceUniversity?: University;
  duplicate: Awaited<ReturnType<typeof dataRepository.getUniversity>> | null;
  field: string;
  onCreateMajor: () => void;
}) {
  const [targetId, setTargetId] = useState('');
  const target = universities.find((item) => item.id === targetId);
  if (issue.type === 'DUPLICATE_UNIVERSITY' && sourceUniversity)
    return (
      <>
        <div className="grid gap-3 sm:grid-cols-2">
          <CompareUniversity title="رکورد مبدا" university={sourceUniversity} />
          <CompareUniversity title="رکورد مقصد" university={target} />
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-sm">
          <p className="font-medium">اثر بر روابط</p>
          <p className="mt-1 text-muted-foreground">
            {(duplicate?.programs.length ?? 0).toLocaleString('fa-IR')} برنامه،{' '}
            {(
              duplicate?.programs.reduce((sum, item) => sum + item.admissionCount, 0) ?? 0
            ).toLocaleString('fa-IR')}{' '}
            پذیرش و {sourceUniversity.sourceIds.length.toLocaleString('fa-IR')} ارجاع منبع منتقل
            می‌شود.
          </p>
        </div>
        <label className={field}>
          رکورد مقصد
          <select
            required
            name="targetUniversityId"
            className={selectClassName}
            value={targetId}
            onChange={(event) => setTargetId(event.target.value)}
          >
            <option value="" disabled>
              انتخاب دانشگاه مرجع
            </option>
            {universities.map((university) => (
              <option key={university.id} value={university.id}>
                {university.nameFa}
              </option>
            ))}
          </select>
        </label>
        <label className={field}>
          برای تأیید عبارت «تأیید ادغام» را وارد کنید
          <Input required pattern="تأیید ادغام" title="عبارت تأیید ادغام را وارد کنید" />
        </label>
      </>
    );
  if (issue.type === 'UNMAPPED_MAJOR')
    return (
      <>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">عنوان خام رشته</p>
          <p className="mt-1 font-medium">{rawTitle ?? issue.description}</p>
        </div>
        <label className={field}>
          رشته مرجع
          <select required name="majorId" className={selectClassName} defaultValue="">
            <option value="" disabled>
              جست‌وجو و انتخاب رشته
            </option>
            {majors.map((major) => (
              <option key={major.id} value={major.id}>
                {major.nameFa}
              </option>
            ))}
          </select>
        </label>
        <Button type="button" variant="outline" onClick={onCreateMajor}>
          ایجاد رشته جدید با فرم رشته
        </Button>
      </>
    );
  if (issue.type === 'MISSING_UNIVERSITY_LOCATION')
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={field}>
          استان
          <Input name="province" required />
        </label>
        <label className={field}>
          شهر
          <Input name="city" required />
        </label>
      </div>
    );
  if (issue.type === 'INVALID_ADMISSION_CODE')
    return (
      <label className={field}>
        کد پذیرش اصلاح‌شده
        <Input name="admissionCode" required dir="ltr" />
      </label>
    );
  if (issue.type === 'UNKNOWN_DEGREE_LEVEL')
    return (
      <label className={field}>
        مقطع معتبر
        <select name="degreeLevel" required className={selectClassName} defaultValue="">
          <option value="" disabled>
            انتخاب مقطع
          </option>
          {Object.entries(degreeLabels)
            .filter(([value]) => value !== 'UNKNOWN')
            .map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
        </select>
      </label>
    );
  return (
    <p className="text-sm text-muted-foreground">
      برای این نوع مسئله، فقط ثبت تصمیم نادیده‌گرفتن در mock مدل شده است.
    </p>
  );
}

function CompareUniversity({ title, university }: { title: string; university?: University }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>
      {university ? (
        <dl className="space-y-1 text-sm">
          <div>
            <dt className="inline text-muted-foreground">نام: </dt>
            <dd className="inline">{university.nameFa}</dd>
          </div>
          <div>
            <dt className="inline text-muted-foreground">نام‌های جایگزین: </dt>
            <dd className="inline">{university.aliases.join('، ') || '—'}</dd>
          </div>
          <div>
            <dt className="inline text-muted-foreground">موقعیت: </dt>
            <dd className="inline">
              {[university.city, university.province].filter(Boolean).join('، ') || '—'}
            </dd>
          </div>
          <div>
            <dt className="inline text-muted-foreground">نوع: </dt>
            <dd className="inline">{university.type}</dd>
          </div>
          <div>
            <dt className="inline text-muted-foreground">منابع: </dt>
            <dd className="inline">{university.sourceIds.length.toLocaleString('fa-IR')}</dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">رکورد مقصد را انتخاب کنید.</p>
      )}
    </div>
  );
}
