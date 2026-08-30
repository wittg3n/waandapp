import 'server-only';

const publicApiUrl = process.env.BLOG_API_URL ?? process.env.NEXT_PUBLIC_API_URL;

if (!publicApiUrl) {
  throw new Error('BLOG_API_URL or NEXT_PUBLIC_API_URL is required.');
}

const blogApiUrl = `${publicApiUrl.replace(/\/$/u, '')}/blog`;

export interface BlogCategory {
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
}

export interface BlogAuthor {
  name: string;
  role: string | null;
}

export interface BlogSeo {
  title: string | null;
  description: string | null;
  canonical: string | null;
  ogImage: string | null;
}

export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: BlogCategory;
  tags: string[];
  author: BlogAuthor;
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
  featured?: boolean;
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
    if (value !== undefined) {
      url.searchParams.set(name, `${value}`);
    }
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

export function getPosts(query: PostsQuery = {}) {
  return fetchData<PostArchive>('/posts', query);
}

export async function getPost(slug: string) {
  try {
    return await fetchData<PostDetail>(`/posts/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error instanceof BlogApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export function getCategories() {
  return fetchData<{ categories: BlogCategory[] }>('/categories').then(
    ({ categories }) => categories,
  );
}

export async function getCategoryPosts(slug: string, page = 1) {
  try {
    return await fetchData<CategoryArchive>(`/categories/${encodeURIComponent(slug)}/posts`, {
      page,
      limit: 9,
    });
  } catch (error) {
    if (error instanceof BlogApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export function searchPosts(query: string, page = 1) {
  return fetchData<SearchArchive>('/search', { q: query, page, limit: 9 });
}
