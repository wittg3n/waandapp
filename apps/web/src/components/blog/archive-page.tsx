import Link from 'next/link';

import { ArticleGrid } from '@/components/blog/posts/article-grid';
import { Pagination } from '@/components/blog/posts/pagination';
import { EmptyState } from '@/components/blog/status/empty-state';
import type { BlogPostSummary, Pagination as PaginationData } from '@/lib/blog-api';

export function BlogArchivePage({
  basePath,
  description,
  label,
  name,
  pagination,
  posts,
}: {
  basePath: string;
  description: string;
  label: string;
  name: string;
  pagination: PaginationData;
  posts: BlogPostSummary[];
}) {
  return (
    <main className="site-shell py-12 sm:py-18 lg:py-20" id="main-content">
      <nav aria-label="مسیر صفحه" className="flex items-center gap-2 text-xs text-[#7a7a80]">
        <Link className="focus-ring rounded hover:text-[#143CFB]" href="/blog">
          وبلاگ
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{name}</span>
      </nav>
      <header className="mt-7 max-w-3xl">
        <p className="text-sm font-black text-[#143CFB]">{label}</p>
        <h1 className="mt-3 text-3xl font-black leading-[1.55] tracking-[-0.045em] text-[#171717] sm:text-4xl">
          {name}
        </h1>
        <p className="mt-3 text-sm leading-8 text-[#6d6d74] sm:text-base">{description}</p>
        <p className="mt-4 text-xs text-[#85858b]">
          {pagination.total.toLocaleString('fa-IR')} مقاله
        </p>
      </header>

      <section className="mt-10" aria-label={`مقاله‌های ${name}`}>
        {posts.length > 0 ? (
          <>
            <ArticleGrid posts={posts} />
            <Pagination basePath={basePath} pagination={pagination} />
          </>
        ) : (
          <EmptyState
            description="هنوز مطلبی در این بخش منتشر نشده است. موضوع‌های دیگر را ببینید یا عبارت دقیق‌تری جست‌وجو کنید."
            title="مقاله‌ای در این بخش نیست"
          />
        )}
      </section>
    </main>
  );
}
