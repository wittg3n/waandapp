const blogOrigin = process.env.NEXT_PUBLIC_BLOG_URL;
const dashboardOrigin = process.env.NEXT_PUBLIC_USER_DASHBOARD_URL;

if (!blogOrigin) {
  throw new Error('NEXT_PUBLIC_BLOG_URL is not defined.');
}

if (!dashboardOrigin) {
  throw new Error('NEXT_PUBLIC_USER_DASHBOARD_URL is not defined.');
}

export const PUBLIC_NAVIGATION = [
  { href: '/', label: 'خانه' },
  { href: blogOrigin, label: 'وبلاگ' },
  { href: '/about', label: 'درباره ما' },
  { href: '/contact', label: 'تماس با ما' },
] as const;

export const LANDING_NAVIGATION = [
  { href: '#how-it-works', label: 'ویژگی‌ها' },
  { href: '#why-waand', label: 'دانشگاه‌ها' },
  { href: '#pricing', label: 'قیمت‌گذاری' },
  { href: blogOrigin, label: 'وبلاگ' },
  { href: '/about', label: 'درباره ما' },
] as const;

export const BLOG_URL = blogOrigin;

export const DASHBOARD_LOGIN_URL = new URL('/login', dashboardOrigin).toString();

export const DASHBOARD_SIGNUP_URL = new URL('/signup', dashboardOrigin).toString();
