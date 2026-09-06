import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataQuery } from '../../hooks/use-data';
import { dataRepository } from '../../services/data-repository';
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
import { EntityFormDialog } from '../../shared/entity-forms';
import { formatDataDate, issueTypeLabels, universityTypeLabels } from '../../shared/data-utils';
import type { Source } from '../../types/data.types';

export function UniversityDetailPage() {
  const { universityId } = useParams();
  const load = useCallback(
    (signal: AbortSignal) => dataRepository.getUniversity(universityId!, signal),
    [universityId],
  );
  const query = useDataQuery(load, Boolean(universityId));
  const sourceLoad = useCallback(() => dataRepository.listSourceOptions(), []);
  const sources = useDataQuery<Source[]>(sourceLoad);
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
        <NotFound label="دانشگاه" />
      </DataDetailWrap>
    );
  if (query.error || !query.data)
    return (
      <DataDetailWrap>
        <DetailError message={query.error ?? 'دریافت دانشگاه انجام نشد.'} onRetry={query.refetch} />
      </DataDetailWrap>
    );
  const { university, programs, issues, history } = query.data;
  return (
    <DataDetailWrap>
      <DetailHeader
        backTo="/data/universities"
        backLabel="بازگشت به دانشگاه‌ها"
        title={university.nameFa}
        badges={<StatusBadge value={university.status} />}
        meta={`${university.city ?? 'شهر ثبت نشده'} · ${universityTypeLabels[university.type]}`}
        action={
          <Button onClick={() => setEditing(true)}>
            <PencilSimpleIcon data-icon="inline-start" />
            ویرایش دانشگاه
          </Button>
        }
      />
      <Tabs defaultValue="overview">
        <TabsList className="max-w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">نمای کلی</TabsTrigger>
          <TabsTrigger value="programs">برنامه‌های دانشگاهی</TabsTrigger>
          <TabsTrigger value="sources">منابع</TabsTrigger>
          <TabsTrigger value="quality">کیفیت داده</TabsTrigger>
          <TabsTrigger value="history">تاریخچه</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <SectionCard title="اطلاعات دانشگاه">
            <InfoGrid
              fields={[
                { label: 'نام فارسی', value: university.nameFa },
                { label: 'نام انگلیسی', value: university.nameEn, ltr: true },
                { label: 'نام‌های جایگزین', value: university.aliases.join('، ') },
                { label: 'کشور', value: university.countryCode, ltr: true },
                { label: 'استان', value: university.province },
                { label: 'شهر', value: university.city },
                { label: 'نوع', value: universityTypeLabels[university.type] },
                {
                  label: 'وب‌سایت',
                  value: university.website ? (
                    <a
                      href={university.website}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {university.website}
                    </a>
                  ) : (
                    '—'
                  ),
                  ltr: true,
                },
                { label: 'ایجاد', value: formatDataDate(university.createdAt, true) },
                { label: 'بروزرسانی', value: formatDataDate(university.updatedAt, true) },
              ]}
            />
          </SectionCard>
        </TabsContent>
        <TabsContent value="programs">
          <SectionCard title={`برنامه‌های دانشگاهی (${programs.length.toLocaleString('fa-IR')})`}>
            {programs.length ? (
              <div className="divide-y">
                {programs.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <EntityLink to={`/data/programs/${item.id}`}>{item.titleFa}</EntityLink>
                      <p className="mt-1 text-xs text-muted-foreground">{item.major.nameFa}</p>
                    </div>
                    <StatusBadge value={item.status} />
                  </div>
                ))}
              </div>
            ) : (
              <InlineEmpty>برنامه‌ای ثبت نشده است.</InlineEmpty>
            )}
          </SectionCard>
        </TabsContent>
        <TabsContent value="sources">
          <SectionCard title="منابع و منشأ داده">
            <div className="divide-y">
              {query.data.sources.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <EntityLink to={`/data/sources/${item.id}`}>{item.title}</EntityLink>
                  <StatusBadge value={item.status} />
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
        <TabsContent value="quality">
          <SectionCard title="مسائل کیفیت داده">
            {issues.length ? (
              <div className="divide-y">
                {issues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between gap-3 py-3">
                    <EntityLink to={`/data/quality?issue=${issue.id}`}>{issue.title}</EntityLink>
                    <span className="text-xs text-muted-foreground">
                      {issueTypeLabels[issue.type]}
                    </span>
                    <StatusBadge value={issue.status} />
                  </div>
                ))}
              </div>
            ) : (
              <InlineEmpty>مسئله‌ای برای این دانشگاه ثبت نشده است.</InlineEmpty>
            )}
          </SectionCard>
        </TabsContent>
        <TabsContent value="history">
          <SectionCard title="تاریخچه تغییرات">
            <HistoryList events={history} />
          </SectionCard>
        </TabsContent>
      </Tabs>
      {editing && (
        <EntityFormDialog
          kind="university"
          entity={university}
          sources={sources.data ?? []}
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
export function DataDetailWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-w-0 flex-1 bg-muted/20">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
}
