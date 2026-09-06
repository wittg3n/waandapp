export type PostStatus = 'DRAFT' | 'IN_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export type CommentStatus = 'PENDING' | 'APPROVED' | 'SPAM' | 'TRASHED';
export type PostTransition =
  | 'SUBMIT_REVIEW'
  | 'RETURN_TO_DRAFT'
  | 'PUBLISH_NOW'
  | 'SCHEDULE'
  | 'CANCEL_SCHEDULE'
  | 'UNPUBLISH'
  | 'ARCHIVE'
  | 'RESTORE';

export interface EditorMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface EditorNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: EditorNode[];
  marks?: EditorMark[];
  text?: string;
}

export interface EditorDocument extends EditorNode {
  type: 'doc';
  content: EditorNode[];
}

export interface PostSeo {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogMediaId?: string;
  noIndex: boolean;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: EditorDocument;
  coverMediaId?: string;
  categoryId: string;
  tagIds: string[];
  authorAdminId: string;
  status: PostStatus;
  seo: PostSeo;
  scheduledAt?: string;
  publishedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
  lastEditedByAdminId: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  type: 'IMAGE';
  filename: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';
  size: number;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  uploadedByAdminId: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorUserId?: string;
  guestName?: string;
  guestEmail?: string;
  body: string;
  status: CommentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PostRevisionSnapshot {
  title: string;
  slug: string;
  excerpt: string;
  content: EditorDocument;
  coverMediaId?: string;
  categoryId: string;
  tagIds: string[];
  seo: PostSeo;
}

export interface PostRevision {
  id: string;
  postId: string;
  snapshot: PostRevisionSnapshot;
  createdAt: string;
  adminId: string;
  summary?: string;
}

export type ContentHistoryAction =
  | 'POST_CREATED'
  | 'POST_UPDATED'
  | 'POST_SUBMITTED_FOR_REVIEW'
  | 'POST_PUBLISHED'
  | 'POST_SCHEDULED'
  | 'POST_UNPUBLISHED'
  | 'POST_ARCHIVED'
  | 'POST_REVISION_RESTORED'
  | 'COMMENT_APPROVED'
  | 'COMMENT_MARKED_SPAM'
  | 'COMMENT_TRASHED'
  | 'MEDIA_UPDATED';

export interface ContentHistoryEvent {
  id: string;
  action: ContentHistoryAction;
  entityId: string;
  createdAt: string;
  adminId: string;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

export interface PostRow extends Post {
  category: Category;
  tags: Tag[];
  cover?: MediaAsset;
  authorName: string;
}

export interface CommentRow extends Comment {
  postTitle: string;
}

export interface CategoryRow extends Category {
  postCount: number;
}

export interface TagRow extends Tag {
  postCount: number;
}

export interface MediaRow extends MediaAsset {
  usageCount: number;
}

export interface MediaUsage {
  postId: string;
  postTitle: string;
  kind: 'COVER' | 'BODY' | 'OG';
}

export interface ContentMetrics {
  totalPosts: number;
  drafts: number;
  inReview: number;
  scheduled: number;
  published: number;
  pendingComments: number;
}

export interface ContentOverview {
  metrics: ContentMetrics;
  needsReview: PostRow[];
  approachingSchedule: PostRow[];
  pendingComments: CommentRow[];
  recentlyEdited: PostRow[];
  scheduledPosts: PostRow[];
  history: ContentHistoryEvent[];
}

export interface PostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: EditorDocument;
  coverMediaId?: string;
  categoryId: string;
  tagIds: string[];
  authorAdminId: string;
  seo: PostSeo;
  scheduledAt?: string;
  lastEditedByAdminId: string;
}

export interface CategoryInput {
  name: string;
  slug: string;
  description?: string;
}

export interface TagInput {
  name: string;
  slug: string;
}

export interface MediaInput {
  filename: string;
  mimeType: MediaAsset['mimeType'];
  size: number;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  url: string;
  uploadedByAdminId: string;
}

export interface PostListQuery {
  search?: string;
  status?: PostStatus;
  category?: string;
  author?: string;
  tag?: string;
  sort?: 'updatedAt' | 'createdAt' | 'publishedAt' | 'title';
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: 20 | 50 | 100;
}

export interface CommentListQuery {
  search?: string;
  status?: CommentStatus;
  post?: string;
  date?: string;
  page?: number;
  pageSize?: 20 | 50 | 100;
}

export const CONTENT_PERMISSIONS = {
  read: 'content.read',
  create: 'content.posts.create',
  update: 'content.posts.update',
  publish: 'content.posts.publish',
  archive: 'content.posts.archive',
  categoriesManage: 'content.categories.manage',
  tagsManage: 'content.tags.manage',
  mediaManage: 'content.media.manage',
  mediaUpload: 'content.media.manage',
  mediaDelete: 'content.media.manage',
  commentsModerate: 'content.comments.moderate',
} as const;

export const EMPTY_DOCUMENT: EditorDocument = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [] }],
};
