import { Router } from 'express';

import { config } from '../config/index.js';
import { createLocalMediaStorage } from '../cms/media.js';
import { createBlogControllers } from './controllers.js';
import { createBlogService } from './service.js';

export function createBlogRouter(
  service = createBlogService(),
  { settings = config, storage = createLocalMediaStorage(settings) } = {},
) {
  const router = Router();
  const controllers = createBlogControllers(service);

  router.use((_request, response, next) => {
    response.setHeader('Content-Language', 'fa');
    next();
  });
  router.get('/posts', controllers.listPosts);
  router.get('/posts/:slug', controllers.getPost);
  router.get('/categories', controllers.listCategories);
  router.get('/categories/:slug/posts', controllers.listCategoryPosts);
  router.get('/tags', controllers.listTags);
  router.get('/tags/:slug/posts', controllers.listTagPosts);
  router.get('/authors/:slug/posts', controllers.listAuthorPosts);
  router.get('/search', controllers.search);
  router.get('/media/:mediaId/file', async (request, response) => {
    const media = await service.getMediaFile(request.params.mediaId);
    response.setHeader('Content-Type', media.mimeType);
    response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    response.sendFile(storage.path(media.storageKey));
  });

  return router;
}
