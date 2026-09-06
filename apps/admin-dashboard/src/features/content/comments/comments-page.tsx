import { CheckIcon, ProhibitIcon, TrashIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useAdminSession } from '@/features/users/hooks/use-users';
import { contentRepository } from '../repository/content-repository';
import { formatContentDate } from '../shared/content-utils';
import type { CommentRow, CommentStatus } from '../shared/content.types';
import { CONTENT_PERMISSIONS } from '../shared/content.types';
import { CommentStatusBadge, ContentPage, ContentTable, ContentToolbar, InlineError, selectClassName, type ContentColumn } from '../shared/content-ui';
import { useContentQuery } from '../shared/use-content-query';

export function CommentsPage() {
  const [params, setParams] = useSearchParams(); const session = useAdminSession(); const admin = session.data?.user; const canModerate = admin?.permissions.includes(CONTENT_PERMISSIONS.commentsModerate) ?? false; const [operationError, setOperationError] = useState<string | null>(null);
  const query = useContentQuery(useCallback((signal: AbortSignal) => contentRepository.listComments({ search: params.get('search') || undefined, status: (params.get('status') || undefined) as CommentStatus | undefined, post: params.get('post') || undefined, date: params.get('date') || undefined, page: Number(params.get('page')) || 1, pageSize: (Number(params.get('pageSize')) || 20) as 20 | 50 | 100 }, signal), [params]));
  const posts = useContentQuery(useCallback((signal: AbortSignal) => contentRepository.listPosts({ pageSize: 100 }, signal), []));
  function changeParam(key: string, value: string) { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); if (key !== 'page') next.set('page', '1'); setParams(next); }
  async function moderate(comment: CommentRow, status: CommentStatus) { if (!admin) return; setOperationError(null); try { await contentRepository.moderateComment(comment.id, status, admin.id); query.refetch(); } catch (error) { setOperationError(error instanceof Error ? error.message : 'عملیات انجام نشد.'); } }
  async function remove(comment: CommentRow) { if (!window.confirm('این دیدگاه برای همیشه حذف شود؟ این اقدام قابل بازگشت نیست.')) return; setOperationError(null); try { await contentRepository.deleteComment(comment.id); query.refetch(); } catch (error) { setOperationError(error instanceof Error ? error.message : 'حذف انجام نشد.'); } }
  const columns: ContentColumn<CommentRow>[] = [
    { key: 'author', title: 'نویسنده', render: (item) => item.authorUserId ? <Link className="font-medium hover:underline" to={`/users/${item.authorUserId}`}>کاربر واند</Link> : <div><p className="font-medium">{item.guestName ?? 'مهمان'}</p>{item.guestEmail && <p className="mt-1 text-[11px] text-muted-foreground" dir="ltr">{item.guestEmail}</p>}</div> },
    { key: 'body', title: 'دیدگاه', render: (item) => <p className="max-w-lg line-clamp-2 leading-6">{item.body}</p> },
    { key: 'post', title: 'نوشته', render: (item) => <Link className="max-w-56 truncate hover:underline" to={`/content/posts/${item.postId}`}>{item.postTitle}</Link> },
    { key: 'status', title: 'وضعیت', render: (item) => <CommentStatusBadge status={item.status} /> },
    { key: 'date', title: 'تاریخ', render: (item) => formatContentDate(item.createdAt) },
    { key: 'actions', title: 'عملیات', className: 'min-w-40', render: (item) => <CommentActions comment={item} disabled={!canModerate} onModerate={(status) => void moderate(item, status)} onDelete={() => void remove(item)} /> },
  ];
  return <ContentPage title="نظرات" description="بررسی و مدیریت دیدگاه‌های محلی وبلاگ؛ این بخش هنوز به وبلاگ عمومی متصل نیست.">{operationError && <InlineError message={operationError} />}<ContentToolbar params={params} total={query.data?.total ?? 0} onChange={changeParam} onReset={() => setParams({})}><select className={selectClassName} value={params.get('status') ?? ''} onChange={(event) => changeParam('status', event.target.value)}><option value="">همه وضعیت‌ها</option><option value="PENDING">در انتظار بررسی</option><option value="APPROVED">تأییدشده</option><option value="SPAM">اسپم</option><option value="TRASHED">زباله‌دان</option></select><select className={selectClassName} value={params.get('post') ?? ''} onChange={(event) => changeParam('post', event.target.value)}><option value="">همه نوشته‌ها</option>{posts.data?.items.map((post) => <option key={post.id} value={post.id}>{post.title}</option>)}</select><input className={selectClassName} type="date" value={params.get('date') ?? ''} onChange={(event) => changeParam('date', event.target.value)} /><select className={selectClassName} value={params.get('pageSize') ?? '20'} onChange={(event) => changeParam('pageSize', event.target.value)}><option value="20">۲۰ در صفحه</option><option value="50">۵۰ در صفحه</option><option value="100">۱۰۰ در صفحه</option></select></ContentToolbar><ContentTable result={query.data} loading={query.loading} error={query.error} columns={columns} onRetry={query.refetch} onPageChange={(page) => changeParam('page', String(page))} empty="دیدگاهی با این شرایط پیدا نشد." /></ContentPage>;
}

function CommentActions({ comment, disabled, onModerate, onDelete }: { comment: CommentRow; disabled: boolean; onModerate: (status: CommentStatus) => void; onDelete: () => void }) {
  return <div className="flex flex-wrap gap-1" onClick={(event) => event.stopPropagation()}>{comment.status === 'PENDING' && <><Action label="تأیید" disabled={disabled} onClick={() => onModerate('APPROVED')}><CheckIcon /></Action><Action label="اسپم" disabled={disabled} onClick={() => onModerate('SPAM')}><ProhibitIcon /></Action><Action label="زباله‌دان" disabled={disabled} onClick={() => onModerate('TRASHED')}><TrashIcon /></Action></>}{comment.status === 'APPROVED' && <><Action label="اسپم" disabled={disabled} onClick={() => onModerate('SPAM')}><ProhibitIcon /></Action><Action label="زباله‌دان" disabled={disabled} onClick={() => onModerate('TRASHED')}><TrashIcon /></Action></>}{comment.status === 'SPAM' && <><Action label="تأیید" disabled={disabled} onClick={() => onModerate('APPROVED')}><CheckIcon /></Action><Action label="زباله‌دان" disabled={disabled} onClick={() => onModerate('TRASHED')}><TrashIcon /></Action></>}{comment.status === 'TRASHED' && <><Action label="بازیابی" disabled={disabled} onClick={() => onModerate('APPROVED')}><ArrowCounterClockwiseIcon /></Action><Action label="حذف دائمی" disabled={disabled} onClick={onDelete}><TrashIcon /></Action></>}</div>;
}
function Action({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) { return <Button type="button" size="xs" variant="ghost" disabled={disabled} onClick={onClick} title={label} aria-label={label}>{children}<span className="hidden 2xl:inline">{label}</span></Button>; }
