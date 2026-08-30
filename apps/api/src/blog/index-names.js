export const BLOG_INDEX_NAMES = Object.freeze({
  postSlug: 'unique_blog_post_slug',
  publishedPosts: 'published_blog_posts',
  categoryPosts: 'published_blog_category_posts',
  postSearch: 'blog_post_search',
});

export const BLOG_INDEX_DEFINITIONS = Object.freeze([
  {
    key: { slug: 1 },
    options: { name: BLOG_INDEX_NAMES.postSlug, unique: true },
  },
  {
    key: { status: 1, publishedAt: -1, _id: -1 },
    options: { name: BLOG_INDEX_NAMES.publishedPosts },
  },
  {
    key: { status: 1, 'category.slug': 1, publishedAt: -1, _id: -1 },
    options: { name: BLOG_INDEX_NAMES.categoryPosts },
  },
  {
    key: { title: 'text', excerpt: 'text', content: 'text', tags: 'text' },
    options: {
      name: BLOG_INDEX_NAMES.postSearch,
      default_language: 'none',
      language_override: 'language',
      textIndexVersion: 3,
      weights: { title: 10, excerpt: 5, tags: 4, content: 1 },
    },
  },
]);
