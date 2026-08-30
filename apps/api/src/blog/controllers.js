import {
  parseCategoryPostsQuery,
  parsePostsQuery,
  parseSearchQuery,
  parseSlugParams,
} from './validation.js';

function send(response, data) {
  response.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  response.json({ data });
}

export function createBlogControllers(service) {
  return {
    async listPosts(request, response) {
      send(response, await service.listPosts(parsePostsQuery(request.query)));
    },

    async getPost(request, response) {
      const { slug } = parseSlugParams(request.params);
      send(response, await service.getPost(slug));
    },

    async listCategories(_request, response) {
      send(response, await service.listCategories());
    },

    async listCategoryPosts(request, response) {
      const { slug } = parseSlugParams(request.params);
      send(response, await service.listCategoryPosts(slug, parseCategoryPostsQuery(request.query)));
    },

    async search(request, response) {
      send(response, await service.search(parseSearchQuery(request.query)));
    },
  };
}
