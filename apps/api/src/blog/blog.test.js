import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';

import express from 'express';
import mongoose from 'mongoose';

import { blogCategoryNotFound, blogPostNotFound } from './errors.js';
import { BLOG_INDEX_DEFINITIONS } from './index-names.js';
import { verifyBlogIndexes } from './indexes.js';
import { Post } from './models/post.js';
import { createBlogRepository, publishedPostFilter } from './repository.js';
import { createBlogRouter } from './routes.js';
import { BLOG_SEED_POSTS, seedBlogDevelopmentData } from './seed.js';
import { createBlogService } from './service.js';
import { parsePostsQuery, parseSearchQuery, parseSlugParams } from './validation.js';
import { errorHandler } from '../middleware/errors.js';

function postFixture(overrides = {}) {
  return {
    _id: 'post-1',
    title: 'راهنمای نمونه اپلای',
    slug: 'sample-application-guide',
    excerpt: 'این خلاصه برای بررسی رفتار سرویس وبلاگ وآند نوشته شده است.',
    content: '<p>محتوای معتبر و کنترل‌شده برای بررسی خروجی سرویس وبلاگ وآند.</p>',
    coverImage: '/covers/application-roadmap.svg',
    category: {
      name: 'راهنمای اپلای',
      slug: 'application-guide',
      description: 'راهنماهای مرحله‌به‌مرحله برای ساختن یک مسیر روشن اپلای.',
    },
    tags: ['اپلای'],
    author: { name: 'تیم محتوای وآند', role: 'تحریریه وآند' },
    status: 'published',
    featured: true,
    readingTime: 4,
    publishedAt: new Date('2026-08-01T08:00:00.000Z'),
    createdAt: new Date('2026-07-30T08:00:00.000Z'),
    updatedAt: new Date('2026-08-01T08:00:00.000Z'),
    seo: { title: 'راهنمای نمونه', description: 'توضیح نمونه', canonical: null, ogImage: null },
    ...overrides,
  };
}

async function withServer(app, callback) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const { port } = server.address();
    await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

test('blog query validation applies bounded defaults and rejects unknown or malformed input', () => {
  assert.deepEqual(parsePostsQuery({}), {
    page: 1,
    limit: 9,
    sort: 'newest',
  });
  assert.deepEqual(
    parsePostsQuery({
      page: '2',
      limit: '24',
      category: 'application-guide',
      featured: 'false',
      sort: 'oldest',
    }),
    {
      page: 2,
      limit: 24,
      category: 'application-guide',
      featured: false,
      sort: 'oldest',
    },
  );
  assert.equal(parseSearchQuery({ q: '  بورسیه تحصیلی  ' }).q, 'بورسیه تحصیلی');
  assert.equal(parseSlugParams({ slug: 'application-roadmap' }).slug, 'application-roadmap');
  for (const query of [
    { limit: '25' },
    { page: '0' },
    { featured: 'yes' },
    { category: { $ne: null } },
    { unexpected: 'value' },
  ]) {
    assert.throws(() => parsePostsQuery(query), { code: 'BLOG_VALIDATION_ERROR' });
  }
  assert.throws(() => parseSearchQuery({ q: ' ' }), { code: 'BLOG_VALIDATION_ERROR' });
});

test('Post model carries only the required query and search indexes', async () => {
  const schemaIndexes = Post.schema.indexes();
  assert.equal(schemaIndexes.length, BLOG_INDEX_DEFINITIONS.length);
  for (const definition of BLOG_INDEX_DEFINITIONS) {
    const actual = schemaIndexes.find(([, options]) => options.name === definition.options.name);
    assert.ok(actual, `Missing model index ${definition.options.name}`);
    assert.deepEqual(actual[0], definition.key);
    if (definition.options.unique) assert.equal(actual[1].unique, true);
    if (definition.options.weights) assert.deepEqual(actual[1].weights, definition.options.weights);
  }

  const publishedWithoutDate = new Post({ ...BLOG_SEED_POSTS[0], publishedAt: null });
  await assert.rejects(publishedWithoutDate.validate(), /publication date/i);
});

