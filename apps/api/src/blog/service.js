import { blogCategoryNotFound, blogPostNotFound } from './errors.js';
import { createBlogRepository } from './repository.js';

function serializeDate(value) {
  return value ? new Date(value).toISOString() : null;
}

export function serializePostSummary(value) {
  const post = typeof value?.toObject === 'function' ? value.toObject() : value;

  return {
    id: String(post._id),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    category: { ...post.category },
    tags: [...post.tags],
    author: { ...post.author },
    featured: post.featured,
    readingTime: post.readingTime,
    publishedAt: serializeDate(post.publishedAt),
    createdAt: serializeDate(post.createdAt),
    updatedAt: serializeDate(post.updatedAt),
    seo: { ...post.seo },
  };
}

export function serializePost(value) {
  const post = typeof value?.toObject === 'function' ? value.toObject() : value;
  return { ...serializePostSummary(post), content: post.content };
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

function serializeListing(result, page, limit) {
  return {
    posts: result.posts.map(serializePostSummary),
    pagination: pagination(result.total, page, limit),
  };
}

export function createBlogService(repository = createBlogRepository()) {
  return {
    async listPosts(input) {
      return serializeListing(await repository.listPosts(input), input.page, input.limit);
    },

    async getPost(slug) {
      const post = await repository.findPublishedPostBySlug(slug);
      if (!post) throw blogPostNotFound();

      const related = await repository.listPosts({
        page: 1,
        limit: 3,
        category: post.category.slug,
        excludeSlug: slug,
      });

      return {
        post: serializePost(post),
        relatedPosts: related.posts.map(serializePostSummary),
      };
    },

    async listCategories() {
      return { categories: await repository.listPublishedCategories() };
    },

    async listCategoryPosts(slug, input) {
      const [category, result] = await Promise.all([
        repository.findPublishedCategory(slug),
        repository.listPosts({ ...input, category: slug }),
      ]);
      if (!category) throw blogCategoryNotFound();

      return {
        category: { ...category, postCount: result.total },
        ...serializeListing(result, input.page, input.limit),
      };
    },

    async search(input) {
      const result = await repository.listPosts({
        page: input.page,
        limit: input.limit,
        search: input.q,
      });
      return { query: input.q, ...serializeListing(result, input.page, input.limit) };
    },
  };
}
