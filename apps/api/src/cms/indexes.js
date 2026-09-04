import {
  CmsAuthor,
  CmsCategory,
  CmsMedia,
  CmsPost,
  CmsRevision,
  CmsTag,
} from './models.js';

const required = [
  { model: CmsCategory, names: ['cms_category_slug', 'cms_category_parent_name'] },
  { model: CmsTag, names: ['cms_tag_slug', 'cms_tag_name'] },
  { model: CmsAuthor, names: ['cms_author_slug', 'cms_author_name'] },
  { model: CmsMedia, names: ['cms_media_storage_key', 'cms_media_timeline'] },
  {
    model: CmsPost,
    names: [
      'cms_post_slug',
      'cms_post_public_timeline',
      'cms_post_scheduler',
      'cms_post_category_public',
      'cms_post_tag_public',
      'cms_post_author_public',
      'cms_post_search',
    ],
  },
  { model: CmsRevision, names: ['cms_revision_post_number'] },
];

export async function createCmsIndexes() {
  await Promise.all(required.map(({ model }) => model.createIndexes()));
}

export async function verifyCmsIndexes() {
  const missing = [];
  for (const { model, names } of required) {
    let indexes = [];
    try {
      indexes = await model.collection.listIndexes().toArray();
    } catch (error) {
      if (error?.code !== 26 && error?.codeName !== 'NamespaceNotFound') throw error;
    }
    const existing = new Set(indexes.map(({ name }) => name));
    for (const name of names) {
      if (!existing.has(name)) missing.push(model.collection.collectionName + '.' + name);
    }
  }
  if (missing.length > 0) {
    throw new Error('Required CMS indexes are missing: ' + missing.join(', '));
  }
}