test('blog index verification rejects same-name semantic variants without a database', async () => {
  const indexes = BLOG_INDEX_DEFINITIONS.map(({ key, options }) => ({
    key: Object.values(key).includes('text') ? { _fts: 'text', _ftsx: 1 } : structuredClone(key),
    ...structuredClone(options),
  }));
  const fakeModel = (listedIndexes) => ({
    collection: {
      listIndexes: () => ({ toArray: async () => structuredClone(listedIndexes) }),
    },
  });

  await verifyBlogIndexes(fakeModel(indexes));

  const optionVariants = [
    ['unique_blog_post_slug', 'unique', false],
    ['published_blog_posts', 'partialFilterExpression', { status: 'published' }],
    ['published_blog_posts', 'sparse', true],
    ['published_blog_posts', 'collation', { locale: 'fa', strength: 1 }],
    ['published_blog_posts', 'hidden', true],
    ['published_blog_posts', 'prepareUnique', true],
    ['published_blog_posts', 'expireAfterSeconds', 60],
    ['blog_post_search', 'weights', { title: 9, excerpt: 5, tags: 4, content: 1 }],
    ['blog_post_search', 'default_language', 'english'],
    ['blog_post_search', 'language_override', 'locale'],
    ['blog_post_search', 'textIndexVersion', 2],
  ];
  for (const [name, option, value] of optionVariants) {
    const changed = structuredClone(indexes);
    changed.find((index) => index.name === name)[option] = value;
    await assert.rejects(verifyBlogIndexes(fakeModel(changed)), new RegExp(name));
  }

  for (const [name, key] of [
    ['published_blog_posts', { status: 1, publishedAt: 1, _id: -1 }],
    ['blog_post_search', { _fts: 'text' }],
  ]) {
    const changed = structuredClone(indexes);
    changed.find((index) => index.name === name).key = key;
    await assert.rejects(verifyBlogIndexes(fakeModel(changed)), new RegExp(name));
  }

  await assert.rejects(verifyBlogIndexes(fakeModel(indexes.slice(1))), /unique_blog_post_slug/);
});

test('public repository filter remains intact under the API Mongoose sanitizer', () => {
  const now = new Date('2026-08-28T00:00:00.000Z');
  const filter = publishedPostFilter(now);

  mongoose.sanitizeFilter(filter);

  assert.equal(filter.status, 'published');
  assert.deepEqual(Object.keys(filter.publishedAt), ['$lte']);
  assert.equal(filter.publishedAt.$lte, now);
});

test('blog repository excludes content from list queries but retains it for post detail', async () => {
  const post = postFixture();
  const calls = {};
  const listQuery = {
    select(projection) {
      calls.projection = projection;
      return this;
    },
    sort(sort) {
      calls.sort = sort;
      return this;
    },
    skip(value) {
      calls.skip = value;
      return this;
    },
    limit(value) {
      calls.limit = value;
      return this;
    },
    async lean() {
      return [post];
    },
  };
  const postModel = {
    find(filter) {
      calls.listFilter = filter;
      return listQuery;
    },
    async countDocuments(filter) {
      calls.countFilter = filter;
      return 1;
    },
    findOne(filter) {
      calls.detailFilter = filter;
      return { lean: async () => post };
    },
  };
  const repository = createBlogRepository(postModel);
  const now = new Date('2026-08-28T00:00:00.000Z');

  const listing = await repository.listPosts({
    page: 2,
    limit: 3,
    sort: 'newest',
    now,
  });
  assert.deepEqual(calls.projection, { content: 0 });
  assert.deepEqual(calls.listFilter, publishedPostFilter(now));
  assert.deepEqual(calls.countFilter, calls.listFilter);
  assert.deepEqual(calls.sort, { publishedAt: -1, _id: -1 });
  assert.equal(calls.skip, 3);
  assert.equal(calls.limit, 3);
  assert.equal(listing.total, 1);

  await repository.listPosts({
    page: 1,
    limit: 3,
    sort: 'newest',
    search: 'بورسیه',
    excludeSlug: post.slug,
    now,
  });
  mongoose.sanitizeFilter(calls.listFilter);
  assert.deepEqual(Object.keys(calls.listFilter.$text), ['$search']);
  assert.deepEqual(Object.keys(calls.listFilter.slug), ['$ne']);

  const detail = await repository.findPublishedPostBySlug(post.slug, now);
  assert.deepEqual(calls.detailFilter, { ...publishedPostFilter(now), slug: post.slug });
  assert.equal(detail.content, post.content);
});

