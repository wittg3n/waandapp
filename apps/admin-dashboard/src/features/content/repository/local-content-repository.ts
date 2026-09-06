import {
  categoriesSeed,
  commentsSeed,
  historySeed,
  mediaSeed,
  postsSeed,
  revisionsSeed,
  tagsSeed,
} from '../data/content.seed.ts';
import { editorText, normalizeSlug } from '../shared/content-utils.ts';
import type {
  Category,
  CommentListQuery,
  CommentStatus,
  ContentHistoryAction,
  EditorNode,
  MediaAsset,
  MediaUsage,
  PageResult,
  Post,
  PostInput,
  PostRevisionSnapshot,
  PostRow,
  PostTransition,
  Tag,
} from '../shared/content.types.ts';
import { ContentValidationError, type ContentRepository } from './content-repository.ts';

const state = {
  posts: structuredClone(postsSeed),
  categories: structuredClone(categoriesSeed),
  tags: structuredClone(tagsSeed),
  media: structuredClone(mediaSeed),
  comments: structuredClone(commentsSeed),
  revisions: structuredClone(revisionsSeed),
  history: structuredClone(historySeed),
};

let sequence = 10_000;
const now = () => new Date().toISOString();
const nextId = (prefix: string) => `${prefix}-${++sequence}`;
const clone = <T,>(value: T): T => structuredClone(value);

