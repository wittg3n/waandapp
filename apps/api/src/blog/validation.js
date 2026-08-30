import { z } from 'zod';

import { parseBlogInput } from './errors.js';

const slug = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug contains unsupported characters.');
const queryInteger = (minimum, maximum) =>
  z
    .string()
    .regex(/^\d+$/, 'Must be an integer.')
    .transform(Number)
    .pipe(z.number().int().min(minimum).max(maximum));
const defaultTo = (defaultValue, schema) =>
  z.preprocess((value) => (value === undefined ? defaultValue : value), schema);
const page = defaultTo('1', queryInteger(1, 100_000));
const limit = defaultTo('9', queryInteger(1, 24));
const sort = z.enum(['newest', 'oldest']).default('newest');

export const postsQuerySchema = z.strictObject({
  page,
  limit,
  category: slug.optional(),
  featured: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  sort,
});

export const categoryPostsQuerySchema = z.strictObject({ page, limit, sort });
export const searchQuerySchema = z.strictObject({
  q: z.string().trim().min(2).max(100),
  page,
  limit,
});
export const slugParamsSchema = z.strictObject({ slug });

const categorySchema = z.strictObject({
  name: z.string().trim().min(2).max(80),
  slug: slug.max(100),
  description: z.string().trim().min(10).max(240),
});
const authorSchema = z.strictObject({
  name: z.string().trim().min(2).max(100),
  role: z.string().trim().max(100).nullable().optional(),
});
const coverImage = z
  .string()
  .trim()
  .regex(/^\/covers\/[a-z0-9-]+\.svg$/);
const safeSeedHtml = z
  .string()
  .trim()
  .min(100)
  .max(100_000)
  .refine(
    (value) => !/<script\b|\son[a-z]+\s*=|javascript:/iu.test(value),
    'Content contains unsafe HTML.',
  );

export const postInputSchema = z
  .strictObject({
    title: z.string().trim().min(5).max(180),
    slug,
    excerpt: z.string().trim().min(20).max(360),
    content: safeSeedHtml,
    coverImage,
    category: categorySchema,
    tags: z
      .array(z.string().trim().min(2).max(50))
      .min(1)
      .max(8)
      .refine((tags) => new Set(tags).size === tags.length, 'Tags must be unique.'),
    author: authorSchema,
    status: z.enum(['draft', 'published']),
    featured: z.boolean().default(false),
    readingTime: z.number().int().min(1).max(60),
    publishedAt: z.coerce.date().nullable(),
    seo: z
      .strictObject({
        title: z.string().trim().max(70).nullable().optional(),
        description: z.string().trim().max(170).nullable().optional(),
        canonical: z.string().url().nullable().optional(),
        ogImage: coverImage.or(z.string().url().startsWith('https://')).nullable().optional(),
      })
      .optional(),
  })
  .superRefine((post, context) => {
    if (post.status === 'published' && !post.publishedAt) {
      context.addIssue({
        code: 'custom',
        path: ['publishedAt'],
        message: 'Published posts require a publication date.',
      });
    }
  });

export const parsePostsQuery = (input) => parseBlogInput(postsQuerySchema, input, 'query');
export const parseCategoryPostsQuery = (input) =>
  parseBlogInput(categoryPostsQuerySchema, input, 'query');
export const parseSearchQuery = (input) => parseBlogInput(searchQuerySchema, input, 'query');
export const parseSlugParams = (input) => parseBlogInput(slugParamsSchema, input, 'parameters');
