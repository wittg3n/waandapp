import express, { Router } from 'express';

import { requirePermission } from '../admin/authorization.js';
import { PERMISSIONS } from '../admin/permissions.js';
import { validateBody } from '../middleware/errors.js';
import {
  cmsOverview,
  createCmsAuthor,
  createCmsCategory,
  createCmsTag,
  deleteCmsCategory,
  deleteCmsMedia,
  deleteCmsTag,
  listCmsAuthors,
  listCmsCategories,
  listCmsMedia,
  listCmsTags,
  updateCmsAuthor,
  updateCmsCategory,
  updateCmsMedia,
  updateCmsTag,
  uploadCmsMedia,
} from './library-service.js';
import { createLocalMediaStorage } from './media.js';
import {
  archiveCmsPost,
  createCmsPost,
  deleteCmsPost,
  getCmsPost,
  listCmsPosts,
  listCmsRevisions,
  publishCmsPost,
  restoreCmsRevision,
  scheduleCmsPost,
  submitCmsPost,
  updateCmsPost,
} from './post-service.js';
import {
  cmsAuthorBody,
  cmsCategoryBody,
  cmsId,
  cmsListQuery,
  cmsMediaBody,
  cmsPostCreateBody,
  cmsPostsQuery,
  cmsPostUpdateBody,
  cmsReasonBody,
  cmsRestoreBody,
  cmsScheduleBody,
  cmsTagBody,
} from './validation.js';

function validateQuery(schema) {
  return (request, _response, next) => {
    const result = schema.safeParse(request.query);
    if (!result.success) {
      next(result.error);
      return;
    }
    request.validatedQuery = result.data;
    next();
  };
}

function itemId(request) {
  return cmsId.parse(request.params.itemId ?? request.params.postId);
}

function createListRoute(router, path, permission, service) {
  router.get(path, requirePermission(permission), validateQuery(cmsListQuery), async (request, response) => {
    response.json({ data: await service(request.validatedQuery) });
  });
}

