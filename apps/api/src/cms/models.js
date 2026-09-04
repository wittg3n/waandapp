import { cmsConnection } from '../infrastructure/mongodb.js';

const { Schema } = cmsConnection.base;
const slugPattern = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;

const seoSchema = new Schema(
  {
    title: { type: String, default: null, trim: true, maxlength: 70 },
    description: { type: String, default: null, trim: true, maxlength: 170 },
    canonical: { type: String, default: null, trim: true, maxlength: 2048 },
    noIndex: { type: Boolean, default: false },
    ogMediaId: { type: Schema.Types.ObjectId, default: null },
  },
  { _id: false, strict: 'throw' },
);

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    slug: { type: String, required: true, trim: true, maxlength: 120, match: slugPattern },
    description: { type: String, default: '', trim: true, maxlength: 500 },
    parentId: { type: Schema.Types.ObjectId, default: null },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true, strict: 'throw', versionKey: false },
);
categorySchema.index({ slug: 1 }, { name: 'cms_category_slug', unique: true });
categorySchema.index({ parentId: 1, name: 1 }, { name: 'cms_category_parent_name' });

const tagSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    slug: { type: String, required: true, trim: true, maxlength: 120, match: slugPattern },
    description: { type: String, default: '', trim: true, maxlength: 300 },
    seo: { type: seoSchema, default: () => ({}) },
  },
  { timestamps: true, strict: 'throw', versionKey: false },
);
tagSchema.index({ slug: 1 }, { name: 'cms_tag_slug', unique: true });
tagSchema.index({ name: 1 }, { name: 'cms_tag_name' });

const authorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    slug: { type: String, required: true, trim: true, maxlength: 120, match: slugPattern },
    role: { type: String, default: null, trim: true, maxlength: 100 },
    bio: { type: String, default: '', trim: true, maxlength: 1000 },
    avatarMediaId: { type: Schema.Types.ObjectId, default: null },
    linkedCoreUserId: { type: String, default: null, trim: true, maxlength: 24 },
  },
  { timestamps: true, strict: 'throw', versionKey: false },
);
authorSchema.index({ slug: 1 }, { name: 'cms_author_slug', unique: true });
authorSchema.index({ name: 1 }, { name: 'cms_author_name' });

const mediaSchema = new Schema(
  {
    storageKey: { type: String, required: true, trim: true, maxlength: 240 },
    originalName: { type: String, required: true, trim: true, maxlength: 240 },
    mimeType: { type: String, enum: ['image/jpeg', 'image/png', 'image/webp'], required: true },
    bytes: { type: Number, required: true, min: 1 },
    width: { type: Number, required: true, min: 1, max: 20000 },
    height: { type: Number, required: true, min: 1, max: 20000 },
    alt: { type: String, required: true, trim: true, minlength: 1, maxlength: 240 },
    caption: { type: String, default: '', trim: true, maxlength: 500 },
    createdByUserId: { type: String, required: true, trim: true, maxlength: 24 },
  },
  { timestamps: true, strict: 'throw', versionKey: false },
);
mediaSchema.index({ storageKey: 1 }, { name: 'cms_media_storage_key', unique: true });
mediaSchema.index({ createdAt: -1, _id: -1 }, { name: 'cms_media_timeline' });

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 180 },
    slug: { type: String, required: true, trim: true, maxlength: 160, match: slugPattern },
    excerpt: { type: String, required: true, trim: true, minlength: 20, maxlength: 360 },
    contentHtml: { type: String, required: true, maxlength: 200000 },
    contentText: { type: String, required: true, maxlength: 100000 },
    coverMediaId: { type: Schema.Types.ObjectId, default: null },
    categoryIds: [{ type: Schema.Types.ObjectId }],
    tagIds: [{ type: Schema.Types.ObjectId }],
    authorId: { type: Schema.Types.ObjectId, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'IN_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
      required: true,
    },
    featured: { type: Boolean, default: false },
    readingTime: { type: Number, required: true, min: 1, max: 120 },
    scheduledAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    archivedAt: { type: Date, default: null },
    seo: { type: seoSchema, default: () => ({}) },
    revisionNumber: { type: Number, default: 0, min: 0, required: true },
    createdByUserId: { type: String, required: true, trim: true, maxlength: 24 },
    updatedByUserId: { type: String, required: true, trim: true, maxlength: 24 },
  },
  { timestamps: true, strict: 'throw', versionKey: false },
);
postSchema.index({ slug: 1 }, { name: 'cms_post_slug', unique: true });
postSchema.index(
  { status: 1, publishedAt: -1, _id: -1 },
  { name: 'cms_post_public_timeline' },
);
postSchema.index({ status: 1, scheduledAt: 1 }, { name: 'cms_post_scheduler' });
postSchema.index(
  { categoryIds: 1, status: 1, publishedAt: -1 },
  { name: 'cms_post_category_public' },
);
postSchema.index({ tagIds: 1, status: 1, publishedAt: -1 }, { name: 'cms_post_tag_public' });
postSchema.index(
  { authorId: 1, status: 1, publishedAt: -1 },
  { name: 'cms_post_author_public' },
);
postSchema.index(
  { title: 'text', excerpt: 'text', contentText: 'text' },
  {
    name: 'cms_post_search',
    default_language: 'none',
    weights: { title: 8, excerpt: 4, contentText: 1 },
  },
);

const revisionSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, required: true },
    number: { type: Number, required: true, min: 1 },
    snapshot: { type: Schema.Types.Mixed, required: true },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    actorUserId: { type: String, required: true, trim: true, maxlength: 24 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, strict: 'throw', versionKey: false },
);
revisionSchema.index(
  { postId: 1, number: -1 },
  { name: 'cms_revision_post_number', unique: true },
);

export const CmsCategory =
  cmsConnection.models.CmsCategory ?? cmsConnection.model('CmsCategory', categorySchema);
export const CmsTag = cmsConnection.models.CmsTag ?? cmsConnection.model('CmsTag', tagSchema);
export const CmsAuthor =
  cmsConnection.models.CmsAuthor ?? cmsConnection.model('CmsAuthor', authorSchema);
export const CmsMedia =
  cmsConnection.models.CmsMedia ?? cmsConnection.model('CmsMedia', mediaSchema);
export const CmsPost =
  cmsConnection.models.CmsPost ?? cmsConnection.model('CmsPost', postSchema);
export const CmsRevision =
  cmsConnection.models.CmsRevision ?? cmsConnection.model('CmsRevision', revisionSchema);

export const CMS_MODELS = Object.freeze([
  CmsCategory,
  CmsTag,
  CmsAuthor,
  CmsMedia,
  CmsPost,
  CmsRevision,
]);
