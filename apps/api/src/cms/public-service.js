import mongoose from 'mongoose';

import { ApiError } from '../middleware/errors.js';
import { CmsAuthor, CmsCategory, CmsMedia, CmsPost, CmsTag } from './models.js';
import { publicPostSummary } from './serializers.js';

export function publicPostFilter(now = new Date()) {
  return {
    status: 'PUBLISHED',
    publishedAt: mongoose.trusted({ $lte: now }),
  };
}

const id = (value) => String(value);

async function relationsFor(posts) {
  const categoryIds = [...new Set(posts.flatMap((post) => post.categoryIds ?? []).map(id))];
  const tagIds = [...new Set(posts.flatMap((post) => post.tagIds ?? []).map(id))];
  const authorIds = [...new Set(posts.map((post) => post.authorId).filter(Boolean).map(id))];
  const [categories, tags, authors] = await Promise.all([
    categoryIds.length
      ? CmsCategory.find({ _id: mongoose.trusted({ $in: categoryIds }) }).lean()
      : [],
    tagIds.length ? CmsTag.find({ _id: mongoose.trusted({ $in: tagIds }) }).lean() : [],
    authorIds.length
      ? CmsAuthor.find({ _id: mongoose.trusted({ $in: authorIds }) }).lean()
      : [],
  ]);
  return {
    categories: new Map(categories.map((item) => [id(item._id), item])),
    tags: new Map(tags.map((item) => [id(item._id), item])),
    authors: new Map(authors.map((item) => [id(item._id), item])),
  };
}

