import type { Metadata } from 'next';

import { HowItWorksSection } from '@/components/marketing/how-it-works-section';

const description =
  'مسیر کار با وآند؛ از معرفی شرایط و تحلیل اطلاعات تا پیدا کردن گزینه‌ها، مقایسه دانشگاه‌ها، مدیریت مدارک و پیگیری شفاف اپلای.';

export const metadata: Metadata = {
  title: 'نحوه کار وآند',
  description,
  alternates: { canonical: '/how-it-works' },
  openGraph: { title: 'نحوه کار وآند', description, url: '/how-it-works' },
};

export default function HowItWorksPage() {
  return (
    <main id="main-content">
      <HowItWorksSection page />
    </main>
  );
}