test('blog service keeps content in detail responses and omits it from every summary listing', async () => {
  const post = postFixture();
  const calls = [];
  const repository = {
    async listPosts(input) {
      calls.push(input);
      if (input.excludeSlug)
        return { posts: [postFixture({ _id: 'post-2', slug: 'related' })], total: 1 };
      return { posts: [post], total: 10 };
    },
    async findPublishedPostBySlug() {
      return post;
    },
    async findPublishedCategory() {
      return post.category;
    },
    async listPublishedCategories() {
      return [{ ...post.category, postCount: 2 }];
    },
  };
  const service = createBlogService(repository);

  const listing = await service.listPosts({ page: 2, limit: 3, sort: 'newest' });
  assert.deepEqual(listing.pagination, {
    page: 2,
    limit: 3,
    total: 10,
    totalPages: 4,
    hasNextPage: true,
    hasPreviousPage: true,
  });
  assert.equal(listing.posts[0].id, 'post-1');
  assert.equal('status' in listing.posts[0], false);
  assert.equal('content' in listing.posts[0], false);
  assert.equal(listing.posts[0].publishedAt, '2026-08-01T08:00:00.000Z');

  const single = await service.getPost(post.slug);
  assert.equal(single.post.slug, post.slug);
  assert.equal(single.post.content, post.content);
  assert.deepEqual(
    single.relatedPosts.map(({ slug }) => slug),
    ['related'],
  );
  assert.equal('content' in single.relatedPosts[0], false);
  assert.deepEqual(calls.at(-1), {
    page: 1,
    limit: 3,
    category: 'application-guide',
    excludeSlug: post.slug,
  });

  const category = await service.listCategoryPosts('application-guide', {
    page: 1,
    limit: 9,
    sort: 'newest',
  });
  assert.equal(category.category.postCount, 10);
  assert.equal('content' in category.posts[0], false);

  const search = await service.search({ q: 'بورسیه', page: 1, limit: 9 });
  assert.equal(search.query, 'بورسیه');
  assert.equal('content' in search.posts[0], false);
});

test('blog service maps unpublished or unknown resources to stable 404 errors', async () => {
  const repository = {
    async findPublishedPostBySlug() {
      return null;
    },
    async findPublishedCategory() {
      return null;
    },
    async listPosts() {
      return { posts: [], total: 0 };
    },
  };
  const service = createBlogService(repository);
  await assert.rejects(service.getPost('missing-post'), {
    statusCode: 404,
    code: 'BLOG_POST_NOT_FOUND',
  });
  await assert.rejects(
    service.listCategoryPosts('missing-category', { page: 1, limit: 9, sort: 'newest' }),
    { statusCode: 404, code: 'BLOG_CATEGORY_NOT_FOUND' },
  );
});

test('development seed is realistic, idempotent, insert-only, and production-safe', async () => {
  assert.equal(BLOG_SEED_POSTS.length, 10);
  assert.equal(new Set(BLOG_SEED_POSTS.map(({ slug }) => slug)).size, 10);
  assert.ok(new Set(BLOG_SEED_POSTS.map(({ category }) => category.slug)).size >= 6);
  assert.ok(BLOG_SEED_POSTS.some(({ featured }) => featured));
  await Promise.all(BLOG_SEED_POSTS.map((post) => new Post(post).validate()));

  let calls = 0;
  let previousOperations;
  const postModel = {
    async bulkWrite(operations, options) {
      calls += 1;
      assert.equal(operations.length, BLOG_SEED_POSTS.length);
      assert.deepEqual(options, { ordered: false });
      assert.ok(
        operations.every(
          ({ updateOne }) =>
            updateOne.upsert === true &&
            updateOne.timestamps === false &&
            Object.keys(updateOne.update).join() === '$setOnInsert' &&
            updateOne.filter.slug === updateOne.update.$setOnInsert.slug,
        ),
      );
      for (const { updateOne } of operations) {
        const inserted = updateOne.update.$setOnInsert;
        assert.equal(inserted.publishedAt.getTime() - inserted.createdAt.getTime(), 7 * 86_400_000);
        assert.equal(inserted.publishedAt.getTime() - inserted.updatedAt.getTime(), 86_400_000);
      }
      if (previousOperations) assert.deepEqual(operations, previousOperations);
      previousOperations = structuredClone(operations);
      return { upsertedCount: calls === 1 ? 3 : 0 };
    },
  };

  await assert.rejects(
    seedBlogDevelopmentData({ nodeEnvironment: 'production', postModel }),
    /only be inserted when NODE_ENV=development/,
  );
  assert.equal(calls, 0);
  assert.deepEqual(await seedBlogDevelopmentData({ nodeEnvironment: 'development', postModel }), {
    insertedCount: 3,
    existingCount: 7,
  });
  assert.equal(calls, 1);
  assert.deepEqual(await seedBlogDevelopmentData({ nodeEnvironment: 'development', postModel }), {
    insertedCount: 0,
    existingCount: 10,
  });
  assert.equal(calls, 2);
});

