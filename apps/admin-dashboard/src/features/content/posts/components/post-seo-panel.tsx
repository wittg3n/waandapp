import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MediaPicker } from '../../media/media-picker';
import type { MediaAsset, PostSeo } from '../../shared/content.types';
import { useState } from 'react';

export function PostSeoPanel({ value, media, errors, onChange }: { value: PostSeo; media: MediaAsset[]; errors: Record<string, string>; onChange: (value: PostSeo) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const og = media.find((item) => item.id === value.ogMediaId);
  return (
    <section className="border bg-background p-4">
      <h2 className="font-medium">سئو</h2>
      <div className="mt-4 grid gap-4">
        <Field label="عنوان سئو" count={`${(value.title?.length ?? 0).toLocaleString('fa-IR')} / ۶۰`} error={errors.seoTitle}>
          <Input value={value.title ?? ''} maxLength={60} onChange={(event) => onChange({ ...value, title: event.target.value })} />
        </Field>
        <Field label="توضیحات سئو" count={`${(value.description?.length ?? 0).toLocaleString('fa-IR')} / ۱۶۰`} error={errors.seoDescription}>
          <textarea className="min-h-24 w-full resize-y border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50" value={value.description ?? ''} maxLength={160} onChange={(event) => onChange({ ...value, description: event.target.value })} />
        </Field>
        <Field label="نشانی Canonical" error={errors.canonicalUrl}>
          <Input dir="ltr" value={value.canonicalUrl ?? ''} placeholder="https://..." onChange={(event) => onChange({ ...value, canonicalUrl: event.target.value })} />
        </Field>
        <div>
          <div className="mb-2 flex items-center justify-between"><span className="text-xs font-medium">تصویر شبکه‌های اجتماعی</span>{og && <Button type="button" size="xs" variant="ghost" onClick={() => onChange({ ...value, ogMediaId: undefined })}>حذف انتخاب</Button>}</div>
          {og ? <button type="button" className="block w-full overflow-hidden border text-start" onClick={() => setPickerOpen(true)}><img src={og.url} alt={og.alt} className="aspect-[1.91/1] w-full object-cover" /><span className="block truncate p-2 text-xs">{og.filename}</span></button> : <Button type="button" variant="outline" className="w-full" onClick={() => setPickerOpen(true)}>انتخاب تصویر OG</Button>}
        </div>
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={value.noIndex} onChange={(event) => onChange({ ...value, noIndex: event.target.checked })} /> جلوگیری از نمایه‌سازی (noIndex)</label>
        <div className="border bg-muted/20 p-3" dir="rtl">
          <p className="truncate text-base text-[#1a0dab]">{value.title || 'عنوان نوشته در نتیجه جست‌وجو'}</p>
          <p className="mt-1 truncate text-xs text-[#188038]" dir="ltr">{value.canonicalUrl || 'https://blog.waand.ir/posts/slug'}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{value.description || 'توضیحات سئو در این قسمت نمایش داده می‌شود.'}</p>
        </div>
      </div>
      {pickerOpen && <MediaPicker media={media} title="انتخاب تصویر OG" onClose={() => setPickerOpen(false)} onSelect={(asset) => { onChange({ ...value, ogMediaId: asset.id }); setPickerOpen(false); }} />}
    </section>
  );
}

function Field({ label, count, error, children }: { label: string; count?: string; error?: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5"><span className="flex justify-between text-xs font-medium"><span>{label}</span>{count && <span className="font-normal text-muted-foreground">{count}</span>}</span>{children}{error && <span className="text-xs text-destructive">{error}</span>}</label>;
}