function pagination(total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

async function list(input, now = new Date()) {
  const filter = publicPostFilter(now);
  if (input.featured !== undefined) filter.featured = input.featured;
  if (input.excludeSlug) filter.slug = mongoose.trusted({ $ne: input.excludeSlug });
  if (input.categoryId) filter.categoryIds = input.categoryId;
  if (input.tagId) filter.tagIds = input.tagId;
  if (input.authorId) filter.authorId = input.authorId;
  if (input.search) filter.$text = mongoose.trusted({ $search: input.search });
  const sort = input.search
    ? { score: { $meta: 'textScore' }, publishedAt: -1, _id: -1 }
    : input.sort === 'oldest'
      ? { publishedAt: 1, _id: 1 }
      : { publishedAt: -1, _id: -1 };
  const [posts, total] = await Promise.all([
    CmsPost.find(filter)
      .select({ contentHtml: 0, contentText: 0, createdByUserId: 0, updatedByUserId: 0 })
      .sort(sort)
      .skip((input.page - 1) * input.limit)
      .limit(input.limit)
      .lean(),
    CmsPost.countDocuments(filter),
  ]);
  const relations = await relationsFor(posts);
  return {
    posts: posts.map((post) => publicPostSummary(post, relations)),
    pagination: pagination(total, input.page, input.limit),
  };
}

async function publishedTaxonomy(model, field, now = new Date()) {
  const counts = await CmsPost.aggregate([
    { $match: publicPostFilter(now) },
    { $unwind: '$' + field },
    { $group: { _id: '$' + field, postCount: { $sum: 1 }, latestPublishedAt: { $max: '$publishedAt' } } },
    { $sort: { postCount: -1, latestPublishedAt: -1, _id: 1 } },
  ]);
  if (counts.length === 0) return [];
  const items = await model
    .find({ _id: mongoose.trusted({ $in: counts.map(({ _id }) => _id) }) })
    .lean();
  const byId = new Map(items.map((item) => [id(item._id), item]));
  return counts
    .map(({ _id, postCount }) => {
      const item = byId.get(id(_id));
      return item
        ? {
            id: id(item._id),
            name: item.name,
            slug: item.slug,
            description: item.description ?? '',
            postCount,
          }
        : null;
    })
    .filter(Boolean);
}

export function createPublicBlogService() {
  return {
    async listPosts(input) {
      let categoryId;
      if (input.category) {
        const category = await CmsCategory.findOne({ slug: input.category }).select({ _id: 1 }).lean();
        if (!category) return { posts: [], pagination: pagination(0, input.page, input.limit) };
        categoryId = category._id;
      }
      return list({ ...input, categoryId });
    },

    async getPost(slug) {
      const post = await CmsPost.findOne({ ...publicPostFilter(), slug }).lean();
      if (!post) {
        throw new ApiError(404, 'BLOG_POST_NOT_FOUND', 'The requested blog post was not found.');
      }
      const relations = await relationsFor([post]);
      const summary = publicPostSummary(post, relations);
      const related = await list({
        page: 1,
        limit: 3,
        sort: 'newest',
        categoryId: post.categoryIds[0],
        excludeSlug: post.slug,
      });
      return {
        post: { ...summary, content: post.contentHtml },
        relatedPosts: related.posts,
      };
    },

    async listCategories() {
      return { categories: await publishedTaxonomy(CmsCategory, 'categoryIds') };
    },

    async listTags() {
      return { tags: await publishedTaxonomy(CmsTag, 'tagIds') };
    },

    async listCategoryPosts(slug, input) {
      const category = await CmsCategory.findOne({ slug }).lean();
      if (!category) {
        throw new ApiError(404, 'BLOG_CATEGORY_NOT_FOUND', 'The requested blog category was not found.');
      }
      const result = await list({ ...input, categoryId: category._id });
      return {
        category: {
          id: id(category._id),
          name: category.name,
          slug: category.slug,
          description: category.description,
          postCount: result.pagination.total,
        },
        ...result,
      };
    },

    async listTagPosts(slug, input) {
      const tag = await CmsTag.findOne({ slug }).lean();
      if (!tag) throw new ApiError(404, 'BLOG_TAG_NOT_FOUND', 'The requested blog tag was not found.');
      const result = await list({ ...input, tagId: tag._id });
      return {
        tag: {
          id: id(tag._id),
          name: tag.name,
          slug: tag.slug,
          description: tag.description,
          postCount: result.pagination.total,
        },
        ...result,
      };
    },

    async listAuthorPosts(slug, input) {
      const author = await CmsAuthor.findOne({ slug }).lean();
      if (!author) {
        throw new ApiError(404, 'BLOG_AUTHOR_NOT_FOUND', 'The requested blog author was not found.');
      }
      const result = await list({ ...input, authorId: author._id });
      return {
        author: {
          id: id(author._id),
          name: author.name,
          slug: author.slug,
          role: author.role,
          bio: author.bio,
          postCount: result.pagination.total,
        },
        ...result,
      };
    },

    async getMediaFile(mediaId) {
      if (!mongoose.isObjectIdOrHexString(mediaId)) {
        throw new ApiError(404, 'BLOG_MEDIA_NOT_FOUND', 'The requested media was not found.');
      }
      const media = await CmsMedia.findById(mediaId).select({ storageKey: 1, mimeType: 1 }).lean();
      if (!media) {
        throw new ApiError(404, 'BLOG_MEDIA_NOT_FOUND', 'The requested media was not found.');
      }
      const authorIds = await CmsAuthor.find({ avatarMediaId: media._id }).distinct('_id');
      const referenced = await CmsPost.exists(
        mongoose.trusted({
          ...publicPostFilter(),
          $or: [
            { coverMediaId: media._id },
            { 'seo.ogMediaId': media._id },
            { contentHtml: new RegExp(String(media._id), 'u') },
            ...(authorIds.length > 0 ? [{ authorId: { $in: authorIds } }] : []),
          ],
        }),
      );
      if (!referenced) {
        throw new ApiError(404, 'BLOG_MEDIA_NOT_FOUND', 'The requested media was not found.');
      }
      return { storageKey: media.storageKey, mimeType: media.mimeType };
    },

    async search(input) {
      return { query: input.q, ...(await list({ ...input, search: input.q })) };
    },
  };
}
