import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { BLOG_DESCRIPTION, BLOG_NAME, BLOG_URL } from '@/lib/site';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: BLOG_URL,
  title: {
    default: `${BLOG_NAME} | راهنمای کاربردی اپلای دانشگاه`,
    template: `%s | ${BLOG_NAME}`,
  },
  description: BLOG_DESCRIPTION,
  applicationName: BLOG_NAME,
  authors: [{ name: 'وآند', url: BLOG_URL }],
  creator: 'وآند',
  publisher: 'وآند',
  category: 'education',
  keywords: [
    'اپلای دانشگاه',
    'راهنمای اپلای',
    'بورسیه تحصیلی',
    'انگیزه نامه',
    'رزومه تحصیلی',
    'انتخاب دانشگاه',
    'ددلاین دانشگاه',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: '/',
    siteName: BLOG_NAME,
    title: `${BLOG_NAME} | راهنمای کاربردی اپلای دانشگاه`,
    description: BLOG_DESCRIPTION,
    images: [{ url: '/covers/application-roadmap.svg', width: 1200, height: 720 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BLOG_NAME} | راهنمای کاربردی اپلای دانشگاه`,
    description: BLOG_DESCRIPTION,
    images: ['/covers/application-roadmap.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fefefe',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html dir="rtl" lang="fa">
      <body>
        <a className="skip-link" href="#main-content">
          پرش به محتوای اصلی
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
