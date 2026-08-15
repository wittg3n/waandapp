import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import '@/styles/globals.css';

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: 'واند | اپلای دانشگاه با هوش مصنوعی',
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'education',
  keywords: [
    'اپلای دانشگاه',
    'اپلای با هوش مصنوعی',
    'پذیرش دانشگاه',
    'اپلای تحصیلی',
    'دانشگاه خارجی',
    'مدیریت اپلای',
    'تحلیل رزومه تحصیلی',
    'پیدا کردن دانشگاه مناسب',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: '/',
    siteName: SITE_NAME,
    title: 'واند | اپلای دانشگاه با هوش مصنوعی',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: 'واند | اپلای دانشگاه با هوش مصنوعی',
    description: SITE_DESCRIPTION,
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
      <body>{children}</body>
    </html>
  );
}
