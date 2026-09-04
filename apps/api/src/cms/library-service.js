import { recordAdminAudit } from '../admin/audit.js';
import { User } from '../auth/models/user.js';
import { ApiError } from '../middleware/errors.js';
import { safeOriginalName } from './media.js';
import {
  CmsAuthor,
  CmsCategory,
  CmsMedia,
  CmsPost,
  CmsRevision,
  CmsTag,
} from './models.js';
import { serializeMedia, serializeTaxonomy } from './serializers.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^$()|[\]\\]/g, '\\$&');
}

function duplicate(error) {
  if (error?.code === 11000) {
    throw new ApiError(409, 'CMS_SLUG_EXISTS', 'The selected slug is already in use.');
  }
  throw error;
}

async function itemOr404(model, itemId, label) {
  const item = await model.findById(itemId);
  if (!item) throw new ApiError(404, 'CMS_ITEM_NOT_FOUND', label + ' not found.');
  return item;
}

async function listItems(model, query, serializer) {
  const filter = query.search
    ? { name: new RegExp(escapeRegex(query.search), 'i') }
    : {};
  const skip = (query.page - 1) * query.pageSize;
  const [items, total] = await Promise.all([
    model.find(filter).sort({ name: 1, _id: 1 }).skip(skip).limit(query.pageSize).lean(),
    model.countDocuments(filter),
  ]);
  return {
    items: items.map(serializer),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      pageCount: Math.ceil(total / query.pageSize),
    },
  };
}

export const listCmsCategories = (query) => listItems(CmsCategory, query, serializeTaxonomy);
export const listCmsTags = (query) => listItems(CmsTag, query, serializeTaxonomy);
export const listCmsAuthors = (query) => listItems(CmsAuthor, query, serializeTaxonomy);

async function validateCategory(input, currentId = null) {
  if (!input.parentId) return;
  if (currentId && String(input.parentId) === String(currentId)) {
    throw new ApiError(400, 'CMS_CATEGORY_PARENT', 'A category cannot be its own parent.');
  }
  if (!(await CmsCategory.exists({ _id: input.parentId }))) {
    throw new ApiError(400, 'CMS_CATEGORY_PARENT', 'The parent category does not exist.');
  }
}

async function validateAuthor(input) {
  const [avatar, linkedUser] = await Promise.all([
    input.avatarMediaId ? CmsMedia.exists({ _id: input.avatarMediaId }) : true,
    input.linkedCoreUserId ? User.exists({ _id: input.linkedCoreUserId }) : true,
  ]);
  if (!avatar) throw new ApiError(400, 'CMS_MEDIA_REFERENCE', 'The avatar media does not exist.');
  if (!linkedUser) throw new ApiError(400, 'CMS_USER_REFERENCE', 'The linked core user does not exist.');
}

async function createLibraryItem({ request, model, input, type, validate }) {
  await validate?.(input);
  try {
    const item = await model.create(input);
    await recordAdminAudit({
      request,
      action: 'CMS_' + type + '_CREATED',
      resourceType: 'CMS_' + type,
      resourceId: item._id,
      after: { name: item.name, slug: item.slug },
    });
    return serializeTaxonomy(item);
  } catch (error) {
    duplicate(error);
  }
}

async function updateLibraryItem({ request, model, itemId, input, type, validate }) {
  const item = await itemOr404(model, itemId, type);
  await validate?.(input, item._id);
  const before = { name: item.name, slug: item.slug };
  item.set(input);
  try {
    await item.save();
  } catch (error) {
    duplicate(error);
  }
  await recordAdminAudit({
    request,
    action: 'CMS_' + type + '_UPDATED',
    resourceType: 'CMS_' + type,
    resourceId: item._id,
    before,
    after: { name: item.name, slug: item.slug },
  });
  return serializeTaxonomy(item);
}

export const createCmsCategory = (input) =>
  createLibraryItem({ ...input, model: CmsCategory, type: 'CATEGORY', validate: validateCategory });
export const updateCmsCategory = (input) =>
  updateLibraryItem({ ...input, model: CmsCategory, type: 'CATEGORY', validate: validateCategory });
export const createCmsTag = (input) =>
  createLibraryItem({ ...input, model: CmsTag, type: 'TAG' });
export const updateCmsTag = (input) =>
  updateLibraryItem({ ...input, model: CmsTag, type: 'TAG' });
export const createCmsAuthor = (input) =>
  createLibraryItem({ ...input, model: CmsAuthor, type: 'AUTHOR', validate: validateAuthor });
export const updateCmsAuthor = (input) =>
  updateLibraryItem({ ...input, model: CmsAuthor, type: 'AUTHOR', validate: validateAuthor });

