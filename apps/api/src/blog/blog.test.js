import assert from 'node:assert/strict';
import { test } from 'node:test';

Object.assign(process.env, {
  NODE_ENV: 'test',
  PORT: '4000',
  MONGODB_URI: 'mongodb://localhost:27017/waandapp_cms_unit',
  MONGODB_CORE_DATABASE: 'waandapp_cms_unit',
  MONGODB_CMS_DATABASE: 'waandapp_cms_unit_content',
  CMS_MEDIA_ROOT: 'apps/api/storage/cms-unit-test',
  CMS_MEDIA_MAX_BYTES: '10485760',
  CMS_SCHEDULER_INTERVAL_MS: '60000',
  REDIS_URL: 'redis://localhost:6379',
  CORS_ORIGINS: 'http://localhost:3001,http://localhost:3039',
  AUTH_MUTATION_ORIGINS: 'http://localhost:3001',
  ADMIN_DASHBOARD_ORIGIN: 'http://localhost:3039',
  LOG_LEVEL: 'silent',
  RATE_LIMIT_WINDOW_MS: '60000',
  RATE_LIMIT_MAX: '100',
  TRUST_PROXY_HOPS: '0',
  SESSION_SECRET: 'cms-unit-session-secret-000000000000000000000000000000',
  SESSION_COOKIE_NAME: 'waand.sid',
  SESSION_IDLE_TTL_MS: '3600000',
  SESSION_ABSOLUTE_TTL_MS: '86400000',
  ADMIN_SESSION_SECRET: 'cms-unit-admin-session-secret-00000000000000000000000000000',
  ADMIN_SESSION_COOKIE_NAME: 'waand_admin_sid',
  ADMIN_SESSION_IDLE_TTL_MS: '900000',
  ADMIN_SESSION_ABSOLUTE_TTL_MS: '28800000',
  AUTH_CODE_PEPPER: 'cms-unit-code-pepper-0000000000000000000000000000000',
  AUTH_CODE_TTL_MS: '300000',
  AUTH_TRANSACTION_TTL_MS: '900000',
  AUTH_STEP_UP_TTL_MS: '600000',
  AUTH_TERMS_VERSION: '2026-08-22',
  AUTH_ARGON2_MEMORY_KIB: '19456',
  AUTH_ARGON2_TIME_COST: '2',
  AUTH_ARGON2_PARALLELISM: '1',
  AUTH_MAX_VERIFY_ATTEMPTS: '5',
  AUTH_MAX_SENDS_PER_TRANSACTION: '3',
  AUTH_RESEND_COOLDOWN_MS: '60000',
  AUTH_LOGIN_IP_WINDOW_MS: '900000',
  AUTH_LOGIN_IP_LIMIT: '30',
  AUTH_LOGIN_IDENTIFIER_WINDOW_MS: '900000',
  AUTH_LOGIN_IDENTIFIER_LIMIT: '10',
  AUTH_REQUEST_IP_WINDOW_MS: '900000',
  AUTH_REQUEST_IP_LIMIT: '30',
  AUTH_REQUEST_DESTINATION_WINDOW_MS: '3600000',
  AUTH_REQUEST_DESTINATION_LIMIT: '5',
  AUTH_VERIFY_IP_WINDOW_MS: '900000',
  AUTH_VERIFY_IP_LIMIT: '60',
  AUTH_VERIFY_DESTINATION_WINDOW_MS: '900000',
  AUTH_VERIFY_DESTINATION_LIMIT: '10',
  AUTH_DELIVERY_MODE: 'disabled',
});

const [
  { sanitizeCmsHtml, textFromCmsHtml, readingTimeForText },
  { inspectImage },
  { CmsPost },
  { publicPostFilter },
  { parsePostsQuery, parseSearchQuery, parseSlugParams },
  { default: mongoose },
] = await Promise.all([
  import('../cms/content.js'),
  import('../cms/media.js'),
  import('../cms/models.js'),
  import('../cms/public-service.js'),
  import('./validation.js'),
  import('mongoose'),
]);

test('CMS sanitizer removes executable markup and retains editorial structure', () => {
  const sanitized = sanitizeCmsHtml(
    '<h2>راهنما</h2><p onclick="alert(1)">متن امن برای انتشار و بررسی.</p><script>alert(1)</script><a href="javascript:alert(1)">پیوند</a>',
  );
  assert.match(sanitized, /<h2>راهنما<\/h2>/u);
  assert.doesNotMatch(sanitized, /script|onclick|javascript:/iu);
  assert.equal(textFromCmsHtml(sanitized), 'راهنما متن امن برای انتشار و بررسی. پیوند');
  assert.equal(readingTimeForText('یک '.repeat(181)), 2);
});

test('CMS image inspector validates actual signatures and dimensions', () => {
  const png = Buffer.alloc(24);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(png);
  png.writeUInt32BE(1200, 16);
  png.writeUInt32BE(630, 20);
  assert.deepEqual(inspectImage(png, 'image/png'), {
    mimeType: 'image/png',
    width: 1200,
    height: 630,
    extension: 'png',
  });
  assert.throws(() => inspectImage(png, 'image/jpeg'), { code: 'CMS_MEDIA_SIGNATURE' });
  assert.throws(() => inspectImage(Buffer.from('not-an-image'), 'image/png'), {
    code: 'CMS_MEDIA_SIGNATURE',
  });
});

test('CMS post schema carries workflow and real query indexes', () => {
  const statuses = CmsPost.schema.path('status').enumValues;
  assert.deepEqual(statuses, ['DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED']);
  const names = new Set(CmsPost.schema.indexes().map(([, options]) => options.name));
  for (const name of [
    'cms_post_slug',
    'cms_post_public_timeline',
    'cms_post_scheduler',
    'cms_post_category_public',
    'cms_post_tag_public',
    'cms_post_author_public',
    'cms_post_search',
  ]) {
    assert.ok(names.has(name), name);
  }
});

test('public CMS filter cannot expose drafts or future publications', () => {
  const now = new Date('2026-08-31T00:00:00.000Z');
  const filter = publicPostFilter(now);
  mongoose.sanitizeFilter(filter);
  assert.equal(filter.status, 'PUBLISHED');
  assert.deepEqual(Object.keys(filter.publishedAt), ['$lte']);
  assert.equal(filter.publishedAt.$lte, now);
});

test('public blog validation stays bounded and supports Persian slugs', () => {
  assert.deepEqual(parsePostsQuery({ category: 'راهنمای-اپلای', featured: 'true' }), {
    page: 1,
    limit: 9,
    category: 'راهنمای-اپلای',
    featured: true,
    sort: 'newest',
  });
  assert.equal(parseSlugParams({ slug: 'بورسیه-تحصیلی' }).slug, 'بورسیه-تحصیلی');
  assert.equal(parseSearchQuery({ q: '  بورسیه تحصیلی  ' }).q, 'بورسیه تحصیلی');
  assert.throws(() => parsePostsQuery({ limit: '25' }), { code: 'BLOG_VALIDATION_ERROR' });
  assert.throws(() => parsePostsQuery({ unexpected: 'value' }), {
    code: 'BLOG_VALIDATION_ERROR',
  });
});
