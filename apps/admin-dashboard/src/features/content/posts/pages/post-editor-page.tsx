import { ArrowRightIcon, EyeIcon, FloppyDiskIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAdminSession } from '@/features/users/hooks/use-users';
import { MediaPicker } from '../../media/media-picker';
import { ContentValidationError, contentRepository } from '../../repository/content-repository';
import { normalizeSlug, postStatusLabels, publicPostPath } from '../../shared/content-utils';
import { CONTENT_PERMISSIONS, EMPTY_DOCUMENT, type Post, type PostInput, type PostRevision, type PostTransition } from '../../shared/content.types';
import { ContentLoading, InlineError, PostStatusBadge, selectClassName } from '../../shared/content-ui';
import { useContentQuery } from '../../shared/use-content-query';
import { PostPreview } from '../components/post-preview';
import { PostSeoPanel } from '../components/post-seo-panel';
import { RevisionHistory } from '../components/revision-history';
import { PostEditor } from '../editor/post-editor';

const emptyInput = (adminId: string): PostInput => ({ title: '', slug: '', excerpt: '', content: structuredClone(EMPTY_DOCUMENT), categoryId: '', tagIds: [], authorAdminId: adminId, lastEditedByAdminId: adminId, seo: { noIndex: false } });

export function PostEditorPage() {
  const { postId } = useParams();
  const isNew = !postId;
  const navigate = useNavigate();
  const session = useAdminSession();
  const admin = session.data?.user;
  const permissions = admin?.permissions ?? [];
  const canCreate = permissions.includes(CONTENT_PERMISSIONS.create);
  const canUpdate = permissions.includes(CONTENT_PERMISSIONS.update);
  const canPublish = permissions.includes(CONTENT_PERMISSIONS.publish);
  const canArchive = permissions.includes(CONTENT_PERMISSIONS.archive);
  const [post, setPost] = useState<Post | null>(null);
  const [form, setForm] = useState<PostInput | null>(null);
  const [baseline, setBaseline] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [coverPicker, setCoverPicker] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [initializedFor, setInitializedFor] = useState<string | null>(null);

  const resources = useContentQuery(useCallback(async (signal: AbortSignal) => {
    const [categories, tags, media, current, revisions] = await Promise.all([
      contentRepository.listCategories(signal), contentRepository.listTags(signal), contentRepository.listMedia('', signal),
      postId ? contentRepository.getPost(postId, signal) : Promise.resolve(null),
      postId ? contentRepository.listRevisions(postId, signal) : Promise.resolve([]),
    ]);
    return { categories, tags, media, current, revisions };
  }, [postId]), Boolean(admin));

  const resourceKey = admin && resources.data ? `${admin.id}:${postId ?? 'new'}` : null;
  const loadedResources = resources.data;
  const loadedAdmin = admin;
  if (resourceKey && loadedResources && loadedAdmin && initializedFor !== resourceKey && (isNew || loadedResources.current)) {
    const current = loadedResources.current;
    if (current) {
      const input = toInput(current, loadedAdmin.id);
      setPost(current); setForm(input); setBaseline(JSON.stringify(input)); setSlugEdited(true);
    } else if (isNew) {
      const input = emptyInput(loadedAdmin.id);
      setForm(input); setBaseline(JSON.stringify(input));
    }
    setInitializedFor(resourceKey);
  }

  const dirty = Boolean(form && baseline && JSON.stringify(form) !== baseline);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    const captureLinks = (event: MouseEvent) => {
      if (!dirty) return;
      const anchor = (event.target as Element | null)?.closest('a[href]');
      if (anchor && !window.confirm('تغییرات ذخیره‌نشده دارید. بدون ذخیره از صفحه خارج می‌شوید؟')) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', captureLinks, true);
    return () => { window.removeEventListener('beforeunload', beforeUnload); document.removeEventListener('click', captureLinks, true); };
  }, [dirty]);

  const set = <K extends keyof PostInput>(key: K, value: PostInput[K]) => setForm((current) => current ? { ...current, [key]: value } : current);
  const titleChanged = (title: string) => { if (!slugEdited) setForm((current) => current ? { ...current, title, slug: normalizeSlug(title) } : current); else set('title', title); };

  async function save(): Promise<Post | null> {
    if (!form || !admin || busy) return post;
    setBusy(true); setErrors({}); setNotice(null);
    try {
      const saved = post ? await contentRepository.updatePost(post.id, form) : await contentRepository.createPost(form);
      const clean = toInput(saved, admin.id);
      setPost(saved); setForm(clean); setBaseline(JSON.stringify(clean)); setNotice(post ? 'تغییرات ذخیره شد.' : 'پیش‌نویس ایجاد شد.');
      if (!post) navigate(`/content/posts/${saved.id}`, { replace: true });
      resources.refetch();
      return saved;
    } catch (error) {
      if (error instanceof ContentValidationError) { setErrors(error.fields); setNotice(error.message); }
      else setNotice(error instanceof Error ? error.message : 'ذخیره انجام نشد.');
      return null;
    } finally { setBusy(false); }
  }

  async function transition(action: PostTransition) {
    const saved = await save();
    if (!saved || !admin || busy) return;
    setBusy(true); setErrors({});
    try {
      const changed = await contentRepository.transitionPost(saved.id, action, { scheduledAt: form?.scheduledAt, adminId: admin.id });
      setPost(changed); setForm(toInput(changed, admin.id)); setBaseline(JSON.stringify(toInput(changed, admin.id))); setNotice(`وضعیت نوشته به «${postStatusLabels[changed.status]}» تغییر کرد.`); setScheduleOpen(false); resources.refetch();
    } catch (error) {
      if (error instanceof ContentValidationError) { setErrors(error.fields); setNotice(error.message); }
      else setNotice(error instanceof Error ? error.message : 'تغییر وضعیت انجام نشد.');
    } finally { setBusy(false); }
  }

  async function restoreRevision(revision: PostRevision) {
    if (!post || !admin) return;
    try { const restored = await contentRepository.restoreRevision(post.id, revision.id, admin.id); const input = toInput(restored, admin.id); setPost(restored); setForm(input); setBaseline(JSON.stringify(input)); setNotice('نسخه انتخاب‌شده بازیابی شد.'); resources.refetch(); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'بازیابی نسخه انجام نشد.'); }
  }

  const previewPost = useMemo(() => form && ({ ...(post ?? { id: 'preview', status: 'DRAFT', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), lastEditedByAdminId: form.lastEditedByAdminId }), ...form } as Post), [form, post]);

  if (session.loading || resources.loading || !form) return <main className="min-w-0 flex-1 p-6"><ContentLoading /></main>;
  if (session.error || resources.error) return <main className="min-w-0 flex-1 p-6"><InlineError message={session.error ?? resources.error!} onRetry={() => { session.refetch(); resources.refetch(); }} /></main>;
  if (!isNew && !resources.data?.current) return <main className="min-w-0 flex-1 p-6"><InlineError message="نوشته موردنظر پیدا نشد." /></main>;
  if ((isNew && !canCreate) || (!isNew && !canUpdate)) return <main className="min-w-0 flex-1 p-6"><InlineError message="دسترسی لازم برای ویرایش نوشته را ندارید." /></main>;

  const { categories, tags, media, revisions } = resources.data!;
  const cover = media.find((item) => item.id === form.coverMediaId);
  const authorName = `${admin!.firstName} ${admin!.lastName}`.trim();
  return (
    <main className="min-w-0 flex-1 overflow-x-clip bg-muted/20">
      <div className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><Button type="button" size="icon" variant="outline" onClick={() => { if (!dirty || window.confirm('تغییرات ذخیره‌نشده دارید. بدون ذخیره بازگردید؟')) navigate('/content/posts'); }} aria-label="بازگشت"><ArrowRightIcon /></Button><div><div className="flex items-center gap-2"><h1 className="text-xl font-semibold">{isNew ? 'نوشته جدید' : form.title || 'ویرایش نوشته'}</h1>{post && <PostStatusBadge status={post.status} />}{dirty && <span className="text-xs text-warning">تغییرات ذخیره‌نشده</span>}</div><p className="mt-1 text-xs text-muted-foreground" dir="ltr">{publicPostPath(form.slug || 'slug')}</p></div></div>
          <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setPreview(true)}><EyeIcon data-icon="inline-start" />پیش‌نمایش</Button><Button type="button" variant="outline" disabled={busy || !dirty} onClick={() => void save()}><FloppyDiskIcon data-icon="inline-start" />{busy ? 'در حال ذخیره' : 'ذخیره'}</Button>{workflowPrimary(post?.status ?? 'DRAFT', canPublish, (action) => void transition(action), () => setScheduleOpen(true), busy)}</div>
        </header>
        {notice && <div className={`mb-4 border p-3 text-xs ${Object.keys(errors).length ? 'border-destructive/30 text-destructive' : 'border-success/30 text-success'}`}>{notice}</div>}
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            <Card className="p-5 shadow-none ring-0"><label className="grid gap-2"><span className="text-xs font-medium">عنوان</span><Input value={form.title} maxLength={120} onChange={(event) => titleChanged(event.target.value)} className="h-12 text-lg" placeholder="عنوان نوشته" />{errors.title && <span className="text-xs text-destructive">{errors.title}</span>}<span className="text-end text-[11px] text-muted-foreground">{form.title.length.toLocaleString('fa-IR')} / ۱۲۰</span></label><label className="mt-4 grid gap-2"><span className="text-xs font-medium">نامک</span><Input dir="ltr" value={form.slug} maxLength={160} onChange={(event) => { setSlugEdited(true); set('slug', normalizeSlug(event.target.value)); }} />{errors.slug && <span className="text-xs text-destructive">{errors.slug}</span>}</label></Card>
            <Card className="overflow-hidden p-0 shadow-none ring-0"><PostEditor value={form.content} media={media} onChange={(value) => set('content', value)} />{errors.content && <p className="px-4 pb-3 text-xs text-destructive">{errors.content}</p>}</Card>
            <Card className="p-5 shadow-none ring-0"><label className="grid gap-2"><span className="flex justify-between text-xs font-medium"><span>خلاصه</span><span className="font-normal text-muted-foreground">{form.excerpt.length.toLocaleString('fa-IR')} / ۳۰۰</span></span><textarea className="min-h-28 resize-y border bg-background px-3 py-2 text-sm leading-7 outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50" value={form.excerpt} maxLength={300} onChange={(event) => set('excerpt', event.target.value)} />{errors.excerpt && <span className="text-xs text-destructive">{errors.excerpt}</span>}</label></Card>
          </div>
          <aside className="min-w-0 space-y-5">
            <section className="border bg-background p-4"><h2 className="font-medium">انتشار</h2><div className="mt-3 grid gap-3 text-xs"><div className="flex justify-between"><span className="text-muted-foreground">وضعیت</span><span>{postStatusLabels[post?.status ?? 'DRAFT']}</span></div><div className="flex justify-between"><span className="text-muted-foreground">نویسنده</span><span>{authorName}</span></div>{post?.status === 'SCHEDULED' && <Button type="button" variant="outline" onClick={() => setScheduleOpen(true)}>تغییر زمان انتشار</Button>}{post?.status === 'PUBLISHED' && <><Button type="button" variant="outline" onClick={() => void transition('UNPUBLISH')}>بازگرداندن به پیش‌نویس</Button>{canArchive && <Button type="button" variant="destructive" onClick={() => void transition('ARCHIVE')}>آرشیو نوشته</Button>}</>}{post?.status === 'ARCHIVED' && <Button type="button" variant="outline" onClick={() => void transition('RESTORE')}>بازیابی به پیش‌نویس</Button>}{post?.status === 'IN_REVIEW' && <Button type="button" variant="outline" onClick={() => void transition('RETURN_TO_DRAFT')}>بازگشت به پیش‌نویس</Button>}{post?.status === 'SCHEDULED' && <Button type="button" variant="outline" onClick={() => void transition('CANCEL_SCHEDULE')}>لغو زمان‌بندی</Button>}</div></section>
            <section className="border bg-background p-4"><h2 className="font-medium">دسته‌بندی و برچسب‌ها</h2><label className="mt-3 grid gap-1.5 text-xs"><span>دسته‌بندی</span><select className={selectClassName} value={form.categoryId} onChange={(event) => set('categoryId', event.target.value)}><option value="">انتخاب کنید</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{errors.categoryId && <span className="text-destructive">{errors.categoryId}</span>}</label><fieldset className="mt-4"><legend className="text-xs">برچسب‌ها</legend><div className="mt-2 flex max-h-44 flex-wrap gap-2 overflow-y-auto">{tags.map((tag) => <label key={tag.id} className="flex items-center gap-1.5 border px-2 py-1.5 text-[11px]"><input type="checkbox" checked={form.tagIds.includes(tag.id)} onChange={(event) => set('tagIds', event.target.checked ? [...form.tagIds, tag.id] : form.tagIds.filter((id) => id !== tag.id))} />{tag.name}</label>)}</div></fieldset></section>
            <section className="border bg-background p-4"><h2 className="font-medium">تصویر شاخص</h2>{cover ? <button type="button" className="mt-3 block w-full overflow-hidden border text-start" onClick={() => setCoverPicker(true)}><img src={cover.url} alt={cover.alt} className="aspect-video w-full object-cover" /><span className="block truncate p-2 text-xs">{cover.filename}</span></button> : <Button type="button" className="mt-3 w-full" variant="outline" onClick={() => setCoverPicker(true)}>انتخاب تصویر شاخص</Button>}{cover && <Button type="button" className="mt-2" size="xs" variant="ghost" onClick={() => set('coverMediaId', undefined)}>حذف انتخاب</Button>}{errors.coverMediaId && <p className="mt-2 text-xs text-destructive">{errors.coverMediaId}</p>}</section>
            <PostSeoPanel value={form.seo} media={media} errors={errors} onChange={(value) => set('seo', value)} />
            {post && <RevisionHistory revisions={revisions} current={post} categories={categories} tags={tags} media={media} authorName={authorName} disabled={busy || dirty} onRestore={restoreRevision} />}
          </aside>
        </div>
      </div>
      {coverPicker && <MediaPicker media={media} title="انتخاب تصویر شاخص" onClose={() => setCoverPicker(false)} onSelect={(asset) => { set('coverMediaId', asset.id); setCoverPicker(false); }} />}
      {scheduleOpen && <dialog open dir="rtl" className="fixed inset-0 z-[80] m-auto w-[min(28rem,calc(100%-2rem))] border bg-background p-5 text-foreground shadow-xl backdrop:bg-black/40"><h2 className="font-medium">زمان‌بندی انتشار</h2><p className="mt-1 text-xs text-muted-foreground">زمان باید در آینده باشد. اجرای خودکار تا اتصال backend انجام نمی‌شود.</p><Input className="mt-4" type="datetime-local" value={form.scheduledAt ? form.scheduledAt.slice(0, 16) : ''} onChange={(event) => set('scheduledAt', event.target.value ? new Date(event.target.value).toISOString() : undefined)} />{errors.scheduledAt && <p className="mt-2 text-xs text-destructive">{errors.scheduledAt}</p>}<div className="mt-5 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setScheduleOpen(false)}>انصراف</Button><Button type="button" disabled={!form.scheduledAt || busy} onClick={() => void transition('SCHEDULE')}>ثبت زمان‌بندی</Button></div></dialog>}
      {preview && previewPost && <PostPreview post={previewPost} category={categories.find((item) => item.id === form.categoryId)} tags={tags.filter((item) => form.tagIds.includes(item.id))} media={media} authorName={authorName} onClose={() => setPreview(false)} />}
    </main>
  );
}

