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
import type { ProgramRow, Source } from '../../types/data.types';

export function AdmissionDetailPage() {
  const { admissionId } = useParams();
  const load = useCallback(
    (signal: AbortSignal) => dataRepository.getAdmission(admissionId!, signal),
    [admissionId],
  );
  const query = useDataQuery(load, Boolean(admissionId));
  const optionLoad = useCallback(
    () => Promise.all([dataRepository.listProgramOptions(), dataRepository.listSourceOptions()]),
    [],
  );
  const options = useDataQuery<[ProgramRow[], Source[]]>(optionLoad);
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
        <NotFound label="پذیرش" />
      </DataDetailWrap>
    );
  if (query.error || !query.data)
    return (
      <DataDetailWrap>
        <DetailError message={query.error ?? 'دریافت پذیرش انجام نشد.'} onRetry={query.refetch} />
      </DataDetailWrap>
    );
  const { admission, history } = query.data;
  const [programs = [], sources = []] = options.data ?? [];
  return (
    <DataDetailWrap>
      <DetailHeader
        backTo="/data/admissions"
        backLabel="بازگشت به پذیرش‌ها"
        title={`پذیرش ${admission.admissionCode ?? admission.id}`}
        badges={<StatusBadge value={admission.status} />}
        meta="رکورد ظرفیت و ارائه برنامه دانشگاهی؛ مستقل از درخواست‌های کاربران"
        action={
          <Button onClick={() => setEditing(true)}>
            <PencilSimpleIcon data-icon="inline-start" />
            ویرایش پذیرش
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="شناسه‌ها و مشخصات">
          <InfoGrid
            fields={[
              { label: 'کد پذیرش', value: admission.admissionCode, ltr: true },
              {
                label: 'سال',
                value: admission.year.toLocaleString('fa-IR', { useGrouping: false }),
              },
              {
                label: 'گروه آزمایشی',
                value: admission.examGroup ? examGroupLabels[admission.examGroup] : '—',
              },
              { label: 'ظرفیت', value: admission.capacity?.toLocaleString('fa-IR') },
              { label: 'نوع پذیرش', value: admission.admissionType },
              { label: 'مقطع', value: degreeLabels[admission.program.degreeLevel] },
            ]}
          />
        </SectionCard>
        <SectionCard title="روابط و منشأ">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">برنامه</p>
              <EntityLink to={`/data/programs/${admission.program.id}`}>
                {admission.program.titleFa}
              </EntityLink>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">دانشگاه</p>
              <EntityLink to={`/data/universities/${admission.university.id}`}>
                {admission.university.nameFa}
              </EntityLink>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">رشته</p>
              <EntityLink to={`/data/majors/${admission.major.id}`}>
                {admission.major.nameFa}
              </EntityLink>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">منبع</p>
              <EntityLink to={`/data/sources/${admission.source.id}`}>
                {admission.source.title}
              </EntityLink>
            </div>
          </div>
        </SectionCard>
      </div>
      <SectionCard title="یادداشت و تاریخچه">
        <p className="mb-4 text-sm text-muted-foreground">
          {admission.notes ?? 'یادداشتی ثبت نشده است.'}
        </p>
        <InfoGrid
          fields={[
            { label: 'ایجاد', value: formatDataDate(admission.createdAt, true) },
            { label: 'بروزرسانی', value: formatDataDate(admission.updatedAt, true) },
          ]}
        />
        <div className="mt-5 border-t pt-5">
          <HistoryList events={history} />
        </div>
      </SectionCard>
      {editing && (
        <EntityFormDialog
          kind="admission"
          entity={admission}
          programs={programs}
          sources={sources}
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
