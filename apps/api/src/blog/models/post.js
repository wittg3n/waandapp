import mongoose from 'mongoose';

import { BLOG_INDEX_DEFINITIONS } from '../index-names.js';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const coverPattern = /^\/covers\/[a-z0-9-]+\.svg$/;

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    slug: { type: String, required: true, trim: true, maxlength: 100, match: slugPattern },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 240 },
  },
  { _id: false, strict: 'throw' },
);

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    role: { type: String, trim: true, maxlength: 100, default: null },
  },
  { _id: false, strict: 'throw' },
);

const seoSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: 70, default: null },
    description: { type: String, trim: true, maxlength: 170, default: null },
    canonical: {
      type: String,
      trim: true,
      maxlength: 2_048,
      default: null,
      validate: {
        validator: (value) => value === null || /^https?:\/\//i.test(value),
        message: 'Canonical URL must be an absolute HTTP(S) URL.',
      },
    },
    ogImage: {
      type: String,
      trim: true,
      maxlength: 2_048,
      default: null,
      validate: {
        validator: (value) =>
          value === null || coverPattern.test(value) || /^https:\/\//i.test(value),
        message: 'Open Graph image must be a local cover path or HTTPS URL.',
      },
    },
  },
  { _id: false, strict: 'throw' },
);

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 180 },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
      match: slugPattern,
    },
    excerpt: { type: String, required: true, trim: true, minlength: 20, maxlength: 360 },
    content: { type: String, required: true, trim: true, minlength: 100, maxlength: 100_000 },
    coverImage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2_048,
      match: coverPattern,
    },
    category: { type: categorySchema, required: true },
    tags: {
      type: [{ type: String, trim: true, minlength: 2, maxlength: 50 }],
      required: true,
      validate: {
        validator: (tags) =>
          tags.length >= 1 && tags.length <= 8 && new Set(tags).size === tags.length,
        message: 'Tags must contain between one and eight unique values.',
      },
    },
    author: { type: authorSchema, required: true },
    status: {
      type: String,
      enum: ['draft', 'published'],
      required: true,
      default: 'draft',
    },
    featured: { type: Boolean, required: true, default: false },
    readingTime: { type: Number, required: true, min: 1, max: 60 },
    publishedAt: { type: Date, default: null },
    seo: { type: seoSchema, default: () => ({}) },
  },
  {
    collection: 'blog_posts',
    timestamps: true,
    strict: 'throw',
    versionKey: false,
  },
);

for (const { key, options } of BLOG_INDEX_DEFINITIONS) postSchema.index(key, options);

postSchema.pre('validate', function validatePublicationState() {
  if (this.status === 'published' && !this.publishedAt) {
    this.invalidate('publishedAt', 'Published posts require a publication date.');
  }
});

export const Post = mongoose.models.BlogPost ?? mongoose.model('BlogPost', postSchema);
