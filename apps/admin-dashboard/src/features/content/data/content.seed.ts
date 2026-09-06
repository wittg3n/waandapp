import type {
  Category,
  Comment,
  ContentHistoryEvent,
  EditorDocument,
  MediaAsset,
  Post,
  PostRevision,
  PostStatus,
  Tag,
} from '../shared/content.types';

const adminId = 'local-admin';
const coverUrl = new URL('../../../assets/hero.png', import.meta.url).href;
const baseDate = '2026-08-01T08:00:00.000Z';

const categoryNames = [
  ['انتخاب رشته', 'field-selection'],
  ['معرفی دانشگاه‌ها', 'universities'],
  ['اپلای تحصیلی', 'study-application'],
  ['مدارک مورد نیاز', 'required-documents'],
  ['بورسیه و هزینه‌ها', 'scholarships-costs'],
  ['مسیر تحصیلی', 'academic-path'],
] as const;

export const categoriesSeed: Category[] = categoryNames.map(([name, slug], index) => ({
  id: `category-${index + 1}`,
  name,
  slug,
  description: `راهنماها و تجربه‌های کاربردی وآند درباره ${name}.`,
  createdAt: baseDate,
  updatedAt: `2026-08-${String(index + 10).padStart(2, '0')}T09:00:00.000Z`,
}));

const tagNames = [
  ['اپلای', 'apply'],
  ['دانشگاه', 'university'],
  ['انتخاب رشته', 'field-selection'],
  ['بورسیه', 'scholarship'],
  ['رزومه', 'resume'],
  ['انگیزه‌نامه', 'statement-of-purpose'],
  ['آیلتس', 'ielts'],
  ['ددلاین', 'deadline'],
  ['کارشناسی', 'bachelor'],
  ['کارشناسی ارشد', 'master'],
  ['دکتری', 'phd'],
  ['کانادا', 'canada'],
  ['آلمان', 'germany'],
  ['هزینه تحصیل', 'tuition'],
  ['مدارک', 'documents'],
  ['برنامه‌ریزی', 'planning'],
] as const;

export const tagsSeed: Tag[] = tagNames.map(([name, slug], index) => ({
  id: `tag-${index + 1}`,
  name,
  slug,
  createdAt: baseDate,
  updatedAt: `2026-08-${String((index % 20) + 1).padStart(2, '0')}T10:00:00.000Z`,
}));

export const mediaSeed: MediaAsset[] = Array.from({ length: 18 }, (_, index) => ({
  id: `media-${String(index + 1).padStart(3, '0')}`,
  type: 'IMAGE',
  filename: `waand-article-cover-${String(index + 1).padStart(2, '0')}.png`,
  mimeType: 'image/png',
  size: 240_000 + index * 18_400,
  width: index % 3 === 0 ? 1600 : 1200,
  height: index % 3 === 0 ? 900 : 720,
  alt: `تصویر راهنمای تحصیلی وآند شماره ${index + 1}`,
  caption: index % 2 === 0 ? 'تصویر تحریریه وآند' : undefined,
  url: coverUrl,
  createdAt: `2026-07-${String((index % 28) + 1).padStart(2, '0')}T08:00:00.000Z`,
  updatedAt: `2026-08-${String((index % 24) + 1).padStart(2, '0')}T08:00:00.000Z`,
  uploadedByAdminId: adminId,
}));

const topics = [
  ['راهنمای انتخاب رشته برای ساختن مسیر تحصیلی بهتر', 'field-selection-guide'],
  ['چطور دانشگاه مناسب خود را پیدا کنیم؟', 'find-the-right-university'],
  ['نقشه راه اپلای تحصیلی از شروع تا پذیرش', 'study-application-roadmap'],
  ['مدارک مورد نیاز اپلای دانشگاه', 'application-required-documents'],
  ['مقایسه دانشگاه‌های کانادا و آلمان', 'canada-germany-universities'],
  ['نوشتن رزومه تحصیلی اثرگذار', 'academic-resume-guide'],
  ['اصول نوشتن انگیزه‌نامه دانشگاه', 'statement-of-purpose-guide'],
  ['برنامه‌ریزی برای ددلاین‌های اپلای', 'application-deadline-planning'],
  ['راهنمای دریافت بورسیه تحصیلی', 'scholarship-application-guide'],
  ['انتخاب مقطع مناسب برای ادامه تحصیل', 'choose-academic-degree'],
  ['آمادگی آزمون زبان برای اپلای', 'language-exam-preparation'],
  ['برآورد هزینه تحصیل و زندگی دانشجویی', 'study-living-costs'],
  ['چک‌لیست اپلای کارشناسی ارشد', 'master-application-checklist'],
  ['مسیر اپلای دکتری و ارتباط با استاد', 'phd-application-path'],
  ['دانشگاه دولتی یا خصوصی؛ کدام بهتر است؟', 'public-vs-private-university'],
  ['چطور رشته‌های میان‌رشته‌ای را مقایسه کنیم؟', 'compare-interdisciplinary-fields'],
  ['اشتباه‌های رایج در پرونده اپلای', 'common-application-mistakes'],
  ['مدیریت زمان در مسیر آماده‌سازی مدارک', 'document-preparation-timeline'],
  ['راهنمای ترجمه رسمی مدارک تحصیلی', 'official-document-translation'],
  ['انتخاب کشور مقصد بر اساس اهداف تحصیلی', 'choose-study-destination'],
  ['پیدا کردن برنامه دانشگاهی متناسب با رزومه', 'match-program-to-profile'],
  ['آماده‌سازی برای مصاحبه دانشگاه', 'university-interview-preparation'],
  ['بعد از دریافت پذیرش چه کار کنیم؟', 'after-university-admission'],
  ['ساخت برنامه جایگزین برای اپلای', 'application-backup-plan'],
] as const;

