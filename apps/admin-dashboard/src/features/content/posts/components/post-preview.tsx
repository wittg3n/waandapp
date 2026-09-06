import { DeviceMobileIcon, DesktopIcon, XIcon } from '@phosphor-icons/react';
import { Fragment, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatContentDate, readingTime } from '../../shared/content-utils';
import type {
  Category,
  EditorMark,
  EditorNode,
  MediaAsset,
  Post,
  Tag,
} from '../../shared/content.types';

export function PostPreview({
  post,
  category,
  tags,
  media,
  authorName,
  onClose,
}: {
  post: Post;
  category?: Category;
  tags: Tag[];
  media: MediaAsset[];
  authorName: string;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');
  const cover = media.find((item) => item.id === post.coverMediaId);

  return (
    <dialog open dir="rtl" className="fixed inset-0 z-50 m-auto h-[calc(100%-2rem)] w-[min(74rem,calc(100%-2rem))] overflow-hidden border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/40">
      <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="font-semibold">پیش‌نمایش نوشته</h2>
          <p className="text-xs text-muted-foreground">نمای محلی نزدیک به تایپوگرافی عمومی وبلاگ</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant={mode === 'desktop' ? 'secondary' : 'ghost'} onClick={() => setMode('desktop')}>
            <DesktopIcon data-icon="inline-start" />
            دسکتاپ
          </Button>
          <Button size="sm" variant={mode === 'mobile' ? 'secondary' : 'ghost'} onClick={() => setMode('mobile')}>
            <DeviceMobileIcon data-icon="inline-start" />
            موبایل
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={onClose} aria-label="بستن پیش‌نمایش">
            <XIcon />
          </Button>
        </div>
      </header>
      <div className="h-[calc(100%-4rem)] overflow-auto bg-muted/30 p-3 sm:p-6">
        <article className={cn('mx-auto min-h-full bg-white text-[#171717] shadow-sm', mode === 'mobile' ? 'max-w-[390px]' : 'max-w-5xl')}>
          <header className="border-b bg-[#fbfbfc] px-5 py-10 text-center sm:px-10 sm:py-14">
            {category && <span className="inline-flex bg-[#eef1ff] px-3 py-1.5 text-xs font-semibold text-[#143cfb]">{category.name}</span>}
            <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold leading-[1.6] tracking-tight">{post.title || 'عنوان نوشته'}</h1>
            {post.excerpt && <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-[#6c6c73]">{post.excerpt}</p>}
            <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs text-[#77777e]">
              <span>{authorName}</span>
              <span>{formatContentDate(post.publishedAt ?? post.scheduledAt ?? post.updatedAt)}</span>
              <span>{readingTime(post.content).toLocaleString('fa-IR')} دقیقه مطالعه</span>
            </div>
          </header>
          <div className="px-5 py-8 sm:px-10 sm:py-12">
            {cover && <img src={cover.url} alt={cover.alt || post.title} className="mx-auto aspect-video w-full max-w-4xl object-cover" />}
            <div className="cms-preview-prose mx-auto mt-10 max-w-[46rem]">
              {post.content.content.map((node, index) => (
                <Fragment key={index}>{renderNode(node, media, `${index}`)}</Fragment>
              ))}
            </div>
            {tags.length > 0 && (
              <div className="mx-auto mt-10 flex max-w-[46rem] flex-wrap gap-2 border-t pt-5 text-xs text-[#64646b]">
                {tags.map((tag) => <span key={tag.id}>#{tag.name}</span>)}
              </div>
            )}
          </div>
        </article>
      </div>
    </dialog>
  );
}

function markedText(text: string, marks: EditorMark[] | undefined, key: string): ReactNode {
  return (marks ?? []).reduce<ReactNode>((child, mark, index) => {
    const markKey = `${key}-${mark.type}-${index}`;
    if (mark.type === 'bold') return <strong key={markKey}>{child}</strong>;
    if (mark.type === 'italic') return <em key={markKey}>{child}</em>;
    if (mark.type === 'strike') return <s key={markKey}>{child}</s>;
    if (mark.type === 'code') return <code key={markKey}>{child}</code>;
    if (mark.type === 'link' && mark.attrs?.href) return <a key={markKey} href={String(mark.attrs.href)}>{child}</a>;
    return child;
  }, text);
}

function childrenOf(node: EditorNode, media: MediaAsset[], key: string) {
  return (node.content ?? []).map((child, index) => (
    <Fragment key={`${key}-${index}`}>{renderNode(child, media, `${key}-${index}`)}</Fragment>
  ));
}

function renderNode(node: EditorNode, media: MediaAsset[], key: string): ReactNode {
  if (node.type === 'text') return markedText(node.text ?? '', node.marks, key);
  const children = childrenOf(node, media, key);
  if (node.type === 'paragraph') return <p>{children}</p>;
  if (node.type === 'heading') return Number(node.attrs?.level) === 3 ? <h3>{children}</h3> : <h2>{children}</h2>;
  if (node.type === 'bulletList') return <ul>{children}</ul>;
  if (node.type === 'orderedList') return <ol>{children}</ol>;
  if (node.type === 'listItem') return <li>{children}</li>;
  if (node.type === 'blockquote') return <blockquote>{children}</blockquote>;
  if (node.type === 'codeBlock') return <pre><code>{children}</code></pre>;
  if (node.type === 'horizontalRule') return <hr />;
  if (node.type === 'hardBreak') return <br />;
  if (node.type === 'mediaImage') {
    const asset = media.find((item) => item.id === node.attrs?.mediaId);
    if (!asset) return null;
    return (
      <figure data-media-id={asset.id}>
        <img src={asset.url} alt={String(node.attrs?.alt ?? asset.alt)} />
        {typeof node.attrs?.caption === 'string' && node.attrs.caption && <figcaption>{node.attrs.caption}</figcaption>}
      </figure>
    );
  }
  return children;
}
