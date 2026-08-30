import { ArrowRight, UserRound } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArticleGrid } from '@/components/posts/article-grid';
import { PostMeta } from '@/components/posts/post-meta';
import { parseArticleContent } from '@/lib/article-content';
import { getPost, type BlogPost } from '@/lib/blog-api';
import { coverImage } from '@/lib/format';
import { BLOG_NAME, BLOG_URL, blogUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

function canonicalUrl(post: BlogPost) {
  return new URL(post.seo?.canonical ?? `/posts/${post.slug}`, BLOG_URL).toString();
}

function imageUrl(post: BlogPost) {
  return new URL(post.seo?.ogImage ?? coverImage(post), BLOG_URL).toString();
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getPost(slug);

  if (!detail) {
    return { title: 'مقاله پیدا نشد' };
  }

  const { post } = detail;
  const title = post.seo?.title ?? post.title;
  const description = post.seo?.description ?? post.excerpt;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(post) },
    openGraph: {
      type: 'article',
      locale: 'fa_IR',
      siteName: BLOG_NAME,
      title,
      description,
      url: canonicalUrl(post),
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      images: [{ url: imageUrl(post), width: 1200, height: 720, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl(post)],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const detail = await getPost(slug);

  if (!detail) {
    notFound();
  }

  const { post, relatedPosts } = detail;
  const authorName = post.author.name;
  const articleBlocks = parseArticleContent(post.content);
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: imageUrl(post),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: canonicalUrl(post),
    inLanguage: 'fa',
    author: authorName
      ? { '@type': 'Person', name: authorName }
      : { '@type': 'Organization', name: 'وآند' },
    publisher: { '@type': 'Organization', name: 'وآند', url: blogUrl() },
  };

  return (
    <main id="main-content">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
        type="application/ld+json"
      />
      <header className="border-b border-black/[0.04] bg-[#fbfbfc] py-12 sm:py-18 lg:py-20">
        <div className="content-shell">
          <Link
            className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-bold text-[#66666d] hover:text-[#143CFB]"
            href="/"
          >
            <ArrowRight aria-hidden="true" className="size-4" />
            بازگشت به وبلاگ
          </Link>
          <div className="mx-auto mt-8 max-w-4xl text-center">
            <Link
              className="focus-ring inline-flex rounded-full bg-[#eef1ff] px-3.5 py-1.5 text-xs font-bold text-[#143CFB]"
              href={`/category/${post.category.slug}`}
            >
              {post.category.name}
            </Link>
            <h1 className="mt-5 text-3xl font-black leading-[1.6] tracking-[-0.05em] text-[#171717] sm:text-4xl lg:text-[3rem]">
              {post.title}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-8 text-[#6c6c73] sm:text-base">
              {post.excerpt}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              {authorName && (
                <span className="inline-flex items-center gap-2 text-xs font-bold text-[#55555b]">
                  <span className="grid size-8 place-items-center rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.06)]">
                    <UserRound aria-hidden="true" className="size-4 text-[#143CFB]" />
                  </span>
                  {authorName}
                </span>
              )}
              <PostMeta post={post} />
            </div>
          </div>
        </div>
      </header>

      <div className="content-shell py-9 sm:py-12">
        <div className="relative mx-auto aspect-[16/9] max-w-5xl overflow-hidden rounded-[1.5rem] border border-[#e5e5e8] bg-[#eef1ff] shadow-[0_18px_55px_rgba(25,30,68,0.08)] sm:rounded-[1.75rem]">
          <Image
            alt={`تصویر مقاله ${post.title}`}
            className="object-cover"
            fill
            priority
            sizes="(max-width: 1152px) 100vw, 1152px"
            src={coverImage(post)}
          />
        </div>
        <article className="article-prose mx-auto mt-10 max-w-[46rem] sm:mt-14">
          {articleBlocks.map((block, index) =>
            block.type === 'h2' ? (
              <h2 key={`${block.type}-${index}`}>{block.text}</h2>
            ) : (
              <p key={`${block.type}-${index}`}>{block.text}</p>
            ),
          )}
        </article>
        {post.tags.length > 0 && (
          <div
            className="mx-auto mt-12 flex max-w-[46rem] flex-wrap gap-2 border-t border-[#e8e8e8] pt-6"
            aria-label="برچسب‌های مقاله"
          >
            {post.tags.map((tag) => (
              <span
                className="rounded-full bg-[#f4f4f6] px-3 py-1.5 text-xs text-[#64646b]"
                key={tag}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {relatedPosts.length > 0 && (
        <section className="border-t border-black/[0.04] bg-[#fafafa] py-14 sm:py-20">
          <div className="site-shell">
            <h2 className="section-title">مطالب مرتبط</h2>
            <p className="section-kicker">برای ادامه این مسیر، این راهنماها را هم بخوانید.</p>
            <div className="mt-8">
              <ArticleGrid posts={relatedPosts.slice(0, 3)} />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
