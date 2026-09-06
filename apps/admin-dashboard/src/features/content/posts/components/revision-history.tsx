import { EyeIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { formatContentDate } from '../../shared/content-utils';
import type { Category, MediaAsset, Post, PostRevision, Tag } from '../../shared/content.types';
import { PostPreview } from './post-preview';

export function RevisionHistory({ revisions, current, categories, tags, media, authorName, disabled, onRestore }: { revisions: PostRevision[]; current: Post; categories: Category[]; tags: Tag[]; media: MediaAsset[]; authorName: string; disabled: boolean; onRestore: (revision: PostRevision) => Promise<void> }) {
  const [viewed, setViewed] = useState<PostRevision | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);
  return (
    <section className="border bg-background p-4">
      <h2 className="font-medium">تاریخچه نسخه‌ها</h2>
      <div className="mt-3 grid max-h-80 gap-2 overflow-y-auto">
        {revisions.length ? revisions.map((revision) => (
          <article key={revision.id} className="border p-3">
            <p className="text-xs font-medium">{formatContentDate(revision.createdAt)}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{revision.summary ?? 'نسخه ذخیره‌شده'} · {revision.adminId === 'local-admin' ? authorName : revision.adminId}</p>
            <div className="mt-2 flex gap-2">
              <Button type="button" size="xs" variant="outline" onClick={() => setViewed(revision)}><EyeIcon data-icon="inline-start" />مشاهده نسخه</Button>
              <Button type="button" size="xs" variant="ghost" disabled={disabled || restoring !== null} onClick={async () => { if (!window.confirm('این نسخه به‌عنوان محتوای جاری بازیابی شود؟')) return; setRestoring(revision.id); await onRestore(revision); setRestoring(null); }}><ArrowCounterClockwiseIcon data-icon="inline-start" />{restoring === revision.id ? 'در حال بازیابی' : 'بازیابی نسخه'}</Button>
            </div>
          </article>
        )) : <p className="py-4 text-xs text-muted-foreground">هنوز نسخه‌ای برای این نوشته ثبت نشده است.</p>}
      </div>
      {viewed && <PostPreview post={{ ...current, ...viewed.snapshot }} category={categories.find((item) => item.id === viewed.snapshot.categoryId)} tags={tags.filter((item) => viewed.snapshot.tagIds.includes(item.id))} media={media} authorName={authorName} onClose={() => setViewed(null)} />}
    </section>
  );
}
