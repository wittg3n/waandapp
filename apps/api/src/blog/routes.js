import { Router } from 'express';

import { createBlogControllers } from './controllers.js';
import { createBlogService } from './service.js';

export function createBlogRouter(service = createBlogService()) {
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
  router.get('/search', controllers.search);

  return router;
}
