import mongoose from 'mongoose';
import { z } from 'zod';

const slugPattern = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;
const slug = z.string().trim().min(1).max(160).regex(slugPattern);
const reason = z.string().trim().min(3).max(500);
const nullableId = z
  .string()
  .trim()
  .refine((value) => mongoose.isObjectIdOrHexString(value), 'Invalid resource identifier.')
  .nullable();
export const cmsId = nullableId.unwrap();

const seo = z.object({
  title: z.string().trim().max(70).nullable().optional(),
  description: z.string().trim().max(170).nullable().optional(),
  canonical: z.string().url().max(2048).nullable().optional(),
  noIndex: z.boolean().optional(),
  ogMediaId: nullableId.optional(),
});

const pagination = {
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
};

export const cmsListQuery = z.object({
  ...pagination,
  search: z.string().trim().max(120).optional(),
});

export const cmsPostsQuery = z.object({
  ...pagination,
  search: z.string().trim().max(120).optional(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']).optional(),
  authorId: cmsId.optional(),
  categoryId: cmsId.optional(),
  tagId: cmsId.optional(),
});

const postFields = {
  title: z.string().trim().min(5).max(180),
  slug,
  excerpt: z.string().trim().min(20).max(360),
  contentHtml: z.string().trim().min(20).max(200000),
  coverMediaId: nullableId.optional(),
  categoryIds: z.array(cmsId).min(1).max(3).transform((values) => [...new Set(values)]),
  tagIds: z.array(cmsId).max(12).transform((values) => [...new Set(values)]),
  authorId: cmsId,
  featured: z.boolean().optional(),
  seo: seo.optional(),
};

export const cmsPostCreateBody = z.object(postFields);
export const cmsPostUpdateBody = z
  .object({
    title: postFields.title.optional(),
    slug: postFields.slug.optional(),
    excerpt: postFields.excerpt.optional(),
    contentHtml: postFields.contentHtml.optional(),
    coverMediaId: postFields.coverMediaId,
    categoryIds: postFields.categoryIds.optional(),
    tagIds: postFields.tagIds.optional(),
    authorId: postFields.authorId.optional(),
    featured: postFields.featured,
    seo: postFields.seo,
    reason,
  })
  .refine((value) => Object.keys(value).some((key) => key !== 'reason'), {
    message: 'At least one post field must be changed.',
  });

export const cmsReasonBody = z.object({ reason });
export const cmsScheduleBody = z.object({
  scheduledAt: z.coerce.date().refine((value) => value.getTime() > Date.now(), 'Schedule must be in the future.'),
  reason,
});
export const cmsRestoreBody = z.object({ revisionNumber: z.number().int().min(1), reason });

export const cmsCategoryBody = z.object({
  name: z.string().trim().min(2).max(80),
  slug: slug.max(120),
  description: z.string().trim().max(500).default(''),
  parentId: nullableId.optional(),
  seo: seo.optional(),
});
export const cmsTagBody = z.object({
  name: z.string().trim().min(2).max(60),
  slug: slug.max(120),
  description: z.string().trim().max(300).default(''),
  seo: seo.optional(),
});
export const cmsAuthorBody = z.object({
  name: z.string().trim().min(2).max(100),
  slug: slug.max(120),
  role: z.string().trim().max(100).nullable().optional(),
  bio: z.string().trim().max(1000).default(''),
  avatarMediaId: nullableId.optional(),
  linkedCoreUserId: nullableId.optional(),
});
export const cmsMediaBody = z.object({
  alt: z.string().trim().min(1).max(240),
  caption: z.string().trim().max(500).default(''),
});
