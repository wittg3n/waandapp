import { Clock3 } from 'lucide-react';

import type { BlogPostSummary } from '@/lib/blog-api';
import { formatPublishedDate, readingMinutes } from '@/lib/blog-format';
import { cn } from '@/lib/utils';

export function PostMeta({
  className,
  post,
}: {
  className?: string;
  post: Pick<BlogPostSummary, 'publishedAt' | 'readingTime'>;
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#77777e]',
        className,
      )}
    >
      <time dateTime={post.publishedAt}>{formatPublishedDate(post.publishedAt)}</time>
      <span aria-hidden="true" className="size-1 rounded-full bg-[#c6c6ca]" />
      <span className="inline-flex items-center gap-1.5">
        <Clock3 aria-hidden="true" className="size-3.5" />
        {readingMinutes(post)} دقیقه مطالعه
      </span>
    </div>
  );
}
