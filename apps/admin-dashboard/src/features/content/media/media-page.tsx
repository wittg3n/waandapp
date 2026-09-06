import { GridFourIcon, ListIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAdminSession } from '@/features/users/hooks/use-users';
import { contentRepository } from '../repository/content-repository';
import { fileSize, formatContentDate } from '../shared/content-utils';
import type { MediaAsset, MediaRow, MediaUsage } from '../shared/content.types';
import { CONTENT_PERMISSIONS } from '../shared/content.types';
import { ContentLoading, ContentPage, InlineError, selectClassName } from '../shared/content-ui';
import { useContentQuery } from '../shared/use-content-query';

const supported = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const;

export function MediaPage() {
  const session = useAdminSession(); const permissions = session.data?.user?.permissions ?? [];
  const canManage = permissions.includes(CONTENT_PERMISSIONS.mediaManage); const canUpload = permissions.includes(CONTENT_PERMISSIONS.mediaUpload); const canDelete = permissions.includes(CONTENT_PERMISSIONS.mediaDelete);
  const [search, setSearch] = useState(''); const [mime, setMime] = useState(''); const [date, setDate] = useState(''); const [view, setView] = useState<'grid' | 'list'>('grid'); const [selected, setSelected] = useState<MediaRow | null>(null); const [uploading, setUploading] = useState(false); const [notice, setNotice] = useState<string | null>(null); const fileRef = useRef<HTMLInputElement>(null);
  const query = useContentQuery(useCallback((signal: AbortSignal) => contentRepository.listMedia(search, signal), [search]));
  const filtered = useMemo(() => (query.data ?? []).filter((item) => (!mime || item.mimeType === mime) && (!date || item.createdAt.startsWith(date))), [date, mime, query.data]);

  async function upload(file: File | undefined) {
    if (!file || !session.data?.user) return; setNotice(null);
    if (!supported.includes(file.type as (typeof supported)[number])) { setNotice('فرمت تصویر پشتیبانی نمی‌شود. فقط JPEG، PNG، WebP و AVIF مجاز است.'); return; }
    if (file.size > 10 * 1_024 * 1_024) { setNotice('حجم تصویر نباید بیشتر از ۱۰ مگابایت باشد.'); return; }
    setUploading(true); const url = URL.createObjectURL(file);
    try {
      const dimensions = await imageDimensions(url);
      await contentRepository.addMedia({ filename: file.name, mimeType: file.type as MediaAsset['mimeType'], size: file.size, width: dimensions.width, height: dimensions.height, alt: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '), url, uploadedByAdminId: session.data.user.id });
      setNotice('تصویر به کتابخانه رسانه افزوده شد.'); query.refetch();
    } catch (error) { URL.revokeObjectURL(url); setNotice(error instanceof Error ? error.message : 'افزودن تصویر انجام نشد.'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  return <ContentPage title="رسانه" description="کتابخانه تصویرهای قابل استفاده در نوشته‌ها، تصویر شاخص و سئو" action={canUpload ? <><input ref={fileRef} className="sr-only" type="file" accept={supported.join(',')} onChange={(event) => void upload(event.target.files?.[0])} /><Button disabled={uploading} onClick={() => fileRef.current?.click()}><PlusIcon data-icon="inline-start" />{uploading ? 'در حال افزودن' : 'افزودن تصویر'}</Button></> : undefined}>
    {notice && <div className="border bg-background p-3 text-xs">{notice}</div>}
    <section className="flex flex-col gap-3 border bg-background p-4 lg:flex-row lg:items-center"><form className="flex min-w-0 flex-1 gap-2" onSubmit={(event) => { event.preventDefault(); setSearch(String(new FormData(event.currentTarget).get('search') ?? '').trim()); }}><Input name="search" defaultValue={search} placeholder="نام فایل، متن جایگزین یا توضیح" /><Button type="submit" variant="outline">جست‌وجو</Button></form><select className={selectClassName} value={mime} onChange={(event) => setMime(event.target.value)}><option value="">همه فرمت‌ها</option>{supported.map((item) => <option key={item} value={item}>{item}</option>)}</select><Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="w-auto" /><div className="flex border"><Button size="icon-sm" variant={view === 'grid' ? 'secondary' : 'ghost'} onClick={() => setView('grid')} aria-label="نمای شبکه‌ای"><GridFourIcon /></Button><Button size="icon-sm" variant={view === 'list' ? 'secondary' : 'ghost'} onClick={() => setView('list')} aria-label="نمای فهرست"><ListIcon /></Button></div></section>
    {query.error ? <InlineError message={query.error} onRetry={query.refetch} /> : query.loading ? <ContentLoading /> : filtered.length === 0 ? <div className="border bg-background py-20 text-center text-sm text-muted-foreground">تصویری با این شرایط پیدا نشد.</div> : view === 'grid' ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">{filtered.map((asset) => <button key={asset.id} type="button" className="min-w-0 overflow-hidden border bg-background text-start hover:border-foreground/30" onClick={() => setSelected(asset)}><img src={asset.url} alt={asset.alt} className="aspect-square w-full object-cover" /><span className="block truncate px-3 pt-3 text-xs font-medium">{asset.filename}</span><span className="block px-3 pb-3 pt-1 text-[11px] text-muted-foreground">{asset.width.toLocaleString('fa-IR')}×{asset.height.toLocaleString('fa-IR')} · {fileSize(asset.size)}</span></button>)}</div> : <div className="max-w-full overflow-x-auto border bg-background"><table className="w-full min-w-[720px] text-xs"><thead className="border-b bg-muted/40"><tr><th className="p-3 text-start">تصویر</th><th className="p-3 text-start">فرمت</th><th className="p-3 text-start">ابعاد</th><th className="p-3 text-start">حجم</th><th className="p-3 text-start">استفاده</th><th className="p-3 text-start">تاریخ</th></tr></thead><tbody className="divide-y">{filtered.map((asset) => <tr key={asset.id} className="cursor-pointer hover:bg-muted/30" onClick={() => setSelected(asset)}><td className="p-3"><div className="flex items-center gap-3"><img src={asset.url} alt={asset.alt} className="size-12 object-cover" /><span>{asset.filename}</span></div></td><td className="p-3" dir="ltr">{asset.mimeType}</td><td className="p-3">{asset.width}×{asset.height}</td><td className="p-3">{fileSize(asset.size)}</td><td className="p-3">{asset.usageCount.toLocaleString('fa-IR')}</td><td className="p-3">{formatContentDate(asset.createdAt)}</td></tr>)}</tbody></table></div>}
    <MediaDetails key={selected?.id ?? 'closed'} asset={selected} canManage={canManage} canDelete={canDelete} onClose={() => setSelected(null)} onChanged={() => { setSelected(null); query.refetch(); }} />
  </ContentPage>;
}

function MediaDetails({ asset, canManage, canDelete, onClose, onChanged }: { asset: MediaRow | null; canManage: boolean; canDelete: boolean; onClose: () => void; onChanged: () => void }) {
  const [alt, setAlt] = useState(asset?.alt ?? ''); const [caption, setCaption] = useState(asset?.caption ?? ''); const [usage, setUsage] = useState<MediaUsage[]>([]); const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  useEffect(() => {
    let current = true;
    if (asset) void contentRepository.getMediaUsage(asset.id).then((value) => { if (current) setUsage(value); }, (reason: unknown) => { if (current) setError(reason instanceof Error ? reason.message : 'دریافت موارد استفاده انجام نشد.'); });
    return () => { current = false; };
  }, [asset]);
  if (!asset) return null;
  async function save() { setBusy(true); setError(null); try { await contentRepository.updateMedia(asset!.id, { alt, caption: caption || undefined }); onChanged(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'ذخیره انجام نشد.'); } finally { setBusy(false); } }
  async function remove() { if (usage.length || !window.confirm('این تصویر برای همیشه از حافظه جاری حذف شود؟')) return; setBusy(true); try { await contentRepository.deleteMedia(asset!.id); onChanged(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'حذف انجام نشد.'); } finally { setBusy(false); } }
  return <Sheet open={Boolean(asset)} onOpenChange={(open) => { if (!open) onClose(); }}><SheetContent className="w-[min(30rem,92vw)] overflow-y-auto sm:max-w-lg" side="left"><SheetHeader><SheetTitle>جزئیات رسانه</SheetTitle><SheetDescription>اطلاعات فایل و محل‌های استفاده را بررسی کنید.</SheetDescription></SheetHeader><div className="grid gap-4 px-4"><img src={asset.url} alt={asset.alt} className="aspect-video w-full border object-contain bg-muted/20" /><dl className="grid grid-cols-2 gap-2 text-xs"><dt className="text-muted-foreground">نام فایل</dt><dd className="truncate" dir="ltr">{asset.filename}</dd><dt className="text-muted-foreground">نوع MIME</dt><dd dir="ltr">{asset.mimeType}</dd><dt className="text-muted-foreground">ابعاد</dt><dd>{asset.width}×{asset.height}</dd><dt className="text-muted-foreground">حجم</dt><dd>{fileSize(asset.size)}</dd><dt className="text-muted-foreground">تاریخ بارگذاری</dt><dd>{formatContentDate(asset.createdAt)}</dd><dt className="text-muted-foreground">تعداد استفاده</dt><dd>{usage.length.toLocaleString('fa-IR')}</dd></dl><label className="grid gap-1.5 text-xs"><span>متن جایگزین</span><Input value={alt} disabled={!canManage} onChange={(event) => setAlt(event.target.value)} /></label><label className="grid gap-1.5 text-xs"><span>توضیح</span><textarea className="min-h-20 resize-y border bg-background p-2" value={caption} disabled={!canManage} onChange={(event) => setCaption(event.target.value)} /></label><div><h3 className="text-xs font-medium">موارد استفاده</h3>{usage.length ? <ul className="mt-2 grid gap-2">{usage.map((item, index) => <li key={`${item.postId}-${item.kind}-${index}`} className="border p-2 text-xs"><Link className="font-medium hover:underline" to={`/content/posts/${item.postId}`}>{item.postTitle}</Link><span className="ms-2 text-muted-foreground">{item.kind === 'COVER' ? 'تصویر شاخص' : item.kind === 'BODY' ? 'متن نوشته' : 'تصویر OG'}</span></li>)}</ul> : <p className="mt-2 text-xs text-muted-foreground">این تصویر در نوشته‌ای استفاده نشده است.</p>}</div>{error && <p className="text-xs text-destructive">{error}</p>}</div><SheetFooter><div className="flex gap-2">{canManage && <Button disabled={busy} onClick={() => void save()}>ذخیره تغییرات</Button>}{canDelete && <Button variant="destructive" disabled={busy || usage.length > 0} onClick={() => void remove()}><TrashIcon data-icon="inline-start" />حذف تصویر</Button>}</div>{usage.length > 0 && <p className="text-[11px] text-muted-foreground">برای حذف، ابتدا همه ارجاع‌های بالا را حذف یا جایگزین کنید.</p>}</SheetFooter></SheetContent></Sheet>;
}

function imageDimensions(url: string) { return new Promise<{ width: number; height: number }>((resolve, reject) => { const image = new Image(); image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight }); image.onerror = () => reject(new Error('خواندن ابعاد تصویر انجام نشد.')); image.src = url; }); }