export function createCmsAdminRouter({ settings, requireTrustedMutation }) {
  const router = Router();
  const storage = createLocalMediaStorage(settings);

  router.get('/overview', requirePermission(PERMISSIONS.blogAnalyticsRead), async (_request, response) => {
    response.json({ data: await cmsOverview() });
  });

  router.get(
    '/posts',
    requirePermission(PERMISSIONS.blogPostsRead),
    validateQuery(cmsPostsQuery),
    async (request, response) => {
      response.json({ data: await listCmsPosts(request.validatedQuery) });
    },
  );
  router.get('/posts/:postId', requirePermission(PERMISSIONS.blogPostsRead), async (request, response) => {
    response.json({ data: { post: await getCmsPost(itemId(request)) } });
  });
  router.post(
    '/posts',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogPostsCreate),
    validateBody(cmsPostCreateBody),
    async (request, response) => {
      const post = await createCmsPost({ request, input: request.validatedBody });
      response.status(201).json({ data: { post } });
    },
  );
  router.patch(
    '/posts/:postId',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogPostsUpdate),
    validateBody(cmsPostUpdateBody),
    async (request, response) => {
      const post = await updateCmsPost({
        request,
        postId: itemId(request),
        input: request.validatedBody,
      });
      response.json({ data: { post } });
    },
  );
  router.post(
    '/posts/:postId/submit',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogPostsUpdate),
    validateBody(cmsReasonBody),
    async (request, response) => {
      response.json({
        data: {
          post: await submitCmsPost({
            request,
            postId: itemId(request),
            ...request.validatedBody,
          }),
        },
      });
    },
  );
  router.post(
    '/posts/:postId/publish',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogPostsPublish),
    validateBody(cmsReasonBody),
    async (request, response) => {
      response.json({
        data: {
          post: await publishCmsPost({
            request,
            postId: itemId(request),
            ...request.validatedBody,
          }),
        },
      });
    },
  );
  router.post(
    '/posts/:postId/schedule',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogPostsSchedule),
    validateBody(cmsScheduleBody),
    async (request, response) => {
      response.json({
        data: {
          post: await scheduleCmsPost({
            request,
            postId: itemId(request),
            ...request.validatedBody,
          }),
        },
      });
    },
  );
  router.post(
    '/posts/:postId/archive',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogPostsArchive),
    validateBody(cmsReasonBody),
    async (request, response) => {
      response.json({
        data: {
          post: await archiveCmsPost({
            request,
            postId: itemId(request),
            ...request.validatedBody,
          }),
        },
      });
    },
  );
  router.delete(
    '/posts/:postId',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogPostsDelete),
    validateBody(cmsReasonBody),
    async (request, response) => {
      await deleteCmsPost({ request, postId: itemId(request), ...request.validatedBody });
      response.status(204).end();
    },
  );
  router.get(
    '/posts/:postId/revisions',
    requirePermission(PERMISSIONS.blogPostsRead),
    async (request, response) => {
      response.json({ data: { revisions: await listCmsRevisions(itemId(request)) } });
    },
  );
  router.post(
    '/posts/:postId/revisions/restore',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogPostsUpdate),
    validateBody(cmsRestoreBody),
    async (request, response) => {
      response.json({
        data: {
          post: await restoreCmsRevision({
            request,
            postId: itemId(request),
            ...request.validatedBody,
          }),
        },
      });
    },
  );

  createListRoute(router, '/categories', PERMISSIONS.blogCategoriesRead, listCmsCategories);
  router.post(
    '/categories',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogCategoriesCreate),
    validateBody(cmsCategoryBody),
    async (request, response) => {
      response.status(201).json({
        data: {
          category: await createCmsCategory({ request, input: request.validatedBody }),
        },
      });
    },
  );
  router.put(
    '/categories/:itemId',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogCategoriesUpdate),
    validateBody(cmsCategoryBody),
    async (request, response) => {
      response.json({
        data: {
          category: await updateCmsCategory({
            request,
            itemId: itemId(request),
            input: request.validatedBody,
          }),
        },
      });
    },
  );
  router.delete(
    '/categories/:itemId',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogCategoriesDelete),
    async (request, response) => {
      await deleteCmsCategory({ request, itemId: itemId(request) });
      response.status(204).end();
    },
  );

  createListRoute(router, '/tags', PERMISSIONS.blogTagsRead, listCmsTags);
  router.post(
    '/tags',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogTagsCreate),
    validateBody(cmsTagBody),
    async (request, response) => {
      response.status(201).json({
        data: { tag: await createCmsTag({ request, input: request.validatedBody }) },
      });
    },
  );
  router.put(
    '/tags/:itemId',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogTagsUpdate),
    validateBody(cmsTagBody),
    async (request, response) => {
      response.json({
        data: {
          tag: await updateCmsTag({
            request,
            itemId: itemId(request),
            input: request.validatedBody,
          }),
        },
      });
    },
  );
  router.delete(
    '/tags/:itemId',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogTagsDelete),
    async (request, response) => {
      await deleteCmsTag({ request, itemId: itemId(request) });
      response.status(204).end();
    },
  );

  createListRoute(router, '/authors', PERMISSIONS.blogAuthorsRead, listCmsAuthors);
  router.post(
    '/authors',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogAuthorsCreate),
    validateBody(cmsAuthorBody),
    async (request, response) => {
      response.status(201).json({
        data: { author: await createCmsAuthor({ request, input: request.validatedBody }) },
      });
    },
  );
  router.put(
    '/authors/:itemId',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogAuthorsUpdate),
    validateBody(cmsAuthorBody),
    async (request, response) => {
      response.json({
        data: {
          author: await updateCmsAuthor({
            request,
            itemId: itemId(request),
            input: request.validatedBody,
          }),
        },
      });
    },
  );

  createListRoute(router, '/media', PERMISSIONS.blogMediaRead, listCmsMedia);
  router.post(
    '/media',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogMediaUpload),
    express.raw({
      type: ['image/jpeg', 'image/png', 'image/webp'],
      limit: settings.cmsMediaMaxBytes,
    }),
    async (request, response) => {
      const metadata = cmsMediaBody.parse({
        alt: request.query.alt,
        caption: request.query.caption ?? '',
      });
      const media = await uploadCmsMedia({
        request,
        storage,
        settings,
        buffer: request.body,
        mimeType: request.get('content-type')?.split(';')[0],
        originalName: decodeURIComponent(request.get('x-file-name') ?? 'image'),
        metadata,
      });
      response.status(201).json({ data: { media } });
    },
  );
  router.patch(
    '/media/:itemId',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogMediaUpdate),
    validateBody(cmsMediaBody),
    async (request, response) => {
      response.json({
        data: {
          media: await updateCmsMedia({
            request,
            itemId: itemId(request),
            metadata: request.validatedBody,
          }),
        },
      });
    },
  );
  router.delete(
    '/media/:itemId',
    requireTrustedMutation,
    requirePermission(PERMISSIONS.blogMediaDelete),
    async (request, response) => {
      await deleteCmsMedia({ request, itemId: itemId(request), storage });
      response.status(204).end();
    },
  );

  return router;
}
