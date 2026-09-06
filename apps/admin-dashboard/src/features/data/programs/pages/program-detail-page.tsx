import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useDataQuery } from '../../hooks/use-data';
import { dataRepository } from '../../services/data-repository';
import {
  DetailError,
  DetailHeader,
  EntityLink,
  HistoryList,
  InfoGrid,
  LoadingDetail,
  NotFound,
  SectionCard,
  StatusBadge,
} from '../../shared/data-ui';
import { EntityFormDialog } from '../../shared/entity-forms';
import { degreeLabels, examGroupLabels, formatDataDate } from '../../shared/data-utils';
import { DataDetailWrap } from '../../universities/pages/university-detail-page';
import type { Major, Source, University } from '../../types/data.types';

export function ProgramDetailPage() {
  const { programId } = useParams();
  const load = useCallback(
    (signal: AbortSignal) => dataRepository.getProgram(programId!, signal),
    [programId],
  );
  const query = useDataQuery(load, Boolean(programId));
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
  const [editing, setEditing] = useState(false);
  if (query.loading)
    return (
      <DataDetailWrap>
        <LoadingDetail />
      </DataDetailWrap>
    );
  if (query.error?.includes('پیدا نشد'))
    return (
      <DataDetailWrap>
        <NotFound label="برنامه دانشگاهی" />
      </DataDetailWrap>
    );
  if (query.error || !query.data)
    return (
      <DataDetailWrap>
        <DetailError message={query.error ?? 'دریافت برنامه انجام نشد.'} onRetry={query.refetch} />
      </DataDetailWrap>
    );
  const { program, admissions, sources, issues, history } = query.data;
  const [universities = [], majors = [], sourceOptions = []] = options.data ?? [];
  return (
    <DataDetailWrap>
      <DetailHeader
        backTo="/data/programs"
        backLabel="بازگشت به برنامه‌ها"
        title={program.titleFa}
        badges={<StatusBadge value={program.status} />}
        meta={
          <>
            <EntityLink to={`/data/universities/${program.university.id}`}>
              {program.university.nameFa}
            </EntityLink>
            <span className="mx-2">·</span>
            <EntityLink to={`/data/majors/${program.major.id}`}>{program.major.nameFa}</EntityLink>
          </>
        }
        action={
          <Button onClick={() => setEditing(true)}>
            <PencilSimpleIcon data-icon="inline-start" />
            ویرایش برنامه
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="مشخصات برنامه">
          <InfoGrid
            fields={[
              {
                label: 'دانشگاه',
                value: (
                  <EntityLink to={`/data/universities/${program.university.id}`}>
                    {program.university.nameFa}
                  </EntityLink>
                ),
              },
              {
                label: 'رشته',
                value: (
                  <EntityLink to={`/data/majors/${program.major.id}`}>
                    {program.major.nameFa}
                  </EntityLink>
                ),
              },
              { label: 'مقطع', value: degreeLabels[program.degreeLevel] },
              {
                label: 'پذیرش‌های فعال',
                value: program.activeAdmissionCount.toLocaleString('fa-IR'),
              },
              { label: 'ایجاد', value: formatDataDate(program.createdAt) },
              { label: 'بروزرسانی', value: formatDataDate(program.updatedAt) },
            ]}
          />
        </SectionCard>
        <SectionCard title="منشأ و کیفیت">
          <div className="space-y-2">
            {sources.map((item) => (
              <div key={item.id}>
                <EntityLink to={`/data/sources/${item.id}`}>{item.title}</EntityLink>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t pt-4">
            {issues.length ? (
              issues.map((issue) => (
                <div key={issue.id}>
                  <EntityLink to={`/data/quality?issue=${issue.id}`}>{issue.title}</EntityLink>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">مسئلهٔ بازی ثبت نشده است.</p>
            )}
          </div>
        </SectionCard>
      </div>
      <SectionCard title="پذیرش‌های مرتبط">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="py-2 text-start">کد</th>
                <th className="py-2 text-start">سال</th>
                <th className="py-2 text-start">گروه</th>
                <th className="py-2 text-start">ظرفیت</th>
                <th className="py-2 text-start">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {admissions.map((item) => (
                <tr key={item.id}>
                  <td className="py-3">
                    <EntityLink to={`/data/admissions/${item.id}`}>
                      {item.admissionCode ?? item.id}
                    </EntityLink>
                  </td>
                  <td>{item.year.toLocaleString('fa-IR', { useGrouping: false })}</td>
                  <td>{item.examGroup ? examGroupLabels[item.examGroup] : '—'}</td>
                  <td>{item.capacity?.toLocaleString('fa-IR') ?? '—'}</td>
                  <td>
                    <StatusBadge value={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
      <SectionCard title="تاریخچه">
        <HistoryList events={history} />
      </SectionCard>
      {editing && (
        <EntityFormDialog
          kind="program"
          entity={program}
          universities={universities}
          majors={majors}
          sources={sourceOptions}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            query.refetch();
          }}
        />
      )}
    </DataDetailWrap>
  );
}
