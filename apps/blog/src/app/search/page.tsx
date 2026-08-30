import type { Metadata } from 'next';

import { ArticleGrid } from '@/components/posts/article-grid';
import { Pagination } from '@/components/posts/pagination';
import { SearchForm } from '@/components/search/search-form';
import { EmptyState } from '@/components/status/empty-state';
import { searchPosts } from '@/lib/blog-api';
import { normalizeSearchQuery, positivePage } from '@/lib/route-params';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ page?: string | string[]; q?: string | string[] }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = normalizeSearchQuery((await searchParams).q);

  return {
    title: query ? `نتایج جست‌وجوی «${query}»` : 'جست‌وجوی مقاله‌ها',
    description: 'جست‌وجو در راهنماها و مقاله‌های فارسی وبلاگ وآند.',
    alternates: { canonical: '/search' },
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const parameters = await searchParams;
  const query = normalizeSearchQuery(parameters.q);
  const page = positivePage(parameters.page);
  const archive = query.length >= 2 ? await searchPosts(query, page) : null;

  return (
    <main className="site-shell py-12 sm:py-18 lg:py-20" id="main-content">
      <header className="max-w-3xl">
        <p className="text-sm font-black text-[#143CFB]">جست‌وجو</p>
        <h1 className="mt-3 text-3xl font-black leading-[1.55] tracking-[-0.045em] text-[#171717] sm:text-4xl">
          پیدا کردن راهنمای مناسب
        </h1>
        <p className="mt-3 text-sm leading-8 text-[#6d6d74] sm:text-base">
          میان راهنماهای اپلای، دانشگاه، مدارک و تجربه‌های دانشجویان جست‌وجو کنید.
        </p>
      </header>
      <SearchForm className="mt-7" compact defaultValue={query} />

      <section className="mt-12" aria-live="polite">
        {query.length < 2 ? (
          <EmptyState
            actionHref="/"
            actionLabel="دیدن تازه‌ترین مطالب"
            description={
              query
                ? 'برای جست‌وجوی دقیق‌تر، دست‌کم دو نویسه وارد کنید.'
                : 'یک موضوع، کشور، مدرک یا مرحله از مسیر اپلای را در کادر بالا وارد کنید.'
            }
            title={query ? 'عبارت جست‌وجو خیلی کوتاه است' : 'عبارت جست‌وجو را وارد کنید'}
          />
        ) : archive && archive.posts.length > 0 ? (
          <>
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-[#202024]">نتایج «{query}»</h2>
                <p className="mt-1 text-xs text-[#808087]">
                  {archive.pagination.total.toLocaleString('fa-IR')} نتیجه پیدا شد
                </p>
              </div>
            </div>
            <ArticleGrid posts={archive.posts} />
            <Pagination basePath="/search" pagination={archive.pagination} query={query} />
          </>
        ) : (
          <EmptyState
            actionHref="/"
            actionLabel="بازگشت به تازه‌ترین مطالب"
            description={`برای «${query}» نتیجه‌ای پیدا نشد. املای عبارت را بررسی کنید یا موضوع کلی‌تری بنویسید.`}
            title="نتیجه‌ای پیدا نشد"
          />
        )}
      </section>
    </main>
  );
}
