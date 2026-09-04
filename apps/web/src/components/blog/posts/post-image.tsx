import { BookOpenText } from 'lucide-react';
import Image from 'next/image';

import type { BlogPostSummary } from '@/lib/blog-api';
import { coverImage } from '@/lib/blog-format';
import { cn } from '@/lib/utils';

export function PostImage({
  className,
  post,
  priority = false,
  sizes,
}: {
  className?: string;
  post: Pick<BlogPostSummary, 'coverImage' | 'title'>;
  priority?: boolean;
  sizes: string;
}) {
  const source = coverImage(post);

  if (!source) {
    return (
      <span
        aria-label={`مقاله: ${post.title}`}
        className={cn(
          'absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_25%_20%,#dfe4ff,transparent_35%),linear-gradient(145deg,#f5f6ff,#eceef8)]',
          className,
        )}
        role="img"
      >
        <BookOpenText aria-hidden="true" className="size-10 text-[#143CFB]/55" />
      </span>
    );
  }

  return (
    <Image
      alt={`تصویر مقاله ${post.title}`}
      className={cn('object-cover', className)}
      fill
      priority={priority}
      sizes={sizes}
      src={source}
    />
  );
}
