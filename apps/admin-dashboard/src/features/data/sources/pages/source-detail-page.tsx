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
import { examGroupLabels, formatDataDate, sourceTypeLabels } from '../../shared/data-utils';
import { DataDetailWrap } from '../../universities/pages/university-detail-page';

export function SourceDetailPage() {
  const { sourceId } = useParams();
  const load = useCallback(
    (signal: AbortSignal) => dataRepository.getSource(sourceId!, signal),
    [sourceId],
  );
  const query = useDataQuery(load, Boolean(sourceId));
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
        <NotFound label="منبع" />
      </DataDetailWrap>
    );
  if (query.error || !query.data)
    return (
      <DataDetailWrap>
        <DetailError message={query.error ?? 'دریافت منبع انجام نشد.'} onRetry={query.refetch} />
      </DataDetailWrap>
    );
  const { source, imports, universities, majors, programs, admissions, history } = query.data;
  return (
    <DataDetailWrap>
      <DetailHeader
        backTo="/data/sources"
        backLabel="بازگشت به منابع"
        title={source.title}
        badges={<StatusBadge value={source.status} />}
        meta={sourceTypeLabels[source.type]}
        action={
          <Button onClick={() => setEditing(true)}>
            <PencilSimpleIcon data-icon="inline-start" />
            ویرایش منبع
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="مشخصات منبع">
          <InfoGrid
            fields={[
              { label: 'نوع', value: sourceTypeLabels[source.type] },
              { label: 'نام فایل', value: source.filename, ltr: true },
              {
                label: 'نشانی منبع',
                value: source.sourceUrl ? (
                  <a
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {source.sourceUrl}
                  </a>
                ) : (
                  '—'
                ),
                ltr: true,
              },
              { label: 'سال', value: source.year?.toLocaleString('fa-IR', { useGrouping: false }) },
              {
                label: 'گروه آزمایشی',
                value: source.examGroup ? examGroupLabels[source.examGroup] : '—',
              },
              { label: 'آخرین بروزرسانی', value: formatDataDate(source.updatedAt, true) },
            ]}
          />
        </SectionCard>
        <SectionCard title="آمار اثر">
          <InfoGrid
            fields={[
              {
                label: 'کل رکوردهای مرتبط',
                value: source.relatedRecordCount.toLocaleString('fa-IR'),
              },
              { label: 'دانشگاه‌ها', value: universities.length.toLocaleString('fa-IR') },
              { label: 'رشته‌ها', value: majors.length.toLocaleString('fa-IR') },
              { label: 'برنامه‌ها', value: programs.length.toLocaleString('fa-IR') },
              { label: 'پذیرش‌ها', value: admissions.length.toLocaleString('fa-IR') },
              { label: 'Importها', value: imports.length.toLocaleString('fa-IR') },
            ]}
          />
        </SectionCard>
      </div>
      <SectionCard title="Importهای منبع">
        <div className="divide-y">
          {imports.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3">
              <EntityLink to={`/data/imports/${item.id}`}>{item.id}</EntityLink>
              <StatusBadge value={item.status} />
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="نمونه موجودیت‌های متأثر">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {universities.slice(0, 4).map((item) => (
            <EntityLink key={item.id} to={`/data/universities/${item.id}`}>
              {item.nameFa}
            </EntityLink>
          ))}
          {programs.slice(0, 4).map((item) => (
            <EntityLink key={item.id} to={`/data/programs/${item.id}`}>
              {item.titleFa}
            </EntityLink>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="تاریخچه">
        <HistoryList events={history} />
      </SectionCard>
      {editing && (
        <EntityFormDialog
          kind="source"
          entity={source}
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
