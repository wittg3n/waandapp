import type { MetadataRoute } from 'next';

import { getCategories, getPosts } from '@/lib/blog-api';
import { blogUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const root: MetadataRoute.Sitemap = [
    {
      url: blogUrl(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  try {
    const [archive, categories] = await Promise.all([getPosts({ limit: 24 }), getCategories()]);
    return [
      ...root,
      ...archive.posts.map((post) => ({
        url: blogUrl(`/posts/${post.slug}`),
        lastModified: post.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: post.featured ? 0.9 : 0.7,
      })),
      ...categories.map((category) => ({
        url: blogUrl(`/category/${category.slug}`),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return root;
  }
}
