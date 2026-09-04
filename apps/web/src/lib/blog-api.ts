import 'server-only';

const serverApiUrl = process.env.BLOG_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? serverApiUrl;

if (!serverApiUrl || !publicApiUrl) {
  throw new Error('BLOG_API_URL or NEXT_PUBLIC_API_URL is required.');
}

const blogApiUrl = `${serverApiUrl.replace(/\/$/u, '')}/blog`;
const publicApiOrigin = new URL(publicApiUrl).origin;

export interface BlogCategory {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
}

export interface BlogTag extends BlogCategory {}

export interface BlogAuthor {
  id?: string;
  name: string;
  slug: string;
  role: string | null;
  bio: string;
  avatar?: string | null;
  postCount?: number;
}

export interface BlogSeo {
  title: string | null;
  description: string | null;
  canonical: string | null;
  noIndex: boolean;
  ogImage: string | null;
}

export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  category: BlogCategory | null;
  tags: string[];
  tagDetails: BlogTag[];
  author: BlogAuthor | null;
  featured: boolean;
  readingTime: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  seo: BlogSeo;
}

export interface BlogPost extends BlogPostSummary {
  content: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PostArchive {
  posts: BlogPostSummary[];
  pagination: Pagination;
}

interface DataEnvelope<T> {
  data: T;
}

interface CategoryArchive extends PostArchive {
  category: BlogCategory;
}

interface TagArchive extends PostArchive {
  tag: BlogTag;
}

interface AuthorArchive extends PostArchive {
  author: BlogAuthor;
}

interface SearchArchive extends PostArchive {
  query: string;
}

interface PostDetail {
  post: BlogPost;
  relatedPosts: BlogPostSummary[];
}

interface PostsQuery {
  [key: string]: string | number | boolean | undefined;
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  author?: string;
  featured?: boolean;
  sort?: 'newest' | 'oldest';
}

export class BlogApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'BlogApiError';
  }
}

function endpoint(path: string, query?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(`${blogApiUrl}${path}`);

  for (const [name, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(name, `${value}`);
  }

  return url;
}

async function fetchData<T>(
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
) {
  let response: Response;

  try {
    response = await fetch(endpoint(path, query), {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new BlogApiError('ارتباط با سرویس وبلاگ برقرار نشد.');
  }

  if (!response.ok) {
    throw new BlogApiError('دریافت اطلاعات وبلاگ با خطا روبه‌رو شد.', response.status);
  }

  const payload = (await response.json()) as DataEnvelope<T>;
  return payload.data;
}

async function nullableArchive<T>(path: string, page: number) {
  try {
    return await fetchData<T>(path, { page, limit: 9 });
  } catch (error) {
    if (error instanceof BlogApiError && error.status === 404) return null;
    throw error;
  }
}

export function blogMediaUrl(path: string | null | undefined) {
  return path ? new URL(path, publicApiOrigin).toString() : null;
}

export function getPosts(query: PostsQuery = {}) {
  return fetchData<PostArchive>('/posts', query);
}

export async function getAllPublishedPosts() {
  const first = await getPosts({ page: 1, limit: 24 });
  if (first.pagination.totalPages <= 1) return first.posts;

  const pages = await Promise.all(
    Array.from({ length: first.pagination.totalPages - 1 }, (_, index) =>
      getPosts({ page: index + 2, limit: 24 }),
    ),
  );
  return [first, ...pages].flatMap((archive) => archive.posts);
}

export async function getPost(slug: string) {
  try {
    return await fetchData<PostDetail>(`/posts/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof BlogApiError && error.status === 404) return null;
    throw error;
  }
}

export function getCategories() {
  return fetchData<{ categories: BlogCategory[] }>('/categories').then(
    ({ categories }) => categories,
  );
}

export function getTags() {
  return fetchData<{ tags: BlogTag[] }>('/tags').then(({ tags }) => tags);
}

export function getCategoryPosts(slug: string, page = 1) {
  return nullableArchive<CategoryArchive>(
    `/categories/${encodeURIComponent(slug)}/posts`,
    page,
  );
}

export function getTagPosts(slug: string, page = 1) {
  return nullableArchive<TagArchive>(`/tags/${encodeURIComponent(slug)}/posts`, page);
}

export function getAuthorPosts(slug: string, page = 1) {
  return nullableArchive<AuthorArchive>(
    `/authors/${encodeURIComponent(slug)}/posts`,
    page,
  );
}

export function searchPosts(query: string, page = 1) {
  return fetchData<SearchArchive>('/search', { q: query, page, limit: 9 });
}
