import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArticleGrid } from '@/components/posts/article-grid';
import { Pagination } from '@/components/posts/pagination';
import { EmptyState } from '@/components/status/empty-state';
import { getCategoryPosts } from '@/lib/blog-api';
import { positivePage } from '@/lib/route-params';
import { blogUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const archive = await getCategoryPosts(slug);

  if (!archive) {
    return { title: 'موضوع پیدا نشد' };
  }

  const title = `${archive.category.name}؛ مقاله‌ها و راهنماها`;
  const description =
    archive.category.description ?? `تازه‌ترین راهنماهای وآند درباره ${archive.category.name}.`;

  return {
    title,
    description,
    alternates: { canonical: `/category/${archive.category.slug}` },
    openGraph: {
      title,
      description,
      url: blogUrl(`/category/${archive.category.slug}`),
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const page = positivePage(query.page);
  const archive = await getCategoryPosts(slug, page);

  if (!archive) {
    notFound();
  }

  return (
    <main className="site-shell py-12 sm:py-18 lg:py-20" id="main-content">
      <nav aria-label="مسیر صفحه" className="flex items-center gap-2 text-xs text-[#7a7a80]">
        <Link className="focus-ring rounded hover:text-[#143CFB]" href="/">
          وبلاگ
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{archive.category.name}</span>
      </nav>
      <header className="mt-7 max-w-3xl">
        <p className="text-sm font-black text-[#143CFB]">موضوع</p>
        <h1 className="mt-3 text-3xl font-black leading-[1.55] tracking-[-0.045em] text-[#171717] sm:text-4xl">
          {archive.category.name}
        </h1>
        <p className="mt-3 text-sm leading-8 text-[#6d6d74] sm:text-base">
          {archive.category.description ??
            `راهنماها و تجربه‌های کاربردی درباره ${archive.category.name}.`}
        </p>
        <p className="mt-4 text-xs text-[#85858b]">
          {archive.pagination.total.toLocaleString('fa-IR')} مقاله
        </p>
      </header>

      <section className="mt-10" aria-label={`مقاله‌های ${archive.category.name}`}>
        {archive.posts.length > 0 ? (
          <>
            <ArticleGrid posts={archive.posts} />
            <Pagination
              basePath={`/category/${archive.category.slug}`}
              pagination={archive.pagination}
            />
          </>
        ) : (
          <EmptyState
            description="هنوز مطلبی در این موضوع منتشر نشده است. موضوع‌های دیگر را ببینید یا عبارت دقیق‌تری جست‌وجو کنید."
            title="مقاله‌ای در این موضوع نیست"
          />
        )}
      </section>
    </main>
  );
}
