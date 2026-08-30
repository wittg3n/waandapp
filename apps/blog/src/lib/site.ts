export const BLOG_NAME = 'وبلاگ وآند';
export const BLOG_DESCRIPTION =
  'راهنماها، تجربه‌ها و نکته‌های کاربردی برای انتخاب دانشگاه، آماده‌سازی مدارک و مدیریت مسیر اپلای.';

export const BLOG_URL = new URL(process.env.NEXT_PUBLIC_BLOG_URL ?? 'https://blog.waand.app');
export const SITE_URL = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://waand.app');
export const DASHBOARD_URL = new URL(
  process.env.NEXT_PUBLIC_USER_DASHBOARD_URL ?? 'https://app.waand.app',
);

export const DASHBOARD_LOGIN_URL = new URL('/login', DASHBOARD_URL).toString();
export const DASHBOARD_SIGNUP_URL = new URL('/signup', DASHBOARD_URL).toString();

export function blogUrl(path = '/') {
  return new URL(path, BLOG_URL).toString();
}

export function siteUrl(path = '/') {
  return new URL(path, SITE_URL).toString();
}
