import { ArticleCard } from '@/components/posts/article-card';
import type { BlogPostSummary } from '@/lib/blog-api';

export function ArticleGrid({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <ArticleCard key={post.id} post={post} />
      ))}
    </div>
  );
}
