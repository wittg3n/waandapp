import { ArrowLeft, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { ArticleGrid } from '@/components/posts/article-grid';
import { FeaturedArticle } from '@/components/posts/featured-article';
import { SearchForm } from '@/components/search/search-form';
import { EmptyState } from '@/components/status/empty-state';
import { getCategories, getPosts } from '@/lib/blog-api';
import { BLOG_DESCRIPTION, BLOG_NAME, blogUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'راهنمای کاربردی اپلای دانشگاه',
  description: BLOG_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: `${BLOG_NAME} | راهنمای کاربردی اپلای دانشگاه`,
    description: BLOG_DESCRIPTION,
    url: '/',
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: BLOG_NAME,
  description: BLOG_DESCRIPTION,
  url: blogUrl(),
  inLanguage: 'fa',
  publisher: {
    '@type': 'Organization',
    name: 'وآند',
  },
};

export default async function BlogHomePage() {
  const [featuredArchive, latestArchive, categories] = await Promise.all([
    getPosts({ featured: true, limit: 1 }),
    getPosts({ limit: 10 }),
    getCategories(),
  ]);
  const featured = featuredArchive.posts[0] ?? latestArchive.posts[0];
  const latest = latestArchive.posts.filter((post) => post.id !== featured?.id).slice(0, 9);

  return (
    <main id="main-content">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
        type="application/ld+json"
      />
      <section className="relative overflow-hidden border-b border-black/[0.04] bg-[#fbfbfd] py-16 sm:py-24 lg:py-28">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-45"
          style={{
            backgroundImage: 'radial-gradient(circle, #d9ddea 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="site-shell relative grid items-center gap-10 lg:grid-cols-[1fr_.82fr] lg:gap-20">
          <div>
            <p className="text-sm font-black text-[#143CFB]">وبلاگ وآند</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.45] tracking-[-0.055em] text-[#171717] sm:text-5xl lg:text-[3.7rem]">
              تصمیم‌های بهتر برای مسیر اپلای
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-[#69696f] sm:text-base">
              از انتخاب دانشگاه و بورسیه تا آماده‌سازی رزومه و انگیزه‌نامه؛ مطالبی روشن و کاربردی
              برای هر مرحله از مسیر شما.
            </p>
            <SearchForm className="mt-8" />
          </div>
          <div className="relative mx-auto hidden aspect-square w-full max-w-[430px] lg:block">
            <div className="absolute inset-[7%] rotate-3 rounded-[2.5rem] border border-[#dfe3f8] bg-white shadow-[0_24px_80px_rgba(20,60,251,0.1)]" />
            <div className="absolute inset-x-[17%] top-[17%] rounded-[1.4rem] border border-[#e6e6ea] bg-white p-5 shadow-[0_12px_35px_rgba(25,30,68,0.07)]">
              <span className="block h-2.5 w-16 rounded-full bg-[#143CFB]" />
              <span className="mt-4 block h-3 w-full rounded-full bg-[#e5e7ef]" />
              <span className="mt-2 block h-3 w-4/5 rounded-full bg-[#eff0f5]" />
            </div>
            <div className="absolute bottom-[18%] right-[9%] w-[58%] -rotate-3 rounded-[1.4rem] bg-[#171717] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.15)]">
              <span className="block h-2.5 w-20 rounded-full bg-[#4161ff]" />
              <span className="mt-4 block h-3 w-full rounded-full bg-white/20" />
              <span className="mt-2 block h-3 w-2/3 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      {featured && (
        <section className="site-shell blog-section">
          <div className="mb-7">
            <h2 className="section-title">پیشنهاد این هفته</h2>
            <p className="section-kicker">
              یک راهنمای عمیق برای برداشتن قدم بعدی با اطمینان بیشتر.
            </p>
          </div>
          <FeaturedArticle post={featured} />
        </section>
      )}

      <section className="border-y border-black/[0.04] bg-[#fafafa] py-12 sm:py-16" id="categories">
        <div className="site-shell">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h2 className="section-title">موضوع‌ها</h2>
              <p className="section-kicker">مستقیم سراغ بخشی بروید که امروز به آن نیاز دارید.</p>
            </div>
            <Link
              className="focus-ring inline-flex w-fit items-center gap-2 rounded-xl text-sm font-bold text-[#143CFB]"
              href="/search"
            >
              جست‌وجوی همه مطالب
              <ArrowLeft aria-hidden="true" className="size-4" />
            </Link>
          </div>
          {categories.length > 0 ? (
            <nav aria-label="موضوع‌های وبلاگ" className="mt-7 flex flex-wrap gap-2.5">
              {categories.map((category) => (
                <Link
                  className="focus-ring rounded-full border border-[#e1e1e4] bg-white px-4 py-2.5 text-sm font-bold text-[#343438] shadow-[0_4px_14px_rgba(0,0,0,0.025)] transition hover:border-[#cbd2ff] hover:bg-[#f3f5ff] hover:text-[#143CFB]"
                  href={`/category/${category.slug}`}
                  key={category.slug}
                >
                  {category.name}
                  {typeof category.postCount === 'number' && (
                    <span className="ms-2 text-[11px] font-medium text-[#929299]">
                      {category.postCount.toLocaleString('fa-IR')}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          ) : (
            <p className="mt-7 text-sm text-[#74747a]">موضوعی برای نمایش ثبت نشده است.</p>
          )}
        </div>
      </section>

      <section className="site-shell blog-section">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="section-title">تازه‌ترین مقاله‌ها</h2>
            <p className="section-kicker">راهنماها و تجربه‌های تازه برای یک اپلای منظم‌تر.</p>
          </div>
          <span className="text-xs text-[#85858c]">
            {latestArchive.pagination.total.toLocaleString('fa-IR')} مطلب منتشرشده
          </span>
        </div>
        {latest.length > 0 ? (
          <ArticleGrid posts={latest} />
        ) : (
          <EmptyState
            actionHref="/search"
            actionLabel="جست‌وجوی مطالب"
            description="به‌زودی راهنماهای تازه اپلای در این بخش منتشر می‌شوند."
            title="هنوز مقاله‌ای منتشر نشده است"
          />
        )}
      </section>

      <section className="site-shell pb-10 sm:pb-16">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-[#171717] px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
          <div aria-hidden="true" className="absolute inset-y-0 left-[16%] w-px bg-white/10" />
          <div
            aria-hidden="true"
            className="absolute -left-16 top-1/2 h-px w-72 -rotate-12 bg-[#4968ff]/70"
          />
          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold text-[#9eaeff]">
                <Mail aria-hidden="true" className="size-4" />
                خبرنامه وآند
              </span>
              <h2 className="mt-3 text-2xl font-black leading-[1.6] tracking-[-0.035em] sm:text-3xl">
                نکته‌های مهم اپلای را از دست ندهید
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/60">
                برای دریافت خلاصه راهنماهای تازه و یادآوری ددلاین‌های مهم، درخواست عضویت خود را برای
                ما بفرستید.
              </p>
            </div>
            <a
              className="focus-ring inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-black text-[#171717] transition hover:bg-[#f1f1f3]"
              href="mailto:newsletter@waand.app?subject=%D8%B9%D8%B6%D9%88%DB%8C%D8%AA%20%D8%AF%D8%B1%20%D8%AE%D8%A8%D8%B1%D9%86%D8%A7%D9%85%D9%87%20%D9%88%D8%A2%D9%86%D8%AF"
            >
              درخواست عضویت
              <ArrowLeft aria-hidden="true" className="size-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
