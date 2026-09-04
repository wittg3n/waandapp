import mongoose from 'mongoose';

import { recordAdminAudit } from '../admin/audit.js';
import { ApiError } from '../middleware/errors.js';
import { readingTimeForText, sanitizeCmsHtml, textFromCmsHtml } from './content.js';
import {
  CmsAuthor,
  CmsCategory,
  CmsMedia,
  CmsPost,
  CmsRevision,
  CmsTag,
} from './models.js';
import { serializeCmsPost } from './serializers.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
}

function duplicate(error) {
  if (error?.code === 11000) {
    throw new ApiError(409, 'CMS_SLUG_EXISTS', 'The selected slug is already in use.');
  }
  throw error;
}

async function postOr404(postId) {
  const post = await CmsPost.findById(postId);
  if (!post) throw new ApiError(404, 'CMS_POST_NOT_FOUND', 'Post not found.');
  return post;
}

async function referencesExist({ categoryIds, tagIds, authorId, coverMediaId, seo }) {
  const mediaIds = [coverMediaId, seo?.ogMediaId].filter(Boolean);
  const [categoryCount, tagCount, author, mediaCount] = await Promise.all([
    CmsCategory.countDocuments({ _id: mongoose.trusted({ $in: categoryIds }) }),
    CmsTag.countDocuments({ _id: mongoose.trusted({ $in: tagIds }) }),
    CmsAuthor.exists({ _id: authorId }),
    mediaIds.length
      ? CmsMedia.countDocuments({ _id: mongoose.trusted({ $in: mediaIds }) })
      : Promise.resolve(0),
  ]);
  if (categoryCount !== categoryIds.length) {
    throw new ApiError(400, 'CMS_CATEGORY_REFERENCE', 'One or more categories do not exist.');
  }
  if (tagCount !== tagIds.length) {
    throw new ApiError(400, 'CMS_TAG_REFERENCE', 'One or more tags do not exist.');
  }
  if (!author) throw new ApiError(400, 'CMS_AUTHOR_REFERENCE', 'The author does not exist.');
  if (mediaCount !== new Set(mediaIds.map(String)).size) {
    throw new ApiError(400, 'CMS_MEDIA_REFERENCE', 'One or more media items do not exist.');
  }
}

export function cmsPostSnapshot(post) {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    contentHtml: post.contentHtml,
    contentText: post.contentText,
    coverMediaId: post.coverMediaId,
    categoryIds: [...post.categoryIds],
    tagIds: [...post.tagIds],
    authorId: post.authorId,
    status: post.status,
    featured: post.featured,
    readingTime: post.readingTime,
    scheduledAt: post.scheduledAt,
    publishedAt: post.publishedAt,
    archivedAt: post.archivedAt,
    seo: post.seo?.toObject ? post.seo.toObject() : post.seo,
  };
}

async function saveRevision(post, actorUserId, reason) {
  post.revisionNumber += 1;
  await post.save();
  await CmsRevision.create({
    postId: post._id,
    number: post.revisionNumber,
    snapshot: cmsPostSnapshot(post),
    reason,
    actorUserId: String(actorUserId),
  });
}

function applyPostInput(post, input) {
  for (const field of [
    'title',
    'slug',
    'excerpt',
    'coverMediaId',
    'categoryIds',
    'tagIds',
    'authorId',
    'featured',
    'seo',
  ]) {
    if (Object.hasOwn(input, field)) post[field] = input[field];
  }
  if (Object.hasOwn(input, 'contentHtml')) {
    const contentHtml = sanitizeCmsHtml(input.contentHtml);
    const contentText = textFromCmsHtml(contentHtml);
    if (contentText.length < 20) {
      throw new ApiError(400, 'CMS_CONTENT_EMPTY', 'Post content is too short after sanitization.');
    }
    post.contentHtml = contentHtml;
    post.contentText = contentText;
    post.readingTime = readingTimeForText(contentText);
  }
}

export async function listCmsPosts(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.authorId) filter.authorId = query.authorId;
  if (query.categoryId) filter.categoryIds = query.categoryId;
  if (query.tagId) filter.tagIds = query.tagId;
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i');
    filter.$or = [{ title: pattern }, { slug: pattern }, { excerpt: pattern }];
  }
  const skip = (query.page - 1) * query.pageSize;
  const [items, total] = await Promise.all([
    CmsPost.find(filter)
      .select({ contentHtml: 0, contentText: 0 })
      .sort({ updatedAt: -1, _id: -1 })
      .skip(skip)
      .limit(query.pageSize)
      .lean(),
    CmsPost.countDocuments(filter),
  ]);
  return {
    items: items.map((item) => serializeCmsPost(item, { includeContent: false })),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      pageCount: Math.ceil(total / query.pageSize),
    },
  };
}

export async function getCmsPost(postId) {
  return serializeCmsPost(await postOr404(postId));
}

export async function createCmsPost({ request, input }) {
  const actorUserId = String(request.adminAuth.user._id);
  const sanitized = sanitizeCmsHtml(input.contentHtml);
  const contentText = textFromCmsHtml(sanitized);
  if (contentText.length < 20) {
    throw new ApiError(400, 'CMS_CONTENT_EMPTY', 'Post content is too short after sanitization.');
  }
  await referencesExist(input);

  const post = new CmsPost({
    ...input,
    contentHtml: sanitized,
    contentText,
    readingTime: readingTimeForText(contentText),
    status: 'DRAFT',
    createdByUserId: actorUserId,
    updatedByUserId: actorUserId,
  });
  try {
    await saveRevision(post, actorUserId, 'Initial draft');
  } catch (error) {
    duplicate(error);
  }
  await recordAdminAudit({
    request,
    action: 'CMS_POST_CREATED',
    resourceType: 'CMS_POST',
    resourceId: post._id,
    after: { title: post.title, slug: post.slug, status: post.status },
    reason: 'Initial draft',
  });
  return serializeCmsPost(post);
}

