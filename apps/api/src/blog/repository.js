import mongoose from 'mongoose';

import { Post } from './models/post.js';

export function publishedPostFilter(now = new Date()) {
  return {
    status: 'published',
    publishedAt: mongoose.trusted({ $lte: now }),
  };
}

function postSort(sort, searching) {
  if (searching) return { score: { $meta: 'textScore' }, publishedAt: -1, _id: -1 };
  return sort === 'oldest' ? { publishedAt: 1, _id: 1 } : { publishedAt: -1, _id: -1 };
}

export function createBlogRepository(postModel = Post) {
  return {
    async listPosts({
      page,
      limit,
      category,
      featured,
      sort = 'newest',
      search,
      excludeSlug,
      now = new Date(),
    }) {
      const filter = publishedPostFilter(now);
      if (category) filter['category.slug'] = category;
      if (featured !== undefined) filter.featured = featured;
      if (search) filter.$text = mongoose.trusted({ $search: search });
      if (excludeSlug) filter.slug = mongoose.trusted({ $ne: excludeSlug });

      const [posts, total] = await Promise.all([
        postModel
          .find(filter)
          .select({ content: 0 })
          .sort(postSort(sort, Boolean(search)))
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        postModel.countDocuments(filter),
      ]);

      return { posts, total };
    },

    findPublishedPostBySlug(slug, now = new Date()) {
      return postModel.findOne({ ...publishedPostFilter(now), slug }).lean();
    },

    async findPublishedCategory(slug, now = new Date()) {
      const post = await postModel
        .findOne({ ...publishedPostFilter(now), 'category.slug': slug })
        .select({ category: 1 })
        .sort({ publishedAt: -1, _id: -1 })
        .lean();
      return post?.category ?? null;
    },

    listPublishedCategories(now = new Date()) {
      return postModel.aggregate([
        { $match: publishedPostFilter(now) },
        {
          $group: {
            _id: '$category.slug',
            name: { $first: '$category.name' },
            description: { $first: '$category.description' },
            postCount: { $sum: 1 },
            latestPublishedAt: { $max: '$publishedAt' },
          },
        },
        { $sort: { postCount: -1, latestPublishedAt: -1, _id: 1 } },
        {
          $project: {
            _id: 0,
            slug: '$_id',
            name: 1,
            description: 1,
            postCount: 1,
          },
        },
      ]);
    },
  };
}
