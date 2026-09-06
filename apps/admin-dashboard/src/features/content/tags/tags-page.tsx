import { NotePencilIcon, PlusIcon, TrashIcon, XIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminSession } from '@/features/users/hooks/use-users';
import { ContentValidationError, contentRepository } from '../repository/content-repository';
import { formatContentDate, normalizeSlug } from '../shared/content-utils';
import type { TagRow } from '../shared/content.types';
import { CONTENT_PERMISSIONS } from '../shared/content.types';
import { ContentPage, ContentTable, InlineError, type ContentColumn } from '../shared/content-ui';
import { useContentQuery } from '../shared/use-content-query';

export function TagsPage() {
  const session = useAdminSession(); const canManage = session.data?.user?.permissions.includes(CONTENT_PERMISSIONS.tagsManage) ?? false;
  const query = useContentQuery(useCallback((signal: AbortSignal) => contentRepository.listTags(signal), []));
  const [editing, setEditing] = useState<TagRow | 'new' | null>(null); const [operationError, setOperationError] = useState<string | null>(null);
  async function remove(item: TagRow) { setOperationError(null); const message = item.postCount ? `این برچسب از ${item.postCount.toLocaleString('fa-IR')} نوشته جدا و سپس حذف شود؟` : `برچسب «${item.name}» حذف شود؟`; if (!window.confirm(message)) return; try { await contentRepository.deleteTag(item.id, item.postCount > 0); query.refetch(); } catch (error) { setOperationError(error instanceof Error ? error.message : 'حذف انجام نشد.'); } }
  const columns: ContentColumn<TagRow>[] = [
    { key: 'name', title: 'برچسب', render: (item) => <span className="font-medium">{item.name}</span> },
    { key: 'slug', title: 'نامک', render: (item) => <span dir="ltr">{item.slug}</span> },
    { key: 'count', title: 'تعداد استفاده', render: (item) => item.postCount.toLocaleString('fa-IR') },
    { key: 'updated', title: 'آخرین بروزرسانی', render: (item) => formatContentDate(item.updatedAt) },
    { key: 'actions', title: 'عملیات', render: (item) => <div className="flex gap-1"><Button size="icon-sm" variant="ghost" disabled={!canManage} onClick={() => setEditing(item)} aria-label="ویرایش"><NotePencilIcon /></Button><Button size="icon-sm" variant="ghost" disabled={!canManage} onClick={() => void remove(item)} aria-label="حذف"><TrashIcon /></Button></div> },
  ];
  const result = query.data ? { items: query.data, page: 1, pageSize: query.data.length, total: query.data.length, pageCount: 1 } : null;
  return <ContentPage title="برچسب‌ها" description="برچسب‌های توصیفی و چندبه‌چند نوشته‌ها" action={canManage ? <Button onClick={() => setEditing('new')}><PlusIcon data-icon="inline-start" />برچسب جدید</Button> : undefined}>{operationError && <InlineError message={operationError} />}<ContentTable result={result} loading={query.loading} error={query.error} columns={columns} onRetry={query.refetch} onPageChange={() => undefined} empty="هنوز برچسبی ایجاد نشده است." />{editing && <TagDialog item={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); query.refetch(); }} />}</ContentPage>;
}

function TagDialog({ item, onClose, onSaved }: { item?: TagRow; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(item?.name ?? ''); const [slug, setSlug] = useState(item?.slug ?? ''); const [manualSlug, setManualSlug] = useState(Boolean(item)); const [errors, setErrors] = useState<Record<string, string>>({}); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setBusy(true); setErrors({}); try { const input = { name: name.trim(), slug: normalizeSlug(slug) }; if (item) await contentRepository.updateTag(item.id, input); else await contentRepository.createTag(input); onSaved(); } catch (error) { if (error instanceof ContentValidationError) setErrors(error.fields); else setErrors({ form: error instanceof Error ? error.message : 'ذخیره انجام نشد.' }); } finally { setBusy(false); } }
  return <dialog open dir="rtl" className="fixed inset-0 z-50 m-auto w-[min(30rem,calc(100%-2rem))] border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/40"><header className="flex justify-between border-b p-4"><div><h2 className="font-medium">{item ? 'ویرایش برچسب' : 'برچسب جدید'}</h2><p className="text-xs text-muted-foreground">نام و نامک باید یکتا باشند.</p></div><Button size="icon-sm" variant="ghost" onClick={onClose}><XIcon /></Button></header><form className="grid gap-4 p-4" onSubmit={(event) => void submit(event)}><Field label="نام" error={errors.name}><Input value={name} onChange={(event) => { const value = event.target.value; setName(value); if (!manualSlug) setSlug(normalizeSlug(value)); }} /></Field><Field label="نامک" error={errors.slug}><Input dir="ltr" value={slug} onChange={(event) => { setManualSlug(true); setSlug(normalizeSlug(event.target.value)); }} /></Field>{errors.form && <p className="text-xs text-destructive">{errors.form}</p>}<div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>انصراف</Button><Button type="submit" disabled={busy}>{busy ? 'در حال ذخیره' : 'ذخیره'}</Button></div></form></dialog>;
}
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="grid gap-1.5 text-xs"><span className="font-medium">{label}</span>{children}{error && <span className="text-destructive">{error}</span>}</label>; }