export async function updateCmsPost({ request, postId, input }) {
  const post = await postOr404(postId);
  if (post.status === 'ARCHIVED') {
    throw new ApiError(409, 'CMS_POST_ARCHIVED', 'Restore the post before editing it.');
  }
  const merged = {
    categoryIds: input.categoryIds ?? post.categoryIds.map(String),
    tagIds: input.tagIds ?? post.tagIds.map(String),
    authorId: input.authorId ?? String(post.authorId),
    coverMediaId: Object.hasOwn(input, 'coverMediaId') ? input.coverMediaId : post.coverMediaId,
    seo: input.seo ?? post.seo,
  };
  await referencesExist(merged);
  const before = { title: post.title, slug: post.slug, status: post.status };
  applyPostInput(post, input);
  post.updatedByUserId = String(request.adminAuth.user._id);
  try {
    await saveRevision(post, request.adminAuth.user._id, input.reason);
  } catch (error) {
    duplicate(error);
  }
  await recordAdminAudit({
    request,
    action: 'CMS_POST_UPDATED',
    resourceType: 'CMS_POST',
    resourceId: post._id,
    before,
    after: { title: post.title, slug: post.slug, status: post.status },
    reason: input.reason,
  });
  return serializeCmsPost(post);
}

async function transition({ request, postId, from, to, reason, scheduledAt = null }) {
  const post = await postOr404(postId);
  if (!from.includes(post.status)) {
    throw new ApiError(409, 'CMS_WORKFLOW_STATE', 'This workflow transition is not allowed from the current state.');
  }
  const before = { status: post.status, scheduledAt: post.scheduledAt, publishedAt: post.publishedAt };
  post.status = to;
  post.updatedByUserId = String(request.adminAuth.user._id);
  post.scheduledAt = to === 'SCHEDULED' ? scheduledAt : null;
  post.publishedAt = to === 'PUBLISHED' ? new Date() : post.publishedAt;
  post.archivedAt = to === 'ARCHIVED' ? new Date() : null;
  await saveRevision(post, request.adminAuth.user._id, reason);
  await recordAdminAudit({
    request,
    action: 'CMS_POST_' + to,
    resourceType: 'CMS_POST',
    resourceId: post._id,
    before,
    after: { status: post.status, scheduledAt: post.scheduledAt, publishedAt: post.publishedAt },
    reason,
  });
  return serializeCmsPost(post);
}

export const submitCmsPost = (input) =>
  transition({ ...input, from: ['DRAFT'], to: 'IN_REVIEW' });
export const publishCmsPost = (input) =>
  transition({ ...input, from: ['IN_REVIEW', 'SCHEDULED'], to: 'PUBLISHED' });
export const scheduleCmsPost = (input) =>
  transition({ ...input, from: ['DRAFT', 'IN_REVIEW'], to: 'SCHEDULED' });
export const archiveCmsPost = (input) =>
  transition({ ...input, from: ['IN_REVIEW', 'SCHEDULED', 'PUBLISHED'], to: 'ARCHIVED' });

export async function listCmsRevisions(postId) {
  await postOr404(postId);
  const revisions = await CmsRevision.find({ postId }).sort({ number: -1 }).lean();
  return revisions.map((revision) => ({
    id: String(revision._id),
    number: revision.number,
    reason: revision.reason,
    actorUserId: revision.actorUserId,
    createdAt: revision.createdAt.toISOString(),
  }));
}

export async function restoreCmsRevision({ request, postId, revisionNumber, reason }) {
  const [post, revision] = await Promise.all([
    postOr404(postId),
    CmsRevision.findOne({ postId, number: revisionNumber }).lean(),
  ]);
  if (!revision) throw new ApiError(404, 'CMS_REVISION_NOT_FOUND', 'Revision not found.');
  const before = { status: post.status, revisionNumber: post.revisionNumber };
  Object.assign(post, revision.snapshot);
  post.status = 'DRAFT';
  post.scheduledAt = null;
  post.publishedAt = null;
  post.archivedAt = null;
  post.updatedByUserId = String(request.adminAuth.user._id);
  await saveRevision(post, request.adminAuth.user._id, reason);
  await recordAdminAudit({
    request,
    action: 'CMS_POST_REVISION_RESTORED',
    resourceType: 'CMS_POST',
    resourceId: post._id,
    before,
    after: { status: post.status, revisionNumber: post.revisionNumber },
    reason,
  });
  return serializeCmsPost(post);
}

export async function deleteCmsPost({ request, postId, reason }) {
  const post = await postOr404(postId);
  if (!['DRAFT', 'ARCHIVED'].includes(post.status)) {
    throw new ApiError(409, 'CMS_DELETE_STATE', 'Only draft or archived posts can be deleted.');
  }
  await Promise.all([CmsRevision.deleteMany({ postId: post._id }), post.deleteOne()]);
  await recordAdminAudit({
    request,
    action: 'CMS_POST_DELETED',
    resourceType: 'CMS_POST',
    resourceId: post._id,
    before: { title: post.title, slug: post.slug, status: post.status },
    reason,
  });
}