function toInput(post: Post, adminId: string): PostInput { return { title: post.title, slug: post.slug, excerpt: post.excerpt, content: structuredClone(post.content), coverMediaId: post.coverMediaId, categoryId: post.categoryId, tagIds: [...post.tagIds], authorAdminId: post.authorAdminId, seo: structuredClone(post.seo), scheduledAt: post.scheduledAt, lastEditedByAdminId: adminId }; }

function workflowPrimary(status: Post['status'], canPublish: boolean, transition: (action: PostTransition) => void, schedule: () => void, busy: boolean) {
  if (status === 'DRAFT') return <>{canPublish && <Button type="button" variant="outline" disabled={busy} onClick={schedule}>زمان‌بندی</Button>}<Button type="button" disabled={busy} onClick={() => transition(canPublish ? 'PUBLISH_NOW' : 'SUBMIT_REVIEW')}>{canPublish ? 'انتشار اکنون' : 'ارسال برای بررسی'}</Button></>;
  if (status === 'IN_REVIEW') return <>{canPublish && <Button type="button" variant="outline" disabled={busy} onClick={schedule}>زمان‌بندی</Button>}<Button type="button" disabled={busy || !canPublish} onClick={() => transition('PUBLISH_NOW')}>انتشار اکنون</Button></>;
  if (status === 'SCHEDULED') return <Button type="button" disabled={busy || !canPublish} onClick={() => transition('PUBLISH_NOW')}>انتشار اکنون</Button>;
  return null;
}
