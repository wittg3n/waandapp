import { localContentRepository } from './local-content-repository';
import type {
  Category,
  CategoryInput,
  CategoryRow,
  Comment,
  CommentListQuery,
  CommentRow,
  CommentStatus,
  ContentMetrics,
  ContentOverview,
  MediaAsset,
  MediaInput,
  MediaRow,
  MediaUsage,
  PageResult,
  Post,
  PostInput,
  PostListQuery,
  PostRevision,
  PostRow,
  PostTransition,
  Tag,
  TagInput,
  TagRow,
} from '../shared/content.types';

export interface ContentRepository {
  getOverview(signal?: AbortSignal): Promise<ContentOverview>;
  getMetrics(signal?: AbortSignal): Promise<ContentMetrics>;
  listPosts(query: PostListQuery, signal?: AbortSignal): Promise<PageResult<PostRow>>;
  getPost(id: string, signal?: AbortSignal): Promise<Post | null>;
  createPost(input: PostInput): Promise<Post>;
  updatePost(id: string, input: PostInput): Promise<Post>;
  transitionPost(
    id: string,
    transition: PostTransition,
    options?: { scheduledAt?: string; adminId?: string },
  ): Promise<Post>;
  duplicatePost(id: string, adminId: string): Promise<Post>;

  listCategories(signal?: AbortSignal): Promise<CategoryRow[]>;
  createCategory(input: CategoryInput): Promise<Category>;
  updateCategory(id: string, input: CategoryInput): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  listTags(signal?: AbortSignal): Promise<TagRow[]>;
  createTag(input: TagInput): Promise<Tag>;
  updateTag(id: string, input: TagInput): Promise<Tag>;
  deleteTag(id: string, detachFromPosts: boolean): Promise<void>;

  listMedia(query?: string, signal?: AbortSignal): Promise<MediaRow[]>;
  addMedia(input: MediaInput): Promise<MediaAsset>;
  updateMedia(id: string, input: Pick<MediaAsset, 'alt' | 'caption'>): Promise<MediaAsset>;
  getMediaUsage(id: string): Promise<MediaUsage[]>;
  deleteMedia(id: string): Promise<void>;

  listComments(
    query: CommentListQuery,
    signal?: AbortSignal,
  ): Promise<PageResult<CommentRow>>;
  moderateComment(id: string, status: CommentStatus, adminId: string): Promise<Comment>;
  deleteComment(id: string): Promise<void>;

  listRevisions(postId: string, signal?: AbortSignal): Promise<PostRevision[]>;
  restoreRevision(postId: string, revisionId: string, adminId: string): Promise<Post>;
}

export class ContentValidationError extends Error {
  readonly fields: Record<string, string>;

  constructor(fields: Record<string, string>) {
    super(Object.values(fields)[0] ?? 'اطلاعات واردشده معتبر نیست.');
    this.fields = fields;
    this.name = 'ContentValidationError';
  }
}

export const contentRepository: ContentRepository = localContentRepository;