const statuses: PostStatus[] = [
  'DRAFT',
  'IN_REVIEW',
  'SCHEDULED',
  'PUBLISHED',
  'PUBLISHED',
  'ARCHIVED',
];

function documentFor(index: number): EditorDocument {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'این راهنما مسیر تصمیم‌گیری را به گام‌های روشن و قابل اجرا تقسیم می‌کند.',
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'از کجا شروع کنیم؟' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'ابتدا هدف، محدودیت زمانی و منابع در دسترس خود را مشخص کنید و سپس گزینه‌ها را بسنجید.',
          },
        ],
      },
      ...(index % 4 === 0
        ? [
            {
              type: 'mediaImage',
              attrs: {
                mediaId: mediaSeed[(index + 1) % mediaSeed.length]!.id,
                alt: 'نمونه تصویری مسیر برنامه‌ریزی',
                caption: 'نمایی از مراحل برنامه‌ریزی تحصیلی',
              },
            },
          ]
        : []),
    ],
  };
}

export const postsSeed: Post[] = topics.map(([title, slug], index) => {
  const status = statuses[index % statuses.length]!;
  const date = String((index % 24) + 1).padStart(2, '0');
  return {
    id: `post-${String(index + 1).padStart(3, '0')}`,
    title,
    slug,
    excerpt: `خلاصه‌ای کاربردی برای ${title.replace(/[؟?]/gu, '')} و تصمیم‌گیری دقیق‌تر در مسیر تحصیلی.`,
    content: documentFor(index),
    coverMediaId: mediaSeed[index % mediaSeed.length]!.id,
    categoryId: categoriesSeed[index % categoriesSeed.length]!.id,
    tagIds: [tagsSeed[index % tagsSeed.length]!.id, tagsSeed[(index + 3) % tagsSeed.length]!.id],
    authorAdminId: adminId,
    status,
    seo: {
      title: title.length <= 60 ? title : undefined,
      description: `راهنمای وآند درباره ${title.replace(/[؟?]/gu, '')}.`,
      ogMediaId: mediaSeed[index % mediaSeed.length]!.id,
      noIndex: status !== 'PUBLISHED',
    },
    ...(status === 'SCHEDULED' ? { scheduledAt: `2099-09-${date}T08:30:00.000Z` } : {}),
    ...(status === 'PUBLISHED' ? { publishedAt: `2026-08-${date}T08:30:00.000Z` } : {}),
    ...(status === 'ARCHIVED' ? { archivedAt: `2026-08-${date}T12:30:00.000Z` } : {}),
    createdAt: `2026-07-${date}T08:00:00.000Z`,
    updatedAt: `2026-08-${date}T12:00:00.000Z`,
    lastEditedByAdminId: adminId,
  };
});

export const commentsSeed: Comment[] = Array.from({ length: 32 }, (_, index) => ({
  id: `comment-${String(index + 1).padStart(3, '0')}`,
  postId: postsSeed[index % postsSeed.length]!.id,
  ...(index % 3 === 0
    ? { authorUserId: ((index % 30) + 1).toString(16).padStart(24, '0') }
    : {
        guestName: ['سارا محمدی', 'کیان احمدی', 'نگار کریمی'][index % 3],
        guestEmail: `reader${index + 1}@example.ir`,
      }),
  body: `دیدگاه نمونه ${index + 1} درباره کاربردی بودن این راهنمای تحصیلی و مراحل پیشنهادی آن.`,
  status: (['PENDING', 'APPROVED', 'SPAM', 'TRASHED'] as const)[index % 4],
  createdAt: `2026-08-${String((index % 28) + 1).padStart(2, '0')}T14:00:00.000Z`,
  updatedAt: `2026-08-${String((index % 28) + 1).padStart(2, '0')}T14:00:00.000Z`,
}));

function snapshot(post: Post) {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverMediaId: post.coverMediaId,
    categoryId: post.categoryId,
    tagIds: post.tagIds,
    seo: post.seo,
  };
}

export const revisionsSeed: PostRevision[] = postsSeed.slice(0, 12).map((post, index) => ({
  id: `revision-${String(index + 1).padStart(3, '0')}`,
  postId: post.id,
  snapshot: snapshot(post),
  createdAt: `2026-08-${String(index + 1).padStart(2, '0')}T10:00:00.000Z`,
  adminId,
  summary: 'نسخه اولیه نوشته ذخیره شد',
}));

export const historySeed: ContentHistoryEvent[] = postsSeed.slice(0, 10).map((post, index) => ({
  id: `content-event-${index + 1}`,
  action: post.status === 'PUBLISHED' ? 'POST_PUBLISHED' : 'POST_UPDATED',
  entityId: post.id,
  createdAt: post.updatedAt,
  adminId,
}));
