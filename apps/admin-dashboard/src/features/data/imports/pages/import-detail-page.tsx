import { CheckCircleIcon, CircleIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDataQuery } from '../../hooks/use-data';
import { dataRepository } from '../../services/data-repository';
import { DataDetailWrap } from '../../universities/pages/university-detail-page';
import {
  DetailError,
  DetailHeader,
  EntityLink,
  HistoryList,
  InfoGrid,
  InlineEmpty,
  LoadingDetail,
  NotFound,
  SectionCard,
  StatusBadge,
} from '../../shared/data-ui';
import { examGroupLabels, formatDataDate, statusLabels } from '../../shared/data-utils';
import type { ImportAction, ImportJob, ImportStage } from '../../types/data.types';

const stages: Array<[ImportStage, string]> = [
  ['REGISTERED', 'ثبت منبع'],
  ['PARSED', 'استخراج'],
  ['NORMALIZED', 'نرمال‌سازی'],
  ['VALIDATED', 'اعتبارسنجی'],
  ['DEDUPLICATED', 'تشخیص تکراری'],
  ['REVIEWED', 'بازبینی'],
  ['COMMITTED', 'ثبت نهایی'],
];

export function ImportDetailPage() {
  const { importId = '' } = useParams();
  const load = useCallback(
    (signal: AbortSignal) => dataRepository.getImport(importId, signal),
    [importId],
  );
  const query = useDataQuery(load);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [commitOpen, setCommitOpen] = useState(false);
  if (query.loading)
    return (
      <DataDetailWrap>
        <LoadingDetail />
      </DataDetailWrap>
    );
  if (query.error)
    return (
      <DataDetailWrap>
        <DetailError message={query.error} onRetry={query.refetch} />
      </DataDetailWrap>
    );
  if (!query.data)
    return (
      <DataDetailWrap>
        <NotFound label="Import" />
      </DataDetailWrap>
    );
  const { importJob, source, rawRecords, issues, history } = query.data;
  const action = nextAction(importJob);
  const run = async (value: ImportAction) => {
    setPending(true);
    setMessage(null);
    try {
      await dataRepository.runImportAction(importJob.id, value);
      setMessage('وضعیت Import با موفقیت بروزرسانی شد.');
      query.refetch();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'اجرای عملیات ناموفق بود.');
    } finally {
      setPending(false);
      setCommitOpen(false);
    }
  };
  return (
    <DataDetailWrap>
      <DetailHeader
        backTo="/data/imports"
        backLabel="بازگشت به ورودی‌ها"
        title={importJob.id}
        badges={<StatusBadge value={importJob.status} />}
        meta={<EntityLink to={`/data/sources/${source.id}`}>{source.title}</EntityLink>}
        action={
          action && (
            <Button
              disabled={pending}
              onClick={() =>
                action.value === 'COMMIT' ? setCommitOpen(true) : void run(action.value)
              }
            >
              {pending ? 'در حال اجرا…' : action.label}
            </Button>
          )
        }
      />
      {message && (
        <motion.p
          className="rounded-none border bg-card px-4 py-3 text-sm"
          role="status"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {message}
        </motion.p>
      )}
      {importJob.errorMessage && (
        <p className=" border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {importJob.errorMessage}
        </p>
      )}
      <SectionCard title="مشخصات Import">
        <InfoGrid
          fields={[
            { label: 'شناسه', value: importJob.id, ltr: true },
            {
              label: 'منبع',
              value: <EntityLink to={`/data/sources/${source.id}`}>{source.title}</EntityLink>,
            },
            { label: 'سال', value: source.year?.toLocaleString('fa-IR', { useGrouping: false }) },
            {
              label: 'گروه آزمایشی',
              value: source.examGroup ? examGroupLabels[source.examGroup] : '—',
            },
            { label: 'شروع', value: formatDataDate(importJob.startedAt, true) },
            { label: 'پایان', value: formatDataDate(importJob.completedAt, true) },
          ]}
        />
      </SectionCard>
      <SectionCard title="خط پردازش">
        <Pipeline job={importJob} />
      </SectionCard>
      <SectionCard title="شاخص‌ها">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(importJob.metrics).map(([key, value], index) => (
            <motion.div
              key={key}
              className="rounded-none border p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <p className="text-xs text-muted-foreground">
                {
                  {
                    raw: 'خام',
                    parsed: 'استخراج‌شده',
                    valid: 'معتبر',
                    rejected: 'ردشده',
                    duplicates: 'تکراری',
                    committed: 'ثبت‌شده',
                  }[key]
                }
              </p>
              <p className="mt-1 text-xl font-semibold">{value.toLocaleString('fa-IR')}</p>
            </motion.div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="پیش‌نمایش رکوردهای خام">
        {rawRecords.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-xs">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="p-3 text-start">ردیف</th>
                  <th className="p-3 text-start">نام خام دانشگاه</th>
                  <th className="p-3 text-start">نام خام رشته</th>
                  <th className="p-3 text-start">کد</th>
                  <th className="p-3 text-start">اعتبار</th>
                  <th className="p-3 text-start">خطاها</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rawRecords.slice(0, 20).map((record, index) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(index * 0.025, 0.2) }}
                  >
                    <td className="p-3">{record.rowNumber.toLocaleString('fa-IR')}</td>
                    <td className="p-3">{record.rawUniversityName}</td>
                    <td className="p-3">{record.rawMajorName}</td>
                    <td className="p-3" dir="ltr">
                      {record.rawAdmissionCode ?? '—'}
                    </td>
                    <td className="p-3">
                      <StatusBadge value={record.validationState} />
                    </td>
                    <td className="p-3 text-muted-foreground">{record.errors.join('، ') || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <InlineEmpty>رکورد خامی ثبت نشده است.</InlineEmpty>
        )}
      </SectionCard>
      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="مسائل اعتبارسنجی">
          {issues.length ? (
            <div className="space-y-2">
              {issues.map((issue) => (
                <EntityLink key={issue.id} to={`/data/quality?issue=${issue.id}`}>
                  {issue.title}
                </EntityLink>
              ))}
            </div>
          ) : (
            <InlineEmpty>مسئله‌ای برای این Import وجود ندارد.</InlineEmpty>
          )}
        </SectionCard>
        <SectionCard title="تکراری‌ها">
          <p className="text-2xl font-semibold">
            {importJob.metrics.duplicates.toLocaleString('fa-IR')}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            رکورد تکراری در مرحله تشخیص تکراری شناسایی شده است.
          </p>
        </SectionCard>
      </div>
      <SectionCard title="تاریخچه">
        <HistoryList events={history} />
      </SectionCard>
      {commitOpen && (
        <CommitDialog
          job={importJob}
          pending={pending}
          onClose={() => setCommitOpen(false)}
          onConfirm={() => void run('COMMIT')}
        />
      )}
    </DataDetailWrap>
  );
}