export async function deleteCmsCategory({ request, itemId }) {
  const item = await itemOr404(CmsCategory, itemId, 'Category');
  const inUse = await Promise.all([
    CmsPost.exists({ categoryIds: item._id }),
    CmsCategory.exists({ parentId: item._id }),
  ]);
  if (inUse.some(Boolean)) {
    throw new ApiError(409, 'CMS_ITEM_IN_USE', 'The category is still referenced.');
  }
  await item.deleteOne();
  await recordAdminAudit({
    request,
    action: 'CMS_CATEGORY_DELETED',
    resourceType: 'CMS_CATEGORY',
    resourceId: item._id,
    before: { name: item.name, slug: item.slug },
  });
}

export async function deleteCmsTag({ request, itemId }) {
  const item = await itemOr404(CmsTag, itemId, 'Tag');
  if (await CmsPost.exists({ tagIds: item._id })) {
    throw new ApiError(409, 'CMS_ITEM_IN_USE', 'The tag is still referenced.');
  }
  await item.deleteOne();
  await recordAdminAudit({
    request,
    action: 'CMS_TAG_DELETED',
    resourceType: 'CMS_TAG',
    resourceId: item._id,
    before: { name: item.name, slug: item.slug },
  });
}

export async function listCmsMedia(query) {
  const filter = query.search
    ? {
        $or: [
          { originalName: new RegExp(escapeRegex(query.search), 'i') },
          { alt: new RegExp(escapeRegex(query.search), 'i') },
        ],
      }
    : {};
  const skip = (query.page - 1) * query.pageSize;
  const [items, total] = await Promise.all([
    CmsMedia.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(query.pageSize).lean(),
    CmsMedia.countDocuments(filter),
  ]);
  return {
    items: items.map(serializeMedia),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      pageCount: Math.ceil(total / query.pageSize),
    },
  };
}

export async function uploadCmsMedia({
  request,
  storage,
  settings,
  buffer,
  mimeType,
  originalName,
  metadata,
}) {
  if (!Buffer.isBuffer(buffer) || buffer.length > settings.cmsMediaMaxBytes) {
    throw new ApiError(413, 'CMS_MEDIA_SIZE', 'The image exceeds the configured upload limit.');
  }
  const stored = await storage.put(buffer, mimeType);
  try {
    const media = await CmsMedia.create({
      ...stored,
      originalName: safeOriginalName(originalName),
      mimeType,
      bytes: buffer.length,
      alt: metadata.alt,
      caption: metadata.caption,
      createdByUserId: String(request.adminAuth.user._id),
    });
    await recordAdminAudit({
      request,
      action: 'CMS_MEDIA_UPLOADED',
      resourceType: 'CMS_MEDIA',
      resourceId: media._id,
      after: { originalName: media.originalName, bytes: media.bytes, mimeType: media.mimeType },
    });
    return serializeMedia(media);
  } catch (error) {
    await storage.remove(stored.storageKey);
    throw error;
  }
}

export async function updateCmsMedia({ request, itemId, metadata }) {
  const media = await itemOr404(CmsMedia, itemId, 'Media');
  const before = { alt: media.alt, caption: media.caption };
  media.set(metadata);
  await media.save();
  await recordAdminAudit({
    request,
    action: 'CMS_MEDIA_UPDATED',
    resourceType: 'CMS_MEDIA',
    resourceId: media._id,
    before,
    after: { alt: media.alt, caption: media.caption },
  });
  return serializeMedia(media);
}

export async function deleteCmsMedia({ request, itemId, storage }) {
  const media = await itemOr404(CmsMedia, itemId, 'Media');
  const inUse = await Promise.all([
    CmsPost.exists({
      $or: [
        { coverMediaId: media._id },
        { 'seo.ogMediaId': media._id },
      ],
    }),
    CmsAuthor.exists({ avatarMediaId: media._id }),
    CmsCategory.exists({ 'seo.ogMediaId': media._id }),
    CmsTag.exists({ 'seo.ogMediaId': media._id }),
  ]);
  if (inUse.some(Boolean)) {
    throw new ApiError(409, 'CMS_MEDIA_IN_USE', 'The media item is still referenced.');
  }
  await media.deleteOne();
  await storage.remove(media.storageKey);
  await recordAdminAudit({
    request,
    action: 'CMS_MEDIA_DELETED',
    resourceType: 'CMS_MEDIA',
    resourceId: media._id,
    before: { originalName: media.originalName, storageKey: media.storageKey },
  });
}

export async function cmsOverview() {
  const [postsByStatus, categories, tags, authors, media, revisions] = await Promise.all([
    CmsPost.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    CmsCategory.countDocuments(),
    CmsTag.countDocuments(),
    CmsAuthor.countDocuments(),
    CmsMedia.countDocuments(),
    CmsRevision.countDocuments(),
  ]);
  return {
    posts: Object.fromEntries(postsByStatus.map(({ _id, count }) => [_id, count])),
    categories,
    tags,
    authors,
    media,
    revisions,
  };
}
