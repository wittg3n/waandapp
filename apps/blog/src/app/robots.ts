import type { MetadataRoute } from 'next';

import { BLOG_URL, blogUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/search'],
    },
    sitemap: blogUrl('/sitemap.xml'),
    host: BLOG_URL.origin,
  };
}
