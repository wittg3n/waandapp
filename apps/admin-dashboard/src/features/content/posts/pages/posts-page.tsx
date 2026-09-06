import { DotsThreeVerticalIcon, EyeIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAdminSession } from '@/features/users/hooks/use-users';
import { contentRepository } from '../../repository/content-repository';
import { formatContentDate, postStatusLabels } from '../../shared/content-utils';
import type { MediaAsset, PostRow, PostTransition } from '../../shared/content.types';
import { CONTENT_PERMISSIONS } from '../../shared/content.types';
import {
  ContentPage,
  ContentTable,
  ContentToolbar,
  InlineError,
  NewContentLink,
  PostStatusBadge,
  selectClassName,
  type ContentColumn,
} from '../../shared/content-ui';
import { useContentQuery } from '../../shared/use-content-query';
import { PostPreview } from '../components/post-preview';

export function PostsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const session = useAdminSession();
  const permissions = session.data?.user?.permissions ?? [];
  const canRead = permissions.includes(CONTENT_PERMISSIONS.read);
  const canCreate = permissions.includes(CONTENT_PERMISSIONS.create);
  const canPublish = permissions.includes(CONTENT_PERMISSIONS.publish);
  const canArchive = permissions.includes(CONTENT_PERMISSIONS.archive);
  const [preview, setPreview] = useState<PostRow | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const query = useContentQuery(
    useCallback(
      (signal: AbortSignal) =>
        contentRepository.listPosts(
          {
            search: params.get('search') || undefined,
            status: (params.get('status') || undefined) as PostRow['status'] | undefined,
            category: params.get('category') || undefined,
            author: params.get('author') || undefined,
            tag: params.get('tag') || undefined,
            sort: (params.get('sort') || 'updatedAt') as 'updatedAt' | 'createdAt' | 'publishedAt' | 'title',
            page: Number(params.get('page')) || 1,
            pageSize: (Number(params.get('pageSize')) || 20) as 20 | 50 | 100,
          },
          signal,
        ),
      [params],
    ),
    canRead,
  );
  const options = useContentQuery(
    useCallback(
      async (signal: AbortSignal) => {
        const [categories, tags, media] = await Promise.all([
          contentRepository.listCategories(signal),
          contentRepository.listTags(signal),
          contentRepository.listMedia('', signal),
        ]);
        return { categories, tags, media };
      },
      [],
    ),
    canRead,
  );

  function changeParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setParams(next);
  }

  async function runRowAction(post: PostRow, action: 'duplicate' | PostTransition) {
    setOperationError(null);
    try {
      if (action === 'duplicate') {
        const copy = await contentRepository.duplicatePost(post.id, session.data!.user!.id);
        navigate(`/content/posts/${copy.id}`);
      } else {
        await contentRepository.transitionPost(post.id, action, { adminId: session.data!.user!.id });
        query.refetch();
      }
    } catch (error) {
      setOperationError(error instanceof Error ? error.message : 'عملیات انجام نشد.');
    }
  }

  const columns: ContentColumn<PostRow>[] = [
      {
        key: 'post',
        title: 'نوشته',
        render: (post) => (
          <div className="flex min-w-64 items-center gap-3">
            {post.cover ? (
              <img src={post.cover.url} alt="" className="size-12 shrink-0 object-cover" />
            ) : (
              <div className="size-12 shrink-0 bg-muted" />
            )}
            <div className="min-w-0">
              <p className="truncate font-medium">{post.title || 'بدون عنوان'}</p>
              <p className="mt-1 truncate text-[11px] text-muted-foreground" dir="ltr">
                /posts/{post.slug}
              </p>
            </div>
          </div>
        ),
      },
      { key: 'status', title: 'وضعیت', render: (post) => <PostStatusBadge status={post.status} /> },
      { key: 'category', title: 'دسته‌بندی', render: (post) => post.category.name },
      { key: 'author', title: 'نویسنده', render: (post) => post.authorName },
      { key: 'updated', title: 'آخرین ویرایش', render: (post) => formatContentDate(post.updatedAt) },
      {
        key: 'publish',
        title: 'انتشار / زمان‌بندی',
        render: (post) => formatContentDate(post.publishedAt ?? post.scheduledAt),
      },
      {
        key: 'actions',
        title: 'عملیات',
        className: 'w-20',
        render: (post) => (
          <details onClick={(event) => event.stopPropagation()} className="relative">
            <summary className="grid size-8 cursor-pointer list-none place-items-center hover:bg-muted" aria-label="عملیات نوشته">
              <DotsThreeVerticalIcon />
            </summary>
            <div className="absolute end-0 z-20 mt-1 grid min-w-44 border bg-background p-1 shadow-lg">
              <MenuButton onClick={() => navigate(`/content/posts/${post.id}`)}>ویرایش</MenuButton>
              <MenuButton onClick={() => setPreview(post)}>
                <EyeIcon data-icon="inline-start" /> پیش‌نمایش
              </MenuButton>
              {canCreate && <MenuButton onClick={() => void runRowAction(post, 'duplicate')}>تکثیر نوشته</MenuButton>}
              {post.status === 'DRAFT' && <MenuButton onClick={() => void runRowAction(post, 'SUBMIT_REVIEW')}>ارسال برای بررسی</MenuButton>}
              {post.status === 'IN_REVIEW' && <MenuButton onClick={() => void runRowAction(post, 'RETURN_TO_DRAFT')}>بازگشت به پیش‌نویس</MenuButton>}
              {post.status === 'SCHEDULED' && canPublish && <MenuButton onClick={() => void runRowAction(post, 'PUBLISH_NOW')}>انتشار اکنون</MenuButton>}
              {post.status === 'PUBLISHED' && canArchive && <MenuButton destructive onClick={() => void runRowAction(post, 'ARCHIVE')}>آرشیو</MenuButton>}
              {post.status === 'ARCHIVED' && <MenuButton onClick={() => void runRowAction(post, 'RESTORE')}>بازیابی</MenuButton>}
            </div>
          </details>
        ),
      },
    ];

  return (
    <ContentPage
      title="نوشته‌ها"
      description="مدیریت چرخه نگارش، بررسی، زمان‌بندی و انتشار مقاله‌های وبلاگ"
      action={canCreate ? <NewContentLink to="/content/posts/new">نوشته جدید</NewContentLink> : undefined}
    >
      {operationError && <InlineError message={operationError} />}
      {session.error ? (
        <InlineError message={session.error} onRetry={session.refetch} />
      ) : !session.loading && !canRead ? (
        <InlineError message="دسترسی مشاهده نوشته‌ها را ندارید." />
      ) : (
        <>
          <ContentToolbar
            params={params}
            total={query.data?.total ?? 0}
            onChange={changeParam}
            onReset={() => setParams({})}
          >
            <select className={selectClassName} value={params.get('status') ?? ''} onChange={(event) => changeParam('status', event.target.value)} aria-label="وضعیت نوشته">
              <option value="">همه وضعیت‌ها</option>
              {Object.entries(postStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select className={selectClassName} value={params.get('category') ?? ''} onChange={(event) => changeParam('category', event.target.value)} aria-label="دسته‌بندی">
              <option value="">همه دسته‌بندی‌ها</option>
              {options.data?.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select className={selectClassName} value={params.get('tag') ?? ''} onChange={(event) => changeParam('tag', event.target.value)} aria-label="برچسب">
              <option value="">همه برچسب‌ها</option>
              {options.data?.tags.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select className={selectClassName} value={params.get('author') ?? ''} onChange={(event) => changeParam('author', event.target.value)} aria-label="نویسنده">
              <option value="">همه نویسنده‌ها</option>
              <option value="local-admin">مدیر محلی</option>
            </select>
            <select className={selectClassName} value={params.get('sort') ?? 'updatedAt'} onChange={(event) => changeParam('sort', event.target.value)} aria-label="مرتب‌سازی">
              <option value="updatedAt">آخرین ویرایش</option>
              <option value="createdAt">تاریخ ایجاد</option>
              <option value="publishedAt">تاریخ انتشار</option>
              <option value="title">عنوان</option>
            </select>
            <select className={selectClassName} value={params.get('pageSize') ?? '20'} onChange={(event) => changeParam('pageSize', event.target.value)} aria-label="تعداد در صفحه">
              <option value="20">۲۰ در صفحه</option><option value="50">۵۰ در صفحه</option><option value="100">۱۰۰ در صفحه</option>
            </select>
          </ContentToolbar>
          <ContentTable
            result={query.data}
            loading={session.loading || query.loading}
            error={query.error}
            columns={columns}
            onRowClick={(post) => navigate(`/content/posts/${post.id}`)}
            onRetry={query.refetch}
            onPageChange={(page) => changeParam('page', String(page))}
            empty="نوشته‌ای با این فیلترها پیدا نشد."
          />
        </>
      )}
      {preview && options.data && (
        <PostPreview
          post={preview}
          category={preview.category}
          tags={preview.tags}
          media={options.data.media as MediaAsset[]}
          authorName={preview.authorName}
          onClose={() => setPreview(null)}
        />
      )}
    </ContentPage>
  );
}

function MenuButton({ children, onClick, destructive }: { children: React.ReactNode; onClick: () => void; destructive?: boolean }) {
  return (
    <button type="button" className={`flex items-center gap-2 px-3 py-2 text-start text-xs hover:bg-muted ${destructive ? 'text-destructive' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}
