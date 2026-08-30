import { ArrowUpLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { PostMeta } from '@/components/posts/post-meta';
import type { BlogPostSummary } from '@/lib/blog-api';
import { coverImage } from '@/lib/format';

export function ArticleCard({
  post,
  priority = false,
}: {
  post: BlogPostSummary;
  priority?: boolean;
}) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-[#e8e8e8] bg-white shadow-[0_10px_34px_rgba(22,25,42,0.045)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_46px_rgba(22,25,42,0.085)] motion-reduce:transform-none motion-reduce:transition-none">
      <Link
        aria-label={`خواندن مقاله: ${post.title}`}
        className="focus-ring relative aspect-[16/10] overflow-hidden bg-[#f3f5ff]"
        href={`/posts/${post.slug}`}
      >
        <Image
          alt={`تصویر مقاله ${post.title}`}
          className="object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
          fill
          priority={priority}
          sizes="(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 33vw"
          src={coverImage(post)}
        />
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <Link
          className="focus-ring mb-3 w-fit rounded-full bg-[#f2f4ff] px-3 py-1.5 text-[11px] font-bold text-[#143CFB]"
          href={`/category/${post.category.slug}`}
        >
          {post.category.name}
        </Link>
        <h3 className="text-lg font-black leading-[1.75] tracking-[-0.025em] text-[#1d1d20] sm:text-xl">
          <Link className="focus-ring rounded-md hover:text-[#143CFB]" href={`/posts/${post.slug}`}>
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-7 text-[#6c6c73]">{post.excerpt}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <PostMeta post={post} />
          <ArrowUpLeft
            aria-hidden="true"
            className="size-4 shrink-0 text-[#a1a1a7] transition group-hover:text-[#143CFB]"
          />
        </div>
      </div>
    </article>
  );
}
