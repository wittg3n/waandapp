import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { PostMeta } from '@/components/posts/post-meta';
import type { BlogPostSummary } from '@/lib/blog-api';
import { coverImage } from '@/lib/format';

export function FeaturedArticle({ post }: { post: BlogPostSummary }) {
  return (
    <article className="grid overflow-hidden rounded-[1.75rem] border border-[#e5e5e7] bg-white shadow-[0_18px_55px_rgba(25,30,68,0.07)] lg:grid-cols-[1.08fr_.92fr]">
      <Link
        className="focus-ring relative min-h-[280px] overflow-hidden bg-[#eef1ff] sm:min-h-[390px] lg:order-2"
        href={`/posts/${post.slug}`}
      >
        <Image
          alt={`تصویر مقاله برگزیده ${post.title}`}
          className="object-cover"
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 46vw"
          src={coverImage(post)}
        />
      </Link>
      <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-12">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#171717] px-3 py-1.5 text-[11px] font-bold text-white">
            پیشنهاد وآند
          </span>
          <Link
            className="focus-ring rounded-full bg-[#f2f4ff] px-3 py-1.5 text-[11px] font-bold text-[#143CFB]"
            href={`/category/${post.category.slug}`}
          >
            {post.category.name}
          </Link>
        </div>
        <h2 className="mt-5 text-2xl font-black leading-[1.65] tracking-[-0.04em] text-[#171717] sm:text-3xl lg:text-[2.25rem]">
          <Link className="focus-ring rounded-md hover:text-[#143CFB]" href={`/posts/${post.slug}`}>
            {post.title}
          </Link>
        </h2>
        <p className="mt-4 text-sm leading-8 text-[#66666d] sm:text-base">{post.excerpt}</p>
        <PostMeta className="mt-5" post={post} />
        <Link
          className="focus-ring mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-[#171717] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_22px_rgba(0,0,0,0.12)] transition hover:bg-[#292929]"
          href={`/posts/${post.slug}`}
        >
          خواندن مقاله
          <ArrowLeft aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </article>
  );
}
