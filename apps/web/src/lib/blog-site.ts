import { SITE_URL } from '@/lib/site';

export const BLOG_NAME = 'وبلاگ وآند';
export const BLOG_DESCRIPTION =
  'راهنماها، تجربه‌ها و نکته‌های کاربردی برای انتخاب دانشگاه، آماده‌سازی مدارک و مدیریت مسیر اپلای.';

export function blogUrl(path = '') {
  const suffix = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return new URL(`/blog${suffix}`, SITE_URL).toString();
}