test('blog router validates every input and returns each documented data envelope', async () => {
  const received = {};
  const service = {
    async listPosts(input) {
      received.posts = input;
      return { posts: [], pagination: { page: input.page, limit: input.limit, total: 0 } };
    },
    async getPost(slug) {
      if (slug === 'missing-post') throw blogPostNotFound();
      received.post = slug;
      return { post: { slug, content: '<p>detail</p>' }, relatedPosts: [{ slug: 'related' }] };
    },
    async listCategories() {
      return { categories: [{ name: 'راهنمای اپلای', slug: 'application-guide' }] };
    },
    async listCategoryPosts(slug, input) {
      if (slug === 'missing-category') throw blogCategoryNotFound();
      received.category = { slug, input };
      return {
        category: { name: 'راهنمای اپلای', slug },
        posts: [{ slug: 'application-roadmap' }],
        pagination: { page: input.page, limit: input.limit, total: 1 },
      };
    },
    async search(input) {
      received.search = input;
      return {
        query: input.q,
        posts: [{ slug: 'scholarship-strategy' }],
        pagination: { page: input.page, limit: input.limit, total: 1 },
      };
    },
  };
  const app = express();
  app.use((request, _response, next) => {
    request.id = 'blog-test-request';
    next();
  });
  app.use('/api/v1/blog', createBlogRouter(service));
  app.use(errorHandler);

  await withServer(app, async (origin) => {
    const validResponse = await fetch(
      `${origin}/api/v1/blog/posts?page=2&limit=3&featured=true&sort=oldest`,
    );
    assert.equal(validResponse.status, 200);
    assert.equal(validResponse.headers.get('content-language'), 'fa');
    assert.match(validResponse.headers.get('cache-control'), /stale-while-revalidate/);
    assert.deepEqual(await validResponse.json(), {
      data: { posts: [], pagination: { page: 2, limit: 3, total: 0 } },
    });
    assert.deepEqual(received.posts, { page: 2, limit: 3, featured: true, sort: 'oldest' });

    const detailResponse = await fetch(`${origin}/api/v1/blog/posts/application-roadmap`);
    assert.equal(detailResponse.status, 200);
    assert.deepEqual(await detailResponse.json(), {
      data: {
        post: { slug: 'application-roadmap', content: '<p>detail</p>' },
        relatedPosts: [{ slug: 'related' }],
      },
    });
    assert.equal(received.post, 'application-roadmap');

    const categoriesResponse = await fetch(`${origin}/api/v1/blog/categories`);
    assert.equal(categoriesResponse.status, 200);
    assert.deepEqual(await categoriesResponse.json(), {
      data: { categories: [{ name: 'راهنمای اپلای', slug: 'application-guide' }] },
    });

    const categoryResponse = await fetch(
      `${origin}/api/v1/blog/categories/application-guide/posts?limit=4&sort=oldest`,
    );
    assert.equal(categoryResponse.status, 200);
    assert.deepEqual(await categoryResponse.json(), {
      data: {
        category: { name: 'راهنمای اپلای', slug: 'application-guide' },
        posts: [{ slug: 'application-roadmap' }],
        pagination: { page: 1, limit: 4, total: 1 },
      },
    });
    assert.deepEqual(received.category, {
      slug: 'application-guide',
      input: { page: 1, limit: 4, sort: 'oldest' },
    });

    const searchResponse = await fetch(
      `${origin}/api/v1/blog/search?q=${encodeURIComponent('بورسیه تحصیلی')}&page=3&limit=2`,
    );
    assert.equal(searchResponse.status, 200);
    assert.deepEqual(await searchResponse.json(), {
      data: {
        query: 'بورسیه تحصیلی',
        posts: [{ slug: 'scholarship-strategy' }],
        pagination: { page: 3, limit: 2, total: 1 },
      },
    });
    assert.deepEqual(received.search, { q: 'بورسیه تحصیلی', page: 3, limit: 2 });

    for (const [path, code, message] of [
      [
        '/api/v1/blog/posts/missing-post',
        'BLOG_POST_NOT_FOUND',
        'The requested blog post was not found.',
      ],
      [
        '/api/v1/blog/categories/missing-category/posts',
        'BLOG_CATEGORY_NOT_FOUND',
        'The requested blog category was not found.',
      ],
    ]) {
      const response = await fetch(`${origin}${path}`);
      assert.equal(response.status, 404, path);
      assert.equal(response.headers.get('content-language'), 'fa', path);
      assert.deepEqual(await response.json(), {
        error: { code, message, requestId: 'blog-test-request' },
      });
    }

    const invalidResponse = await fetch(`${origin}/api/v1/blog/posts?limit=100`);
    assert.equal(invalidResponse.status, 400);
    assert.deepEqual(await invalidResponse.json(), {
      error: {
        code: 'BLOG_VALIDATION_ERROR',
        message: 'The blog query is invalid.',
        requestId: 'blog-test-request',
        details: { fields: { limit: 'Too big: expected number to be <=24' } },
      },
    });

    for (const path of [
      '/api/v1/blog/posts/bad_slug',
      '/api/v1/blog/categories/bad_slug/posts',
      '/api/v1/blog/categories/application-guide/posts?featured=true',
      '/api/v1/blog/search?q=x',
      '/api/v1/blog/search?q=valid&unexpected=true',
    ]) {
      const response = await fetch(`${origin}${path}`);
      assert.equal(response.status, 400, path);
      assert.equal((await response.json()).error.code, 'BLOG_VALIDATION_ERROR', path);
    }
  });
});
