import { isDeepStrictEqual } from 'node:util';

import { BLOG_INDEX_DEFINITIONS } from './index-names.js';
import { Post } from './models/post.js';

function semanticOptions(index) {
  return {
    unique: index.unique === true,
    sparse: index.sparse === true,
    hidden: index.hidden === true,
    prepareUnique: index.prepareUnique === true,
    expireAfterSeconds: index.expireAfterSeconds ?? null,
    partialFilterExpression: index.partialFilterExpression ?? null,
    collation: index.collation ?? null,
    weights: index.weights ?? null,
    default_language: index.default_language ?? null,
    language_override: index.language_override ?? null,
    textIndexVersion: index.textIndexVersion ?? null,
  };
}

function matchesDefinition(index, definition) {
  const textIndex = Object.values(definition.key).includes('text');
  const keyMatches = textIndex
    ? isDeepStrictEqual(Object.entries(index.key), [
        ['_fts', 'text'],
        ['_ftsx', 1],
      ])
    : isDeepStrictEqual(Object.entries(index.key), Object.entries(definition.key));

  return (
    keyMatches && isDeepStrictEqual(semanticOptions(index), semanticOptions(definition.options))
  );
}

export async function createBlogIndexes() {
  await Post.createIndexes();
}

export async function verifyBlogIndexes(postModel = Post) {
  let existing = [];
  try {
    existing = await postModel.collection.listIndexes().toArray();
  } catch (error) {
    if (error?.code !== 26 && error?.codeName !== 'NamespaceNotFound') throw error;
  }

  const issues = [];
  for (const definition of BLOG_INDEX_DEFINITIONS) {
    const index = existing.find(({ name }) => name === definition.options.name);
    if (!index || !matchesDefinition(index, definition)) {
      issues.push(`blog_posts.${definition.options.name}`);
    }
  }

  if (issues.length > 0) {
    throw new Error(
      `Required blog indexes are missing or invalid: ${issues.join(', ')}. Run db:indexes for missing indexes; invalid same-name indexes require a reviewed drop/rebuild migration.`,
    );
  }
}
