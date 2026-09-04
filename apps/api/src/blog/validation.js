import { z } from 'zod';

import { parseBlogInput } from './errors.js';

const slug = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u, 'Slug contains unsupported characters.');
const queryInteger = (minimum, maximum) =>
  z
    .string()
    .regex(/^\d+$/, 'Must be an integer.')
    .transform(Number)
    .pipe(z.number().int().min(minimum).max(maximum));
const defaultTo = (defaultValue, schema) =>
  z.preprocess((value) => (value === undefined ? defaultValue : value), schema);
const page = defaultTo('1', queryInteger(1, 100000));
const limit = defaultTo('9', queryInteger(1, 24));
const sort = z.enum(['newest', 'oldest']).default('newest');

export const postsQuerySchema = z.strictObject({
  page,
  limit,
  category: slug.optional(),
  tag: slug.optional(),
  author: slug.optional(),
  featured: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  sort,
});
export const archiveQuerySchema = z.strictObject({ page, limit, sort });
export const searchQuerySchema = z.strictObject({
  q: z.string().trim().min(2).max(100),
  page,
  limit,
});
export const slugParamsSchema = z.strictObject({ slug });

export const parsePostsQuery = (input) => parseBlogInput(postsQuerySchema, input, 'query');
export const parseArchiveQuery = (input) => parseBlogInput(archiveQuerySchema, input, 'query');
export const parseCategoryPostsQuery = parseArchiveQuery;
export const parseSearchQuery = (input) => parseBlogInput(searchQuerySchema, input, 'query');
export const parseSlugParams = (input) => parseBlogInput(slugParamsSchema, input, 'parameters');
