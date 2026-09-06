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
import { issueTypeLabels } from '../../shared/data-utils';
import { DataDetailWrap } from '../../universities/pages/university-detail-page';
import type { Source } from '../../types/data.types';

export function MajorDetailPage() {
  const { majorId } = useParams();
  const load = useCallback(
    (signal: AbortSignal) => dataRepository.getMajor(majorId!, signal),
    [majorId],
  );
  const query = useDataQuery(load, Boolean(majorId));
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
        <NotFound label="رشته" />
      </DataDetailWrap>
    );
  if (query.error || !query.data)
    return (
      <DataDetailWrap>
        <DetailError message={query.error ?? 'دریافت رشته انجام نشد.'} onRetry={query.refetch} />
      </DataDetailWrap>
    );
  const { major, programs, universities, issues, history } = query.data;
  return (
    <DataDetailWrap>
      <DetailHeader
        backTo="/data/majors"
        backLabel="بازگشت به رشته‌ها"
        title={major.nameFa}
        badges={<StatusBadge value={major.status} />}
        meta={major.nameEn}
        action={
          <Button onClick={() => setEditing(true)}>
            <PencilSimpleIcon data-icon="inline-start" />
            ویرایش رشته
          </Button>
        }
      />
      <Tabs defaultValue="overview">
        <TabsList className="max-w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">نمای کلی</TabsTrigger>
          <TabsTrigger value="programs">برنامه‌ها</TabsTrigger>
          <TabsTrigger value="universities">دانشگاه‌ها</TabsTrigger>
          <TabsTrigger value="sources">منابع</TabsTrigger>
          <TabsTrigger value="quality">کیفیت داده</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <SectionCard title="اطلاعات رشته">
            <InfoGrid
              fields={[
                { label: 'نام فارسی', value: major.nameFa },
                { label: 'نام انگلیسی', value: major.nameEn, ltr: true },
                { label: 'نام‌های جایگزین', value: major.aliases.join('، ') || '—' },
                { label: 'تعداد برنامه‌ها', value: programs.length.toLocaleString('fa-IR') },
                { label: 'تعداد دانشگاه‌ها', value: universities.length.toLocaleString('fa-IR') },
              ]}
            />
          </SectionCard>
        </TabsContent>
        <TabsContent value="programs">
          <SectionCard title="برنامه‌ها">
            {programs.length ? (
              <div className="divide-y">
                {programs.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3 py-3">
                    <div>
                      <EntityLink to={`/data/programs/${item.id}`}>{item.titleFa}</EntityLink>
                      <p className="mt-1 text-xs text-muted-foreground">{item.university.nameFa}</p>
                    </div>
                    <StatusBadge value={item.status} />
                  </div>
                ))}
              </div>
            ) : (
              <InlineEmpty>برنامه‌ای وجود ندارد.</InlineEmpty>
            )}
          </SectionCard>
        </TabsContent>
        <TabsContent value="universities">
          <SectionCard title="دانشگاه‌های ارائه‌دهنده">
            <div className="grid gap-3 sm:grid-cols-2">
              {universities.map((item) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <EntityLink to={`/data/universities/${item.id}`}>{item.nameFa}</EntityLink>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.city ?? 'موقعیت ثبت نشده'}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
        <TabsContent value="sources">
          <SectionCard title="منابع">
            {query.data.sources.map((item) => (
              <div key={item.id} className="py-2">
                <EntityLink to={`/data/sources/${item.id}`}>{item.title}</EntityLink>
              </div>
            ))}
          </SectionCard>
        </TabsContent>
        <TabsContent value="quality">
          <SectionCard title="کیفیت داده">
            {issues.length ? (
              issues.map((issue) => (
                <div key={issue.id} className="flex justify-between py-2">
                  <EntityLink to={`/data/quality?issue=${issue.id}`}>{issue.title}</EntityLink>
                  <span className="text-xs text-muted-foreground">
                    {issueTypeLabels[issue.type]}
                  </span>
                </div>
              ))
            ) : (
              <InlineEmpty>مسئله‌ای ثبت نشده است.</InlineEmpty>
            )}
          </SectionCard>
          <SectionCard title="تاریخچه" className="mt-4">
            <HistoryList events={history} />
          </SectionCard>
        </TabsContent>
      </Tabs>
      {editing && (
        <EntityFormDialog
          kind="major"
          entity={major}
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
