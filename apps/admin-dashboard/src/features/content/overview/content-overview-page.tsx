import { ChatCircleTextIcon, ClockIcon, FileTextIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminSession } from '@/features/users/hooks/use-users';
import { contentRepository } from '../repository/content-repository';
import { formatContentDate, historyLabels, postStatusLabels } from '../shared/content-utils';
import { CONTENT_PERMISSIONS } from '../shared/content.types';
import { ContentLoading, ContentPage, InlineError, PostStatusBadge } from '../shared/content-ui';
import { useContentQuery } from '../shared/use-content-query';

export function ContentOverviewPage() {
  const session = useAdminSession();
  const canRead = Boolean(session.data?.user?.permissions.includes(CONTENT_PERMISSIONS.read));
  const load = useCallback((signal: AbortSignal) => contentRepository.getOverview(signal), []);
  const query = useContentQuery(load, canRead);

  return (
    <ContentPage title="محتوا" description="نمای عملیاتی نوشته‌ها، صف بررسی و انتشارهای برنامه‌ریزی‌شده">
      {session.loading || query.loading ? (
        <ContentLoading />
      ) : session.error || !session.data?.user ? (
        <InlineError message={session.error ?? 'اطلاعات مدیر محلی بارگذاری نشد.'} onRetry={session.refetch} />
      ) : !canRead ? (
        <InlineError message="دسترسی مشاهده محتوای وبلاگ را ندارید." />
      ) : query.error || !query.data ? (
        <InlineError message={query.error ?? 'اطلاعات محتوا در دسترس نیست.'} onRetry={query.refetch} />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="شاخص‌های محتوا">
            {[
              ['کل نوشته‌ها', query.data.metrics.totalPosts],
              ['پیش‌نویس‌ها', query.data.metrics.drafts],
              ['در انتظار بررسی', query.data.metrics.inReview],
              ['زمان‌بندی‌شده', query.data.metrics.scheduled],
              ['منتشرشده', query.data.metrics.published],
            ].map(([label, value]) => (
              <Card key={label} className="p-4 shadow-none ring-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {Number(value).toLocaleString('fa-IR')}
                </p>
              </Card>
            ))}
          </section>

          <section className="grid min-w-0 gap-5 xl:grid-cols-3">
            <OverviewList
              title="نیازمند اقدام"
              icon={<FileTextIcon />}
              empty="نوشته‌ای در صف بررسی نیست."
              items={query.data.needsReview.map((post) => ({
                id: post.id,
                title: post.title,
                meta: postStatusLabels[post.status],
                to: `/content/posts/${post.id}`,
              }))}
            />
            <OverviewList
              title="انتشارهای نزدیک"
              icon={<ClockIcon />}
              empty="نوشته زمان‌بندی‌شده‌ای وجود ندارد."
              items={query.data.approachingSchedule.map((post) => ({
                id: post.id,
                title: post.title,
                meta: formatContentDate(post.scheduledAt),
                to: `/content/posts/${post.id}`,
              }))}
            />
            <OverviewList
              title={`دیدگاه‌های منتظر (${query.data.metrics.pendingComments.toLocaleString('fa-IR')})`}
              icon={<ChatCircleTextIcon />}
              empty="دیدگاه منتظری وجود ندارد."
              items={query.data.pendingComments.map((comment) => ({
                id: comment.id,
                title: comment.postTitle,
                meta: comment.body,
                to: '/content/comments?status=PENDING',
              }))}
            />
          </section>

          <section className="grid min-w-0 gap-5 xl:grid-cols-[1.2fr_.8fr]">
            <Card className="shadow-none ring-0">
              <CardHeader>
                <CardTitle className="text-base">آخرین نوشته‌های ویرایش‌شده</CardTitle>
              </CardHeader>
              <CardContent className="divide-y p-0">
                {query.data.recentlyEdited.map((post) => (
                  <Link
                    key={post.id}
                    to={`/content/posts/${post.id}`}
                    className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-muted/40"
                  >
                    <span className="min-w-0 truncate text-sm font-medium">{post.title}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <PostStatusBadge status={post.status} />
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {formatContentDate(post.updatedAt)}
                      </span>
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
            <Card className="shadow-none ring-0">
              <CardHeader>
                <CardTitle className="text-base">وضعیت محتوا</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {query.data.history.map((event) => (
                  <div key={event.id} className="flex items-start justify-between gap-3 border-b pb-3 last:border-0">
                    <span className="text-sm">{historyLabels[event.action]}</span>
                    <time className="shrink-0 text-xs text-muted-foreground">
                      {formatContentDate(event.createdAt)}
                    </time>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </ContentPage>
  );
}

function OverviewList({
  title,
  icon,
  items,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  items: { id: string; title: string; meta: string; to: string }[];
  empty: string;
}) {
  return (
    <Card className="shadow-none ring-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length ? (
          items.map((item) => (
            <Link key={item.id} to={item.to} className="block border-b py-2 last:border-0 hover:text-primary">
              <span className="block truncate text-sm font-medium">{item.title}</span>
              <span className="mt-1 block line-clamp-1 text-xs text-muted-foreground">{item.meta}</span>
            </Link>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>
        )}
      </CardContent>
    </Card>
  );
}