function wait(signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
    const timeout = globalThis.setTimeout(resolve, 90);
    signal?.addEventListener(
      'abort',
      () => {
        globalThis.clearTimeout(timeout);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

function required<T>(value: T | undefined, message: string): T {
  if (!value) throw new Error(message);
  return value;
}

function postById(id: string) {
  return required(
    state.posts.find((item) => item.id === id),
    'نوشته موردنظر پیدا نشد.',
  );
}

function snapshot(post: Pick<Post, keyof Post>): PostRevisionSnapshot {
  return clone({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverMediaId: post.coverMediaId,
    categoryId: post.categoryId,
    tagIds: post.tagIds,
    seo: post.seo,
  });
}

function addHistory(action: ContentHistoryAction, entityId: string, adminId: string) {
  state.history.unshift({ id: nextId('content-event'), action, entityId, adminId, createdAt: now() });
}

function addRevision(post: Post, adminId: string, summary: string) {
  state.revisions.unshift({
    id: nextId('revision'),
    postId: post.id,
    snapshot: snapshot(post),
    createdAt: now(),
    adminId,
    summary,
  });
}

function mediaIdsIn(nodes: EditorNode[] | undefined, result = new Set<string>()) {
  for (const node of nodes ?? []) {
    if (node.type === 'mediaImage' && typeof node.attrs?.mediaId === 'string') {
      result.add(node.attrs.mediaId);
    }
    mediaIdsIn(node.content, result);
  }
  return result;
}

function validateInput(input: PostInput, currentId?: string, publishing = false) {
  const fields: Record<string, string> = {};
  if (input.title.length > 120) fields.title = 'عنوان نباید بیشتر از ۱۲۰ نویسه باشد.';
  if (input.slug.length > 160) fields.slug = 'نامک نباید بیشتر از ۱۶۰ نویسه باشد.';
  if (input.excerpt.length > 300) fields.excerpt = 'خلاصه نباید بیشتر از ۳۰۰ نویسه باشد.';
  if ((input.seo.title?.length ?? 0) > 60)
    fields.seoTitle = 'عنوان سئو نباید بیشتر از ۶۰ نویسه باشد.';
  if ((input.seo.description?.length ?? 0) > 160)
    fields.seoDescription = 'توضیحات سئو نباید بیشتر از ۱۶۰ نویسه باشد.';
  if (input.seo.canonicalUrl) {
    try {
      new URL(input.seo.canonicalUrl);
    } catch {
      fields.canonicalUrl = 'نشانی Canonical معتبر نیست.';
    }
  }
  if (
    input.slug &&
    state.posts.some((post) => post.id !== currentId && post.slug === normalizeSlug(input.slug))
  ) {
    fields.slug = 'این نامک قبلاً برای نوشته دیگری استفاده شده است.';
  }
  if (input.categoryId && !state.categories.some((item) => item.id === input.categoryId))
    fields.categoryId = 'دسته‌بندی انتخاب‌شده معتبر نیست.';
  if (input.tagIds.some((id) => !state.tags.some((item) => item.id === id)))
    fields.tagIds = 'یکی از برچسب‌های انتخاب‌شده معتبر نیست.';
  const referencedMedia = new Set([
    ...mediaIdsIn(input.content.content),
    ...(input.coverMediaId ? [input.coverMediaId] : []),
    ...(input.seo.ogMediaId ? [input.seo.ogMediaId] : []),
  ]);
  if ([...referencedMedia].some((id) => !state.media.some((item) => item.id === id)))
    fields.media = 'یکی از رسانه‌های انتخاب‌شده معتبر نیست.';
  if (publishing) {
    if (!input.title.trim()) fields.title = 'عنوان برای انتشار الزامی است.';
    if (!normalizeSlug(input.slug)) fields.slug = 'نامک برای انتشار الزامی است.';
    if (!input.excerpt.trim()) fields.excerpt = 'خلاصه برای انتشار الزامی است.';
    if (!editorText(input.content)) fields.content = 'متن معنادار برای انتشار الزامی است.';
    if (!input.categoryId) fields.categoryId = 'دسته‌بندی برای انتشار الزامی است.';
    if (!input.authorAdminId) fields.authorAdminId = 'نویسنده برای انتشار در دسترس نیست.';
    if (!input.coverMediaId) fields.coverMediaId = 'تصویر شاخص برای نمایش عمومی نوشته الزامی است.';
  }
  if (Object.keys(fields).length) throw new ContentValidationError(fields);
}

function toPostRow(post: Post): PostRow {
  return {
    ...clone(post),
    category: clone(required(state.categories.find((item) => item.id === post.categoryId), 'دسته‌بندی نوشته پیدا نشد.')),
    tags: clone(state.tags.filter((item) => post.tagIds.includes(item.id))),
    cover: clone(state.media.find((item) => item.id === post.coverMediaId)),
    authorName: post.authorAdminId === 'local-admin' ? 'مدیر محلی' : post.authorAdminId,
  };
}

function paginate<T>(items: T[], page = 1, pageSize = 20): PageResult<T> {
  const safePage = Math.max(1, page);
  const safeSize = [20, 50, 100].includes(pageSize) ? pageSize : 20;
  return {
    items: items.slice((safePage - 1) * safeSize, safePage * safeSize),
    page: safePage,
    pageSize: safeSize,
    total: items.length,
    pageCount: Math.ceil(items.length / safeSize),
  };
}

function mediaUsage(id: string): MediaUsage[] {
  return state.posts.flatMap((post) => {
    const uses: MediaUsage[] = [];
    if (post.coverMediaId === id) uses.push({ postId: post.id, postTitle: post.title, kind: 'COVER' });
    if (post.seo.ogMediaId === id) uses.push({ postId: post.id, postTitle: post.title, kind: 'OG' });
    if (mediaIdsIn(post.content.content).has(id)) uses.push({ postId: post.id, postTitle: post.title, kind: 'BODY' });
    return uses;
  });
}

const transitionStatuses: Record<PostTransition, Post['status'][]> = {
  SUBMIT_REVIEW: ['DRAFT'],
  RETURN_TO_DRAFT: ['IN_REVIEW'],
  PUBLISH_NOW: ['DRAFT', 'IN_REVIEW', 'SCHEDULED'],
  SCHEDULE: ['DRAFT', 'IN_REVIEW', 'SCHEDULED'],
  CANCEL_SCHEDULE: ['SCHEDULED'],
  UNPUBLISH: ['PUBLISHED'],
  ARCHIVE: ['PUBLISHED'],
  RESTORE: ['ARCHIVED'],
};

export const localContentRepository: ContentRepository = {
  async getMetrics(signal) {
    await wait(signal);
    return {
      totalPosts: state.posts.length,
      drafts: state.posts.filter((item) => item.status === 'DRAFT').length,
      inReview: state.posts.filter((item) => item.status === 'IN_REVIEW').length,
      scheduled: state.posts.filter((item) => item.status === 'SCHEDULED').length,
      published: state.posts.filter((item) => item.status === 'PUBLISHED').length,
      pendingComments: state.comments.filter((item) => item.status === 'PENDING').length,
    };
  },

  async getOverview(signal) {
    await wait(signal);
    const rows = state.posts.map(toPostRow);
    const metrics = await this.getMetrics(signal);
    return clone({
      metrics,
      needsReview: rows.filter((item) => item.status === 'IN_REVIEW').slice(0, 5),
      approachingSchedule: rows
        .filter((item) => item.status === 'SCHEDULED')
        .sort((a, b) => (a.scheduledAt ?? '').localeCompare(b.scheduledAt ?? ''))
        .slice(0, 5),
      pendingComments: state.comments
        .filter((item) => item.status === 'PENDING')
        .slice(0, 5)
        .map((item) => ({ ...item, postTitle: postById(item.postId).title })),
      recentlyEdited: [...rows].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6),
      scheduledPosts: rows.filter((item) => item.status === 'SCHEDULED').slice(0, 6),
      history: state.history.slice(0, 8),
    });
  },

  async listPosts(query, signal) {
    await wait(signal);
    let items = state.posts.map(toPostRow);
    const search = query.search?.trim().toLocaleLowerCase('fa-IR');
    if (search)
      items = items.filter((post) =>
        [post.title, post.slug, post.excerpt].join(' ').toLocaleLowerCase('fa-IR').includes(search),
      );
    if (query.status) items = items.filter((post) => post.status === query.status);
    if (query.category) items = items.filter((post) => post.categoryId === query.category);
    if (query.author) items = items.filter((post) => post.authorAdminId === query.author);
    if (query.tag) items = items.filter((post) => post.tagIds.includes(query.tag!));
    const sort = query.sort ?? 'updatedAt';
    const direction = query.order === 'asc' ? 1 : -1;
    items.sort((a, b) => String(a[sort] ?? '').localeCompare(String(b[sort] ?? ''), 'fa') * direction);
    return paginate(items, query.page, query.pageSize);
  },

  async getPost(id, signal) {
    await wait(signal);
    return clone(state.posts.find((item) => item.id === id) ?? null);
  },

  async createPost(input) {
    await wait();
    const normalized = { ...clone(input), slug: normalizeSlug(input.slug) };
    validateInput(normalized);
    const timestamp = now();
    const post: Post = {
      ...normalized,
      id: nextId('post'),
      status: 'DRAFT',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    state.posts.unshift(post);
    addHistory('POST_CREATED', post.id, input.lastEditedByAdminId);
    return clone(post);
  },

  async updatePost(id, input) {
    await wait();
    const post = postById(id);
    const normalized = { ...clone(input), slug: normalizeSlug(input.slug) };
    validateInput(normalized, id, post.status === 'PUBLISHED' || post.status === 'SCHEDULED');
    const before = snapshot(post);
    const after = snapshot({ ...post, ...normalized });
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      addRevision(post, input.lastEditedByAdminId, 'نسخه پیش از ویرایش ذخیره شد');
      Object.assign(post, normalized, { updatedAt: now() });
      addHistory('POST_UPDATED', id, input.lastEditedByAdminId);
    }
    return clone(post);
  },

  async transitionPost(id, transition, options = {}) {
    await wait();
    const post = postById(id);
    if (!transitionStatuses[transition].includes(post.status))
      throw new Error('این تغییر وضعیت برای نوشته در وضعیت فعلی مجاز نیست.');
    const adminId = options.adminId ?? post.lastEditedByAdminId;
    if (transition === 'PUBLISH_NOW' || transition === 'SCHEDULE') {
      validateInput(
        {
          ...snapshot(post),
          authorAdminId: post.authorAdminId,
          scheduledAt: options.scheduledAt ?? post.scheduledAt,
          lastEditedByAdminId: adminId,
        },
        id,
        true,
      );
    }
    if (transition === 'SCHEDULE') {
      const scheduledAt = options.scheduledAt ?? post.scheduledAt;
      if (!scheduledAt || new Date(scheduledAt).getTime() <= Date.now())
        throw new ContentValidationError({ scheduledAt: 'زمان انتشار باید در آینده باشد.' });
      post.status = 'SCHEDULED';
      post.scheduledAt = scheduledAt;
      post.publishedAt = undefined;
      post.archivedAt = undefined;
      addHistory('POST_SCHEDULED', id, adminId);
    } else if (transition === 'PUBLISH_NOW') {
      post.status = 'PUBLISHED';
      post.publishedAt = now();
      post.scheduledAt = undefined;
      post.archivedAt = undefined;
      addHistory('POST_PUBLISHED', id, adminId);
    } else if (transition === 'SUBMIT_REVIEW') {
      post.status = 'IN_REVIEW';
      addHistory('POST_SUBMITTED_FOR_REVIEW', id, adminId);
    } else if (transition === 'ARCHIVE') {
      post.status = 'ARCHIVED';
      post.archivedAt = now();
      addHistory('POST_ARCHIVED', id, adminId);
    } else {
      post.status = 'DRAFT';
      post.scheduledAt = undefined;
      post.publishedAt = undefined;
      post.archivedAt = undefined;
      if (transition === 'UNPUBLISH') addHistory('POST_UNPUBLISHED', id, adminId);
    }
    post.updatedAt = now();
    post.lastEditedByAdminId = adminId;
    return clone(post);
  },

  async duplicatePost(id, adminId) {
    await wait();
    const source = postById(id);
    let slug = normalizeSlug(`${source.slug}-copy`);
    let suffix = 2;
    while (state.posts.some((item) => item.slug === slug)) slug = normalizeSlug(`${source.slug}-copy-${suffix++}`);
    return this.createPost({
      ...snapshot(source),
      title: `${source.title} — کپی`,
      slug,
      seo: { ...source.seo, canonicalUrl: undefined, noIndex: true },
      authorAdminId: adminId,
      lastEditedByAdminId: adminId,
    });
  },

  async listCategories(signal) {
    await wait(signal);
    return clone(
      state.categories
        .map((category) => ({
          ...category,
          postCount: state.posts.filter((post) => post.categoryId === category.id).length,
        }))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    );
  },

  async createCategory(input) {
    await wait();
    const name = input.name.trim();
    const slug = normalizeSlug(input.slug);
    const fields: Record<string, string> = {};
    if (!name) fields.name = 'نام دسته‌بندی الزامی است.';
    if (!slug) fields.slug = 'نامک دسته‌بندی الزامی است.';
    if (state.categories.some((item) => item.name === name))
      fields.name = 'دسته‌بندی دیگری با این نام وجود دارد.';
    if (state.categories.some((item) => item.slug === slug))
      fields.slug = 'دسته‌بندی دیگری با این نامک وجود دارد.';
    if (Object.keys(fields).length) throw new ContentValidationError(fields);
    const timestamp = now();
    const category: Category = {
      id: nextId('category'),
      name,
      slug,
      description: input.description?.trim() || undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    state.categories.unshift(category);
    return clone(category);
  },

  async updateCategory(id, input) {
    await wait();
    const category = required(state.categories.find((item) => item.id === id), 'دسته‌بندی پیدا نشد.');
    const name = input.name.trim();
    const slug = normalizeSlug(input.slug);
    const fields: Record<string, string> = {};
    if (!name) fields.name = 'نام دسته‌بندی الزامی است.';
    if (!slug) fields.slug = 'نامک دسته‌بندی الزامی است.';
    if (state.categories.some((item) => item.id !== id && item.name === name))
      fields.name = 'دسته‌بندی دیگری با این نام وجود دارد.';
    if (state.categories.some((item) => item.id !== id && item.slug === slug))
      fields.slug = 'دسته‌بندی دیگری با این نامک وجود دارد.';
    if (Object.keys(fields).length) throw new ContentValidationError(fields);
    Object.assign(category, {
      name,
      slug,
      description: input.description?.trim() || undefined,
      updatedAt: now(),
    });
    return clone(category);
  },

  async deleteCategory(id) {
    await wait();
    const count = state.posts.filter((post) => post.categoryId === id).length;
    if (count) throw new Error(`این دسته‌بندی در ${count.toLocaleString('fa-IR')} نوشته استفاده شده است.`);
    const index = state.categories.findIndex((item) => item.id === id);
    if (index < 0) throw new Error('دسته‌بندی پیدا نشد.');
    state.categories.splice(index, 1);
  },

  async listTags(signal) {
    await wait(signal);
    return clone(
      state.tags
        .map((tag) => ({ ...tag, postCount: state.posts.filter((post) => post.tagIds.includes(tag.id)).length }))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    );
  },

  async createTag(input) {
    await wait();
    const name = input.name.trim();
    const slug = normalizeSlug(input.slug);
    const fields: Record<string, string> = {};
    if (!name) fields.name = 'نام برچسب الزامی است.';
    if (!slug) fields.slug = 'نامک برچسب الزامی است.';
    if (state.tags.some((item) => item.name === name)) fields.name = 'برچسب دیگری با این نام وجود دارد.';
    if (state.tags.some((item) => item.slug === slug)) fields.slug = 'برچسب دیگری با این نامک وجود دارد.';
    if (Object.keys(fields).length) throw new ContentValidationError(fields);
    const timestamp = now();
    const tag: Tag = { id: nextId('tag'), name, slug, createdAt: timestamp, updatedAt: timestamp };
    state.tags.unshift(tag);
    return clone(tag);
  },

  async updateTag(id, input) {
    await wait();
    const tag = required(state.tags.find((item) => item.id === id), 'برچسب پیدا نشد.');
    const name = input.name.trim();
    const slug = normalizeSlug(input.slug);
    const fields: Record<string, string> = {};
    if (!name) fields.name = 'نام برچسب الزامی است.';
    if (!slug) fields.slug = 'نامک برچسب الزامی است.';
    if (state.tags.some((item) => item.id !== id && item.name === name)) fields.name = 'برچسب دیگری با این نام وجود دارد.';
    if (state.tags.some((item) => item.id !== id && item.slug === slug)) fields.slug = 'برچسب دیگری با این نامک وجود دارد.';
    if (Object.keys(fields).length) throw new ContentValidationError(fields);
    Object.assign(tag, { name, slug, updatedAt: now() });
    return clone(tag);
  },

  async deleteTag(id, detachFromPosts) {
    await wait();
    const usedBy = state.posts.filter((post) => post.tagIds.includes(id));
    if (usedBy.length && !detachFromPosts)
      throw new Error(`این برچسب در ${usedBy.length.toLocaleString('fa-IR')} نوشته استفاده شده است.`);
    usedBy.forEach((post) => {
      post.tagIds = post.tagIds.filter((tagId) => tagId !== id);
      post.updatedAt = now();
    });
    const index = state.tags.findIndex((item) => item.id === id);
    if (index < 0) throw new Error('برچسب پیدا نشد.');
    state.tags.splice(index, 1);
  },

  async listMedia(query = '', signal) {
    await wait(signal);
    const search = query.trim().toLocaleLowerCase('fa-IR');
    return clone(
      state.media
        .filter((item) =>
          !search || [item.filename, item.alt, item.caption].join(' ').toLocaleLowerCase('fa-IR').includes(search),
        )
        .map((item) => ({ ...item, usageCount: mediaUsage(item.id).length }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async addMedia(input) {
    await wait();
    const supported = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    const fields: Record<string, string> = {};
    if (!supported.includes(input.mimeType)) fields.mimeType = 'فرمت تصویر پشتیبانی نمی‌شود.';
    if (input.size > 10 * 1_024 * 1_024) fields.size = 'حجم تصویر نباید بیشتر از ۱۰ مگابایت باشد.';
    if (!input.width || !input.height) fields.dimensions = 'ابعاد تصویر معتبر نیست.';
    if (Object.keys(fields).length) throw new ContentValidationError(fields);
    const timestamp = now();
    const asset: MediaAsset = { ...clone(input), id: nextId('media'), type: 'IMAGE', createdAt: timestamp, updatedAt: timestamp };
    state.media.unshift(asset);
    return clone(asset);
  },

  async updateMedia(id, input) {
    await wait();
    const asset = required(state.media.find((item) => item.id === id), 'رسانه پیدا نشد.');
    asset.alt = input.alt.trim();
    asset.caption = input.caption?.trim() || undefined;
    asset.updatedAt = now();
    addHistory('MEDIA_UPDATED', id, asset.uploadedByAdminId);
    return clone(asset);
  },

  async getMediaUsage(id) {
    await wait();
    return clone(mediaUsage(id));
  },

  async deleteMedia(id) {
    await wait();
    const usage = mediaUsage(id);
    if (usage.length) throw new Error(`این تصویر در ${usage.length.toLocaleString('fa-IR')} بخش نوشته استفاده شده است.`);
    const index = state.media.findIndex((item) => item.id === id);
    if (index < 0) throw new Error('رسانه پیدا نشد.');
    const [removed] = state.media.splice(index, 1);
    if (removed?.url.startsWith('blob:')) URL.revokeObjectURL(removed.url);
  },

  async listComments(query: CommentListQuery, signal) {
    await wait(signal);
    let items = state.comments.map((comment) => ({ ...clone(comment), postTitle: postById(comment.postId).title }));
    const search = query.search?.trim().toLocaleLowerCase('fa-IR');
    if (search)
      items = items.filter((comment) =>
        [comment.body, comment.guestName, comment.guestEmail].join(' ').toLocaleLowerCase('fa-IR').includes(search),
      );
    if (query.status) items = items.filter((comment) => comment.status === query.status);
    if (query.post) items = items.filter((comment) => comment.postId === query.post);
    if (query.date) items = items.filter((comment) => comment.createdAt.startsWith(query.date!));
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return paginate(items, query.page, query.pageSize);
  },

  async moderateComment(id, status: CommentStatus, adminId) {
    await wait();
    const comment = required(state.comments.find((item) => item.id === id), 'دیدگاه پیدا نشد.');
    const allowed: Record<CommentStatus, CommentStatus[]> = {
      PENDING: ['APPROVED', 'SPAM', 'TRASHED'],
      APPROVED: ['SPAM', 'TRASHED'],
      SPAM: ['APPROVED', 'TRASHED'],
      TRASHED: ['APPROVED'],
    };
    if (!allowed[comment.status].includes(status)) throw new Error('این اقدام برای دیدگاه مجاز نیست.');
    comment.status = status;
    comment.updatedAt = now();
    addHistory(status === 'APPROVED' ? 'COMMENT_APPROVED' : status === 'SPAM' ? 'COMMENT_MARKED_SPAM' : 'COMMENT_TRASHED', id, adminId);
    return clone(comment);
  },

  async deleteComment(id) {
    await wait();
    const index = state.comments.findIndex((item) => item.id === id);
    if (index < 0) throw new Error('دیدگاه پیدا نشد.');
    if (state.comments[index]!.status !== 'TRASHED') throw new Error('فقط دیدگاه زباله‌دان قابل حذف دائمی است.');
    state.comments.splice(index, 1);
  },

  async listRevisions(postId, signal) {
    await wait(signal);
    return clone(state.revisions.filter((item) => item.postId === postId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },

  async restoreRevision(postId, revisionId, adminId) {
    await wait();
    const post = postById(postId);
    const revision = required(
      state.revisions.find((item) => item.id === revisionId && item.postId === postId),
      'نسخه موردنظر پیدا نشد.',
    );
    validateInput(
      { ...clone(revision.snapshot), authorAdminId: post.authorAdminId, lastEditedByAdminId: adminId },
      postId,
    );
    Object.assign(post, clone(revision.snapshot), { updatedAt: now(), lastEditedByAdminId: adminId });
    addRevision(post, adminId, 'نسخه بازیابی‌شده به‌عنوان نسخه جاری ذخیره شد');
    addHistory('POST_REVISION_RESTORED', postId, adminId);
    return clone(post);
  },
};

export function validateContentGraph() {
  const categoryIds = new Set(state.categories.map((item) => item.id));
  const tagIds = new Set(state.tags.map((item) => item.id));
  const mediaIds = new Set(state.media.map((item) => item.id));
  const postIds = new Set(state.posts.map((item) => item.id));
  return {
    postsValid: state.posts.every(
      (post) =>
        categoryIds.has(post.categoryId) &&
        post.tagIds.every((id) => tagIds.has(id)) &&
        (!post.coverMediaId || mediaIds.has(post.coverMediaId)) &&
        (!post.seo.ogMediaId || mediaIds.has(post.seo.ogMediaId)) &&
        [...mediaIdsIn(post.content.content)].every((id) => mediaIds.has(id)),
    ),
    commentsValid: state.comments.every((comment) => postIds.has(comment.postId)),
    revisionsValid: state.revisions.every((revision) => postIds.has(revision.postId)),
    uniqueSlugs: new Set(state.posts.map((post) => post.slug)).size === state.posts.length,
    counts: {
      posts: state.posts.length,
      categories: state.categories.length,
      tags: state.tags.length,
      media: state.media.length,
      comments: state.comments.length,
      revisions: state.revisions.length,
    },
  };
}
