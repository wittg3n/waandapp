function valueOf(document) {
  return typeof document?.toObject === 'function'
    ? document.toObject({ versionKey: false })
    : document;
}

const iso = (value) => (value ? new Date(value).toISOString() : null);
const id = (value) => (value == null ? null : String(value));

export function mediaUrl(mediaId) {
  return mediaId ? '/api/v1/blog/media/' + id(mediaId) + '/file' : null;
}

export function serializeCmsPost(document, { includeContent = true } = {}) {
  const post = valueOf(document);
  return {
    id: id(post._id),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    ...(includeContent ? { contentHtml: post.contentHtml } : {}),
    coverMediaId: id(post.coverMediaId),
    categoryIds: (post.categoryIds ?? []).map(id),
    tagIds: (post.tagIds ?? []).map(id),
    authorId: id(post.authorId),
    status: post.status,
    featured: post.featured,
    readingTime: post.readingTime,
    scheduledAt: iso(post.scheduledAt),
    publishedAt: iso(post.publishedAt),
    archivedAt: iso(post.archivedAt),
    seo: {
      title: post.seo?.title ?? null,
      description: post.seo?.description ?? null,
      canonical: post.seo?.canonical ?? null,
      noIndex: post.seo?.noIndex ?? false,
      ogMediaId: id(post.seo?.ogMediaId),
    },
    revisionNumber: post.revisionNumber,
    createdByUserId: post.createdByUserId,
    updatedByUserId: post.updatedByUserId,
    createdAt: iso(post.createdAt),
    updatedAt: iso(post.updatedAt),
  };
}

export function serializeTaxonomy(document) {
  const item = valueOf(document);
  return {
    id: id(item._id),
    name: item.name,
    slug: item.slug,
    description: item.description ?? '',
    ...(Object.hasOwn(item, 'parentId') ? { parentId: id(item.parentId) } : {}),
    ...(Object.hasOwn(item, 'role') ? { role: item.role ?? null } : {}),
    ...(Object.hasOwn(item, 'bio') ? { bio: item.bio ?? '' } : {}),
    ...(Object.hasOwn(item, 'avatarMediaId') ? { avatarMediaId: id(item.avatarMediaId) } : {}),
    ...(Object.hasOwn(item, 'linkedCoreUserId')
      ? { linkedCoreUserId: item.linkedCoreUserId ?? null }
      : {}),
    ...(item.seo
      ? {
          seo: {
            title: item.seo.title ?? null,
            description: item.seo.description ?? null,
            canonical: item.seo.canonical ?? null,
            noIndex: item.seo.noIndex ?? false,
            ogMediaId: id(item.seo.ogMediaId),
          },
        }
      : {}),
    createdAt: iso(item.createdAt),
    updatedAt: iso(item.updatedAt),
  };
}

export function serializeMedia(document) {
  const media = valueOf(document);
  return {
    id: id(media._id),
    url: mediaUrl(media._id),
    originalName: media.originalName,
    mimeType: media.mimeType,
    bytes: media.bytes,
    width: media.width,
    height: media.height,
    alt: media.alt,
    caption: media.caption,
    createdByUserId: media.createdByUserId,
    createdAt: iso(media.createdAt),
    updatedAt: iso(media.updatedAt),
  };
}

export function publicPostSummary(post, relations) {
  const category = relations.categories.get(id(post.categoryIds?.[0])) ?? null;
  const tags = (post.tagIds ?? []).map((value) => relations.tags.get(id(value))).filter(Boolean);
  const author = relations.authors.get(id(post.authorId)) ?? null;
  const coverImage = mediaUrl(post.coverMediaId);
  return {
    id: id(post._id),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage,
    category: category
      ? { name: category.name, slug: category.slug, description: category.description }
      : null,
    tags: tags.map((tag) => tag.name),
    tagDetails: tags.map((tag) => ({ name: tag.name, slug: tag.slug })),
    author: author
      ? {
          name: author.name,
          slug: author.slug,
          role: author.role ?? null,
          bio: author.bio ?? '',
          avatar: mediaUrl(author.avatarMediaId),
        }
      : null,
    featured: Boolean(post.featured),
    readingTime: post.readingTime,
    publishedAt: iso(post.publishedAt),
    createdAt: iso(post.createdAt),
    updatedAt: iso(post.updatedAt),
    seo: {
      title: post.seo?.title ?? null,
      description: post.seo?.description ?? null,
      canonical: post.seo?.canonical ?? null,
      noIndex: post.seo?.noIndex ?? false,
      ogImage: mediaUrl(post.seo?.ogMediaId ?? post.coverMediaId),
    },
  };
}
