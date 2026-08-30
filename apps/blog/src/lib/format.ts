import type { BlogPostSummary } from '@/lib/blog-api';

const persianDate = new Intl.DateTimeFormat('fa-IR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatPublishedDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : persianDate.format(date);
}

export function readingMinutes(post: Pick<BlogPostSummary, 'readingTime'>) {
  return Math.max(1, Math.ceil(post.readingTime));
}

export function coverImage(post: Pick<BlogPostSummary, 'coverImage'>) {
  return post.coverImage.startsWith('/covers/')
    ? post.coverImage
    : '/covers/application-roadmap.svg';
}