function nextAction(job: ImportJob): { value: ImportAction; label: string } | null {
  const actions: Partial<Record<ImportJob['status'], { value: ImportAction; label: string }>> = {
    PENDING: { value: 'START', label: 'شروع پردازش' },
    PARSING: { value: 'VALIDATE', label: 'اعتبارسنجی' },
    VALIDATING: { value: 'PREPARE_COMMIT', label: 'آماده‌سازی ثبت' },
    REVIEW_REQUIRED: { value: 'PREPARE_COMMIT', label: 'آماده‌سازی ثبت' },
    READY_TO_COMMIT: { value: 'COMMIT', label: 'ثبت نهایی' },
    FAILED: { value: 'RETRY', label: 'تلاش مجدد' },
  };
  return actions[job.status] ?? null;
}

function Pipeline({ job }: { job: ImportJob }) {
  const current = currentStage(job.status);
  return (
    <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-7">
      {stages.map(([stage, label], index) => {
        const complete = job.stages.includes(stage);
        const isCurrent = !complete && stage === current;
        const failed = job.status === 'FAILED' && isCurrent;
        return (
          <motion.li
            key={stage}
            className="flex items-center gap-2 rounded-none border p-3 text-sm"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -2 }}
          >
            {complete ? (
              <CheckCircleIcon className="size-5 text-success" weight="fill" />
            ) : failed ? (
              <WarningCircleIcon className="size-5 text-destructive" weight="fill" />
            ) : (
              <CircleIcon
                className={isCurrent ? 'size-5 text-warning' : 'size-5 text-muted-foreground'}
              />
            )}
            <span className={isCurrent ? 'font-medium' : undefined}>{label}</span>
          </motion.li>
        );
      })}
    </ol>
  );
}

function currentStage(status: ImportJob['status']): ImportStage | undefined {
  const next: Partial<Record<ImportJob['status'], ImportStage>> = {
    PENDING: 'REGISTERED',
    PARSING: 'PARSED',
    VALIDATING: 'VALIDATED',
    REVIEW_REQUIRED: 'REVIEWED',
    READY_TO_COMMIT: 'COMMITTED',
    FAILED: 'PARSED',
  };
  return next[status];
}

function CommitDialog({
  job,
  pending,
  onClose,
  onConfirm,
}: {
  job: ImportJob;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="commit-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-md rounded-none p-5 shadow-xl">
          <h2 id="commit-title" className="text-lg font-semibold">
            تأیید ثبت نهایی
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            این Import پس از ثبت نهایی دوباره قابل Commit نیست.
          </p>
          <dl className="my-5 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-none border p-3">
              <dt className="text-muted-foreground">معتبر</dt>
              <dd className="mt-1 font-semibold">{job.metrics.valid.toLocaleString('fa-IR')}</dd>
            </div>
            <div className="rounded-none border p-3">
              <dt className="text-muted-foreground">تکراری</dt>
              <dd className="mt-1 font-semibold">
                {job.metrics.duplicates.toLocaleString('fa-IR')}
              </dd>
            </div>
            <div className="rounded-none border p-3">
              <dt className="text-muted-foreground">ردشده</dt>
              <dd className="mt-1 font-semibold">{job.metrics.rejected.toLocaleString('fa-IR')}</dd>
            </div>
          </dl>
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={pending} onClick={onClose}>
              انصراف
            </Button>
            <Button disabled={pending} onClick={onConfirm}>
              {pending ? 'در حال ثبت…' : statusLabels['COMMITTED']}
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
