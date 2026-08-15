import { LandingPage } from '@/components/landing/landing-page';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL.href,
    description: SITE_DESCRIPTION,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    url: SITE_URL.href,
    description: SITE_DESCRIPTION,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    inLanguage: 'fa',
    featureList: [
      'تحلیل هوشمند مدارک و رزومه تحصیلی',
      'پیشنهاد شخصی‌سازی‌شده دانشگاه و برنامه تحصیلی',
      'مدیریت مرحله‌به‌مرحله فرآیند اپلای',
    ],
  },
];

export default function HomePage() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
        type="application/ld+json"
      />
      <LandingPage />
    </>
  );
}
