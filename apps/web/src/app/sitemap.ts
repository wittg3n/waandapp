import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '/', priority: 1 },
    { path: '/how-it-works', priority: 0.9 },
    { path: '/about', priority: 0.7 },
    { path: '/faq', priority: 0.7 },
    { path: '/contact', priority: 0.6 },
  ] as const;

  return routes.map(({ path, priority }) => ({
    url: new URL(path, SITE_URL).href,
    changeFrequency: 'monthly',
    priority,
  }));
}
